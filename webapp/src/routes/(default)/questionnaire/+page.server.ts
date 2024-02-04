/**
 * Save questionnaire answers to the database.
 */

import { redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { saveQuestionnaireResponses } from '$lib/server/questionnaire';
import { redirectToCurrentStage } from '$lib/server/redirect.js';

export function load({ locals }) {
    const participant = locals.expectParticipant();
    if (participant.stage != 'pre-questionnaire') throw redirectToCurrentStage(participant.stage);
    return {};
}

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, locals }) => {
        const participant = locals.expectParticipant();
        await saveQuestionnaireResponses(participant.participant_id, request);
        throw redirect(StatusCodes.SEE_OTHER, '/briefing');
    }
};
