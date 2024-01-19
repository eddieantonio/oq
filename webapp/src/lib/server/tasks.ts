import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type { RootGCCDiagnostic } from '$lib/types/diagnostics';
import type { MarkdownString, SHA256Hash } from './newtypes';
import { hashSourceCode } from './hash';

export const TASKS: Task[] = [];

export interface Task {
    name: string;

    /** Full source code to show the user. */
    sourceCode: string;
    /** Hash of the source code. */
    hash: SHA256Hash;
    /** GCC diagnostics from -fdiagnostics-format=json */
    rawGccDiagnostics: RootGCCDiagnostic[];
    /** Manually-written enhanced error message. */
    manuallyEnhancedMessage: MarkdownString;

    // TODO: Add LLM-enhanced message.
}

export async function loadTasks() {
    // load tasks from webapp/tasks/*/
    const TASK_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)) + '/../../../tasks');
    console.log({ TASK_DIR });

    // First, figure out what the task names are from the folder names
    const taskDirectories = (await fs.promises.readdir(TASK_DIR, { withFileTypes: true })).filter(
        (dir) => dir.isDirectory()
    );

    // Each directory is a task:
    for (const taskDir of taskDirectories) {
        const name = taskDir.name;
        const sourceCode = await fs.promises.readFile(`${TASK_DIR}/${name}/main.c`, 'utf-8');
        const hash = hashSourceCode(sourceCode);
        const rawGccDiagnostics = JSON.parse(
            await fs.promises.readFile(`${TASK_DIR}/${name}/gcc-diagnostics.json`, 'utf-8')
        );
        const manuallyEnhancedMessage = (await fs.promises.readFile(
            `${TASK_DIR}/${name}/manual-explanation.md`,
            'utf-8'
        )) as MarkdownString;

        TASKS.push({
            name,
            sourceCode,
            hash,
            rawGccDiagnostics,
            manuallyEnhancedMessage
        });
    }
}
