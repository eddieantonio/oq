import { error, json } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { logExerciseAttemptStart } from '$lib/server/database';
import type { ExerciseId } from '$lib/server/newtypes';

/**
 * Starts an exercise.
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function POST({ locals }) {
    const participant = locals.participant;
    if (!participant) throw error(StatusCodes.UNAUTHORIZED, 'Not logged in');

    const participantId = participant.participant_id;
    const exerciseId = participant.stage as ExerciseId;

    // Insert into the database.
    await logExerciseAttemptStart(participantId, exerciseId);

    // I don't know what should be returned here.
    return json({ success: true, exerciseId });
}
