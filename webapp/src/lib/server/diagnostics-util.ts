import type { Condition, TaskName } from '$lib/types';
import type { Diagnostics, GCCDiagnostics, RootGCCDiagnostic } from '$lib/types/diagnostics';
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
        diagnostics: [getFirstGCCError(task.rawGccDiagnostics)]
    };

    switch (condition) {
        case 'control':
            return original;
        case 'enhanced':
            return {
                format: 'manually-enhanced',
                markdown: task.manuallyEnhancedMessage,
                markers: task.manuallyEnhancedMessageMarkers
            };
        case 'llm-enhanced':
            return {
                format: 'llm-enhanced',
                markdown: getMarkdownResponse(task.rawLlmResponse),
                original
            };
    }
}

/**
 * @returns the first error diagnostic in the given GCC diagnostics.
 */
export function getFirstGCCError(diagnostics: RootGCCDiagnostic[]): RootGCCDiagnostic {
    const firstError = diagnostics.find((d) => d.kind === 'error');
    if (!firstError)
        throw new Error(`No error found in GCC diagnostics: ${JSON.stringify(diagnostics)}`);
    return firstError;
}
