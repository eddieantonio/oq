/**
 * Save questionnaire answers to the database.
 */

import { error } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { saveAnswers } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/participants';

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, cookies }) => {
        const participant = cookies.get('participant_id') as ParticipantId;
        if (!participant) throw error(StatusCodes.BAD_REQUEST, 'No ParticipantId found');

        const data = await request.formData();

        // Create an Answer record for each field in form data
        const answers = [];
        for (const [key, value] of data.entries()) {
            if (typeof value !== 'string') {
                throw error(StatusCodes.BAD_REQUEST, 'Cannot upload file as answer');
            }

            answers.push({
                participant_id: participant,
                question_id: key,
                answer: value
            });
        }

        await saveAnswers(answers);
        // TODO: go to next page.
    }
};
