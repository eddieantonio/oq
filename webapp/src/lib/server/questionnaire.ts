import { error } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { saveAnswers, type Answer, saveAnswersForExercise } from '$lib/server/database';
import type { ExerciseId, ParticipantId } from './newtypes';

/**
 * Separates responses to <Checkboxes> answers. Slightly better than using a
 * comma, semicolon, etc.  This is actually defined in ASCII! But nobody uses
 * it, perhaps because it's not easy to type (that's the point!)
 */
const UNIT_SEPARATOR = '\u001f';

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
    const map = new Map<string, string[]>();

    // First, get all the answers from the form data
    for (const [key, value] of data.entries()) {
        if (typeof value !== 'string') {
            throw error(StatusCodes.BAD_REQUEST, 'Cannot upload file as answer');
        }

        // Append to existing answer if it already exists
        // We're doing this for the <Checkboxes> answers
        const items = map.get(key);
        if (items == null) {
            map.set(key, [value]);
        } else {
            items.push(value);
        }
    }

    // Now convert it in into an array of Answer records
    const answers = [];
    for (const [key, items] of map.entries()) {
        answers.push({
            participant_id: participant,
            question_id: key,
            answer: items.join(UNIT_SEPARATOR)
        });
    }

    return answers;
}
