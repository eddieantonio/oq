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

/**
 * Load all of the current participant's assignments.
 */
export async function load({ locals }) {
    if (!locals.participant) throw error(StatusCodes.UNAUTHORIZED, 'Not logged in');
    const participant = locals.participant;

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

    // Convert to an array of plain objects.
    const styles = [];
    for (const [condition, pems] of pemsByCondition.entries()) {
        styles.push({
            condition,
            pems
        });
    }
    // We shuffle so that participants each participant sees the study conditions in a different order:
    shuffle(styles);

    return {
        pems,
        styles
    };
}

function formatToCondition(format: Diagnostics['format']): Condition {
    switch (format) {
        case 'gcc-json':
            return 'control';
        case 'manually-enhanced':
            return 'enhanced';
        case 'llm-enhanced':
            return 'llm-enhanced';
    }
}

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, locals }) => {
        if (!locals.participant) throw error(StatusCodes.UNAUTHORIZED, 'Not logged in');

        if (locals.participant.stage != 'final-questionnaire')
            throw error(StatusCodes.BAD_REQUEST, 'Not at the correct stage');

        const participantId = locals.participant.participant_id;
        await saveQuestionnaireResponses(participantId, request);
        // On the post-questionnaire page, we do not have to change the stage.
        // The user can advance and go back to this page if they want to change their answers.

        throw redirect(StatusCodes.SEE_OTHER, '/before-submit');
    }
};
