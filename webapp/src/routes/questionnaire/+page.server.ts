/**
 * Save answers to the database.
 */
import { error } from '@sveltejs/kit';

import { StatusCodes } from 'http-status-codes';

import { saveAnswer } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/participants';

export const actions: import('./$types').Actions = {
    /**
     * POST to save the answers and continue to the next page.
     */
    default: async ({ request, cookies }) => {
        const participant = cookies.get('participant_id') as ParticipantId;
        if (!participant) throw error(StatusCodes.BAD_REQUEST, 'No ParticipantId found');

        const data = await request.formData();

        // create a question record for each thing in form data
        for (const [key, value] of data.entries()) {
            if (typeof value !== 'string') {
                console.error('Got a non-string value. Ignoring...');
                continue;
            }

            // TODO: batch save answers
            await saveAnswer({
                participant_id: participant,
                question_id: key,
                answer: value
            });
        }

        // TODO: go to next page.
    }
};
