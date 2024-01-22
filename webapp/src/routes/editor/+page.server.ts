/**
 * Load and submit handlers for the exercise page (code editor).
 */

import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import {
    getParticipantAssignment,
    logExerciseAttemptCompleted,
    setParticipantStage
} from '$lib/server/database';
import type { ExerciseId } from '$lib/server/newtypes';
import { getTaskByName, type Task } from '$lib/server/tasks';
import { nextStage } from '$lib/types';
import { makeDiagnosticsFromTask } from '$lib/server/diagnostics-util';

/**
 * Determine the participant's task for the participant's current exercise,
 * then return the task and initial error message.
 */
export async function load({ locals }) {
    if (!locals.participant) throw error(StatusCodes.UNAUTHORIZED, 'No participant found');
    const participant = locals.participant;
    if (!participant.stage.startsWith('exercise-'))
        throw error(StatusCodes.BAD_REQUEST, "Participant's stage is not an exercise");

    const exercise = participant.stage as ExerciseId;
    const currentAssignment = await getParticipantAssignment(participant.participant_id, exercise);
    if (!currentAssignment)
        throw error(StatusCodes.INTERNAL_SERVER_ERROR, 'No assignment found for participant');

    const taskName = currentAssignment.task as Task['name'];
    const condition = currentAssignment.condition;
    // The programming language is hardcoded for now:
    const language = 'c';

    const task = getTaskByName(taskName);
    const diagnostics = makeDiagnosticsFromTask(task, condition);

    return {
        exercise,
        condition,
        language,
        initialSourceCode: task.sourceCode,
        initialDiagnostics: diagnostics
    };
}

export const actions: import('./$types').Actions = {
    /**
     * Stores code submission in the database.
     */
    submit: async ({ request, locals }) => {
        const participant = locals.participant;
        if (!participant) throw error(StatusCodes.UNAUTHORIZED, 'No participant found');

        if (!participant.stage.startsWith('exercise-'))
            throw error(
                StatusCodes.BAD_REQUEST,
                'Participant is not currently supposed to be doing an exercise'
            );

        const form = await request.formData();
        const reason = form.get('reason');
        if (!(reason === 'completed' || reason === 'timeout' || reason === 'skip'))
            throw error(StatusCodes.BAD_REQUEST, 'not a good reason');
        const exercise = participant.stage as ExerciseId;
        await logExerciseAttemptCompleted(participant.participant_id, exercise, reason);
        await setParticipantStage(participant.participant_id, nextStage(participant.stage));

        throw redirect(StatusCodes.SEE_OTHER, '/post-exercise-questionnaire');
    }
};
