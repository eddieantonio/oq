import { error } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { saveAnswers, type Answer, saveAnswersForExercise } from '$lib/server/database';
import type { ExerciseId, ParticipantId } from './newtypes';

/**
 * Stores the answers to questionnaire in the database.
 *
 * At present, this will store ALL entries in the form data as answers.
 */
export async function saveQuestionnaireResponses(participant: ParticipantId, request: Request) {
    const data = await request.formData();
    const answers = convertFormDataToAnswers(participant, data);
    await saveAnswers(answers);
}

/**
 * Stores the answers to questionnaire in the database.
 */
export async function savePostExerciseQuestionnaireResponses(
    participant: ParticipantId,
    exercise: ExerciseId,
    request: Request
) {
    const data = await request.formData();
    const answers = convertFormDataToAnswers(participant, data);
    await saveAnswersForExercise(exercise, answers);
}

/**
 * Create an Answer record for each and every field in form data.
 */
export function convertFormDataToAnswers(participant: ParticipantId, data: FormData): Answer[] {
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

    return answers;
}
