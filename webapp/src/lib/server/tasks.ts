import * as fs from 'fs';

import type { RootGCCDiagnostic } from '$lib/types/diagnostics';
import type { MarkdownString, SHA256Hash } from './newtypes';
import { hashSourceCode } from './hash';
import type { RawLLMResponse } from './llm';
import type { TaskName, JsonMarkerData } from '$lib/types';

export const TASKS: Task[] = [];

export interface Task {
    /** An arbitrary name for the task. */
    name: TaskName;
    /** Full source code to show the user. */
    sourceCode: string;
    /** Hash of the source code. */
    hash: SHA256Hash;
    /** GCC diagnostics from -fdiagnostics-format=json */
    rawGccDiagnostics: RootGCCDiagnostic[];
    /** Manually-written enhanced error message. */
    manuallyEnhancedMessage: MarkdownString;
    /** Markers for the manually--written messsage. */
    manuallyEnhancedMessageMarkers: JsonMarkerData[];
    /** Response directly from OpenAI API. */
    rawLlmResponse: RawLLMResponse;
}

/**
 * Loading the tasks synchronously on server startup is okay because it only
 * happens once, and the data never changes.  That said... if the tasks DO
 * change, you need to restart the server. Yes, even in dev mode!
 * @param tasksDir path to tasks
 */
export function loadTasksSync(tasksDir: string) {
    // Sorry about this :/

    // First, figure out what the task names are from the folder names
    const taskDirectories = fs
        .readdirSync(tasksDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory());

    // Each directory is a task:
    for (const taskDir of taskDirectories) {
        // Skip the +common/ directory
        if (taskDir.name == '+common') continue;

        const name = taskDir.name as TaskName;

        const sourceCode = fs.readFileSync(`${tasksDir}/${name}/main.c`, 'utf-8');
        const hash = hashSourceCode(sourceCode);
        const rawGccDiagnostics = JSON.parse(
            fs.readFileSync(`${tasksDir}/${name}/gcc-diagnostics.json`, 'utf-8')
        );
        const manuallyEnhancedMessage = fs.readFileSync(
            `${tasksDir}/${name}/manual-explanation.md`,
            'utf-8'
        ) as MarkdownString;
        const rawLlmResponse = JSON.parse(
            fs.readFileSync(`${tasksDir}/${name}/gpt4-response.json`, 'utf-8')
        ) as RawLLMResponse;

        const manuallyEnhancedMessageMarkers = JSON.parse(
            fs.readFileSync(`${tasksDir}/${name}/manual-markers.json`, 'utf-8')
        ) as JsonMarkerData[];

        TASKS.push({
            name,
            sourceCode,
            hash,
            rawGccDiagnostics,
            manuallyEnhancedMessage,
            manuallyEnhancedMessageMarkers,
            rawLlmResponse
        });
    }
}

/**
 * Returns the task with the given name. If the task doesn't exist, throws an error.
 */
export function getTaskByName(name: string): Task {
    const task = TASKS.find((t) => t.name === name);
    if (!task) throw new Error(`No task found with name ${name}`);
    return task;
}

/**
 * @returns all tasks names loaded into the server
 */
export function taskNames(): TaskName[] {
    return TASKS.map((t) => t.name);
}
