import { error, redirect } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { logExerciseAttemptCompleted, setParticipantStage } from '$lib/server/database';
import type { ExerciseId } from '$lib/server/newtypes';
import { TASKS, type Task } from '$lib/server/tasks';
import { toExerciseId } from '$lib/server/util';
import type { Diagnostics, GCCDiagnostics } from '$lib/types/diagnostics';
import type { Condition } from '$lib/types';
import { getMarkdownResponse } from '$lib/server/llm';
import { getParticipantIdFromCookies } from '$lib/server/participants';

/**
 * Determine the participant's task for the participant's current exercise,
 * then return the task and initial error message.
 */
export function load() {
    // TODO: load the participant's progress from the database.
    // Just hardcoded for now.
    const taskName: Task['name'] = 'medium';
    const condition: Condition = 'enhanced';
    // TODO: figure this out from participant data structure.
    const exercise = 'exercise-1' as ExerciseId;
    const language = 'c';

    const task = TASKS.find((t) => t.name === taskName);
    if (!task)
        throw error(StatusCodes.INTERNAL_SERVER_ERROR, `No task found with name ${taskName}`);

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
    submit: async ({ cookies, request }) => {
        const participant = getParticipantIdFromCookies(cookies);

        const form = await request.formData();
        const exercise = toExerciseId(form.get('exerciseId'));
        if (exercise == null) throw error(StatusCodes.BAD_REQUEST, 'No ExerciseId found');

        await logExerciseAttemptCompleted(participant, exercise, 'completed');
        // TODO: figure out which experiment we're in, then increment.
        await setParticipantStage(participant, 'post-exercise-1');

        throw redirect(StatusCodes.SEE_OTHER, '/post-questionnaire');
    }
};

// Internal functions

/**
 * @returns The diagnostics for the given task and condition.
 */
function makeDiagnosticsFromTask(task: Task, condition: Condition): Diagnostics {
    const original: GCCDiagnostics = {
        format: 'gcc-json',
        diagnostics: task.rawGccDiagnostics
    };

    switch (condition) {
        case 'control':
            return original;
        case 'enhanced':
            return {
                format: 'manually-enhanced',
                markdown: task.manuallyEnhancedMessage
            };
        case 'llm-enhanced':
            return {
                format: 'llm-enhanced',
                markdown: getMarkdownResponse(task.rawLlmResponse),
                original
            };
    }
}
