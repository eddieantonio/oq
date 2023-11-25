import { error, type Cookies } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { saveAnswers } from '$lib/server/database';
import type { ParticipantId } from './newtypes';

/**
 * Stores the answers to questionnaire in the database.
 *
 * At present, this will store ALL entries in the form data as answers.
 */
export async function saveQuestionnaireResponses(cookies: Cookies, request: Request) {
    // Ensure the participant is logged in
    const participant = cookies.get('participant_id') as ParticipantId;
    if (!participant) throw error(StatusCodes.BAD_REQUEST, 'No ParticipantId found');

    // Parse the form data
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
}
