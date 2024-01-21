/**
 * Save post-questionnaire answers to the database.
 */

import { getParticipantIdFromCookies } from '$lib/server/participants';
import { saveQuestionnaireResponses } from '$lib/server/questionnaire';
import { redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, cookies }) => {
        const participant = getParticipantIdFromCookies(cookies);
        // TODO: figure out which exercise was just completed, and redirect to the correct place (either the next exercise, or before-submit)
        await saveQuestionnaireResponses(participant, request);

        throw redirect(StatusCodes.SEE_OTHER, '/before-submit');
    }
};
