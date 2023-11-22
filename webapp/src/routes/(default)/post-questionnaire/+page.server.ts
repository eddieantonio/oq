/**
 * Save post-questionnaire answers to the database.
 */

import { saveQuestionnaireResponses } from '$lib/server/questionnaire';
import { redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, cookies }) => {
        await saveQuestionnaireResponses(cookies, request);
        throw redirect(StatusCodes.SEE_OTHER, '/before-submit');
    }
};
