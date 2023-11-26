import { error, json } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { logExerciseAttemptStart } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/newtypes';
import { toCondition, toExerciseId } from '$lib/server/util';

/**
 * Starts an exercise.
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function POST({ cookies, request }) {
    const participantId = cookies.get('participant_id') as ParticipantId;
    if (!participantId) throw error(StatusCodes.BAD_REQUEST, 'No participantId cookie found');

    const data = await request.formData();
    const exerciseId = toExerciseId(data.get('exerciseId'));
    if (exerciseId === null) throw error(StatusCodes.BAD_REQUEST, 'No exerciseId provided');
    let condition = toCondition(data.get('condition'));
    if (condition === null) {
        console.warn("Received null condition, defaulting to 'control'");
        condition = 'control';
    }

    // Insert into the database.
    await logExerciseAttemptStart(participantId, exerciseId, condition);

    // I don't know what should be returned here.
    return json({ success: true, exerciseId });
}
