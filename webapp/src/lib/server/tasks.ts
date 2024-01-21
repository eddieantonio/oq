import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type { RootGCCDiagnostic } from '$lib/types/diagnostics';
import type { MarkdownString, SHA256Hash } from './newtypes';
import { hashSourceCode } from './hash';
import type { RawLLMResponse } from './llm';
import { TASK_NAMES, type TaskName } from '$lib/types';

export const TASKS: Task[] = [];

export interface Task {
    /** One of 'easy', 'medium', 'hard' */
    name: TaskName;

    /** Full source code to show the user. */
    sourceCode: string;
    /** Hash of the source code. */
    hash: SHA256Hash;
    /** GCC diagnostics from -fdiagnostics-format=json */
    rawGccDiagnostics: RootGCCDiagnostic[];
    /** Manually-written enhanced error message. */
    manuallyEnhancedMessage: MarkdownString;
    /** Response directly from OpenAI API. */
    rawLlmResponse: RawLLMResponse;
}

/**
 * Loading the tasks synchronously on server startup is okay because it only
 * happens once, and the data never changes.  That said... if the tasks DO
 * change, you need to restart the server. Yes, even in dev mode!
 */
export function loadTasksSync() {
    // Sorry about this :/
    const TASK_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)) + '/../../../tasks');

    // First, figure out what the task names are from the folder names
    const taskDirectories = fs
        .readdirSync(TASK_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory());

    // Each directory is a task:
    for (const taskDir of taskDirectories) {
        const name = taskDir.name as Task['name'];
        // The rest of the codebase is hardcoded to these names, so make sure we're using them:
        console.assert(TASK_NAMES.includes(name));

        const sourceCode = fs.readFileSync(`${TASK_DIR}/${name}/main.c`, 'utf-8');
        const hash = hashSourceCode(sourceCode);
        const rawGccDiagnostics = JSON.parse(
            fs.readFileSync(`${TASK_DIR}/${name}/gcc-diagnostics.json`, 'utf-8')
        );
        const manuallyEnhancedMessage = fs.readFileSync(
            `${TASK_DIR}/${name}/manual-explanation.md`,
            'utf-8'
        ) as MarkdownString;
        const rawLlmResponse = JSON.parse(
            fs.readFileSync(`${TASK_DIR}/${name}/gpt4-response.json`, 'utf-8')
        ) as RawLLMResponse;

        TASKS.push({
            name,
            sourceCode,
            hash,
            rawGccDiagnostics,
            manuallyEnhancedMessage,
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
