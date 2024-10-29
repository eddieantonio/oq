/**
 * Save post-questionnaire answers to the database.
 */

import { StatusCodes } from 'http-status-codes';
import { error, redirect } from '@sveltejs/kit';

import { saveQuestionnaireResponses } from '$lib/server/questionnaire';
import { getAllParticipantAssignments } from '$lib/server/database.js';
import { makeDiagnosticsForAssignment } from '$lib/server/diagnostics-util';
import type { Diagnostics } from '$lib/types/diagnostics';
import { shuffle } from '$lib/random.js';
import type { Condition } from '$lib/types';
import { redirectToCurrentStage } from '$lib/server/redirect';

/**
 * Load all of the current participant's assignments.
 */
export async function load({ locals }) {
    const participant = locals.expectParticipant();
    if (participant.stage != 'final-questionnaire') redirectToCurrentStage(participant.stage);

    const allAssignments = await getAllParticipantAssignments(participant.participant_id);
    const pems: Diagnostics[] = allAssignments.map(makeDiagnosticsForAssignment);

    // Group PEMs by condition
    const pemsByCondition = new Map<Condition, Diagnostics[]>();
    for (const pem of pems) {
        const condition = formatToCondition(pem.format);
        const entry = pemsByCondition.get(condition);
        if (!entry) pemsByCondition.set(condition, [pem]);
        else entry.push(pem);
    }

    // Convert groups into to an array of plain objects.
    const styles = Array.from(pemsByCondition.entries()).map(([condition, pems]) => ({
        condition,
        pems
    }));

    // We shuffle so that participants each participant to prevent the
    // participants from just selecting the first option -- they have to make a
    // choice.
    shuffle(styles);

    return {
        styles
    };
}

/**
 * @deprecated the condition should NOT be a function of the diagnostics format, but here we are
 */
function formatToCondition(format: Diagnostics['format']): Condition {
    switch (format) {
        case 'gcc-json':
        case 'parsed-python':
        case 'rustc-json':
        case 'preformatted':
            return 'control';
        case 'manually-enhanced':
            return 'enhanced';
        case 'llm-enhanced':
            return 'llm-enhanced';
        case 'markdown':
            // Ideally, this function should not exist.
            return 'finetuned';
        /* NOTE! I intentionally do not use a case for
         *  default:
         *      return 'control';
         * because I want the compiler errors to remind me of my shame. */
    }
}

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, locals }) => {
        const participant = locals.expectParticipant();

        if (participant.stage != 'final-questionnaire')
            throw error(StatusCodes.BAD_REQUEST, 'Not at the correct stage');

        const participantId = participant.participant_id;
        await saveQuestionnaireResponses(participantId, request);
        // On the post-questionnaire page, we do not have to change the stage.
        // The user can advance and go back to this page if they want to change their answers.

        throw redirect(StatusCodes.SEE_OTHER, '/before-submit');
    }
};
