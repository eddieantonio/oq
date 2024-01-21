import type { Condition, TaskName } from '$lib/types';
import type { Diagnostics, GCCDiagnostics } from '$lib/types/diagnostics';
import type { ParticipantAssignment } from './database';
import { getMarkdownResponse } from './llm';
import { getTaskByName, type Task } from './tasks';

/**
 * @returns The diagnostics for the given assignment.
 */
export function makeDiagnosticsForAssignment(assignment: ParticipantAssignment): Diagnostics {
    const task = getTaskByName(assignment.task as TaskName);
    return makeDiagnosticsFromTask(task, assignment.condition);
}

/**
 * @returns The diagnostics for the given task and condition.
 */
export function makeDiagnosticsFromTask(task: Task, condition: Condition): Diagnostics {
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
