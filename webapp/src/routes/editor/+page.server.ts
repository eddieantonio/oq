/**
 * Save code submission to the database.
 */

import { logExerciseAttemptCompleted } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/newtypes';
import { toExerciseId } from '$lib/server/util';
import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

export const actions: import('./$types').Actions = {
    /**
     * POST to submit the code solution.
     */
    submit: async ({ cookies, request }) => {
        const participant = cookies.get('participant_id') as ParticipantId;
        if (!participant) throw error(StatusCodes.BAD_REQUEST, 'No ParticipantId found');

        const form = await request.formData();
        const exercise = toExerciseId(form.get('exerciseId'));
        if (exercise == null) throw error(StatusCodes.BAD_REQUEST, 'No ExerciseId found');

        await logExerciseAttemptCompleted(participant, exercise, 'completed');

        throw redirect(StatusCodes.SEE_OTHER, '/post-questionnaire');
    }
};
