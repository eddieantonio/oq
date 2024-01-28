/**
 * Load and submit handlers for the exercise page (code editor).
 */

import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import {
    logExerciseAttemptCompleted,
    setParticipantStage,
    getCurrentParticipantAssignment
} from '$lib/server/database';
import type { ExerciseId } from '$lib/server/newtypes';
import { getTaskByName } from '$lib/server/tasks';
import { nextStage } from '$lib/types';
import { makeDiagnosticsFromTask } from '$lib/server/diagnostics-util';
import { redirectToCurrentStage } from '$lib/server/redirect';

const TIMEOUT = 10 * 60 * 1000; // milliseconds
const SKIP_TIMEOUT = TIMEOUT / 2;

/**
 * Determine the participant's task for the participant's current exercise,
 * then return the task and initial error message.
 */
export async function load({ locals }) {
    const participant = locals.participant;
    if (!participant) throw error(StatusCodes.UNAUTHORIZED, 'No participant found');

    if (!participant.stage.startsWith('exercise-')) redirectToCurrentStage(participant.stage);

    const exercise = participant.stage as ExerciseId;
    const [currentAssignment, startedAt] = await getCurrentParticipantAssignment(
        participant.participant_id,
        exercise
    );
    if (!currentAssignment)
        throw error(StatusCodes.INTERNAL_SERVER_ERROR, 'No assignment found for participant');

    const condition = currentAssignment.condition;
    // The programming language is hardcoded for now:
    const language = 'c';

    const task = getTaskByName(currentAssignment.task);
    const diagnostics = makeDiagnosticsFromTask(task, condition);

    // Figure out how much time they have left:
    let timeout = TIMEOUT;
    let skipTimeout = SKIP_TIMEOUT;
    if (startedAt) {
        const timeElapsed = new Date().valueOf() - startedAt;
        timeout = Math.max(timeout - timeElapsed, 0);
        skipTimeout = Math.max(skipTimeout - timeElapsed, 0);
    }

    return {
        exercise,
        language,
        initialSourceCode: task.sourceCode,
        initialDiagnostics: diagnostics,
        timeout,
        skipTimeout
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
        if (!(reason === 'submitted' || reason === 'skipped' || reason === 'timed-out'))
            throw error(StatusCodes.BAD_REQUEST, 'not a good reason');
        const exercise = participant.stage as ExerciseId;
        await logExerciseAttemptCompleted(participant.participant_id, exercise, reason);
        await setParticipantStage(participant.participant_id, nextStage(participant.stage));

        throw redirect(StatusCodes.SEE_OTHER, '/post-exercise-questionnaire');
    }
};
