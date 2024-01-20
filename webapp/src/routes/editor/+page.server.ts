import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { logExerciseAttemptCompleted } from '$lib/server/database';
import type { ExerciseId, ParticipantId } from '$lib/server/newtypes';
import { TASKS, type Task } from '$lib/server/tasks';
import { toExerciseId } from '$lib/server/util';
import type { Diagnostics } from '$lib/types/diagnostics';
import type { Condition } from '$lib/types';

/**
 * Determine the participant's task for the participant's current exercise,
 * then return the task and initial error message.
 */
export function load() {
    // TODO: load the participant's progress from the database.
    // Just hardcoded for now.
    const taskName: Task['name'] = 'medium';
    const condition: Condition = 'control';
    const exercise = 'a' as ExerciseId;
    const language = 'c';

    const task = TASKS.find((t) => t.name === taskName);
    if (!task)
        throw error(StatusCodes.INTERNAL_SERVER_ERROR, `No task found with name ${taskName}`);

    const diagnostics: Diagnostics = {
        format: 'gcc-json',
        diagnostics: task.rawGccDiagnostics
    };

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
