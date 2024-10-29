import { error } from '@sveltejs/kit';

import { diagnosticsForCondition } from '$lib/server/diagnostics-util';
import { getTaskByName } from '$lib/server/tasks';
import { CONDITIONS, type Condition } from '$lib/types';

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

    const diagnostics = diagnosticsForCondition(task, condition);

    return {
        language: task.language,
        filename: task.filename,
        initialSourceCode: task.sourceCode,
        initialDiagnostics: diagnostics
    };
}

function validCondition(condition: unknown): condition is Condition {
    return (CONDITIONS as readonly string[]).includes(String(condition));
}
