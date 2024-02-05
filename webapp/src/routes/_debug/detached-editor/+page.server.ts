import { error } from '@sveltejs/kit';

import { makeDiagnosticsFromTask } from '$lib/server/diagnostics-util';
import { getTaskByName } from '$lib/server/tasks';
import type { Condition } from '$lib/types';

/**
 * Loads the requested task for the debug editor.
 *
 * @type {import('@sveltejs/kit').Load}
 */
export function load({ url }) {
    const taskName = url.searchParams.get('task');
    if (!taskName) throw error(400, `Task not found: ${taskName}`);
    const condition = url.searchParams.get('condition');
    if (!validCondition(condition)) throw error(400, 'Must specify a valid condition.');

    const task = getTaskByName(taskName);
    if (!task) throw error(404, `Task not found: ${taskName}`);

    const diagnostics = makeDiagnosticsFromTask(task, condition);

    return {
        // TODO: do not hardcode the next two fields:
        language: 'c',
        filename: 'main.c',
        initialSourceCode: task.sourceCode,
        initialDiagnostics: diagnostics
    };
}

function validCondition(condition: unknown): condition is Condition {
    return condition === 'control' || condition === 'enhanced' || condition === 'llm-enhanced';
}
