import type { Condition, TaskName } from '$lib/types';
import type { Diagnostics, RootGCCDiagnostic } from '$lib/types/diagnostics';
import type { ParticipantAssignment } from './database';
import { getTaskByName, type Task } from './tasks';

/**
 * @returns The diagnostics for the given assignment.
 */
export function makeDiagnosticsForAssignment(assignment: ParticipantAssignment): Diagnostics {
    const task = getTaskByName(assignment.task as TaskName);
    return diagnosticsForCondition(task, assignment.condition);
}

/**
 * @returns The diagnostics for the given task and condition.
 */
export function diagnosticsForCondition(task: Task, condition: Condition): Diagnostics {
    return task.diagnostics[condition];
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
