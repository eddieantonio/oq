import { error, json } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { logExerciseAttemptStart } from '$lib/server/database';
import { toCondition, toExerciseId } from '$lib/server/util';
import { getParticipantIdFromCookies } from '$lib/server/participants.js';

/**
 * Starts an exercise.
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function POST({ cookies, request }) {
    const participantId = getParticipantIdFromCookies(cookies);

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
