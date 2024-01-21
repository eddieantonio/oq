/**
 * Save questionnaire answers to the database.
 */

import { redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { saveQuestionnaireResponses } from '$lib/server/questionnaire';
import { setParticipantStage } from '$lib/server/database';
import { getParticipantIdFromCookies } from '$lib/server/participants';

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, cookies }) => {
        const participant = getParticipantIdFromCookies(cookies);
        await saveQuestionnaireResponses(participant, request);
        // TODO: this should actually be in the "briefing" page.
        await setParticipantStage(participant, 'exercise-1');

        throw redirect(StatusCodes.SEE_OTHER, '/editor');
    }
};
