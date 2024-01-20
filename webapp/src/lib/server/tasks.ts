import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type { RootGCCDiagnostic } from '$lib/types/diagnostics';
import type { MarkdownString, SHA256Hash } from './newtypes';
import { hashSourceCode } from './hash';

export const TASKS: Task[] = [];

export interface Task {
    /** Name of the task. */
    name: 'easy' | 'medium' | 'hard';

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
    // Sorry about this :/
    const TASK_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)) + '/../../../tasks');

    // First, figure out what the task names are from the folder names
    const taskDirectories = (await fs.promises.readdir(TASK_DIR, { withFileTypes: true })).filter(
        (entry) => entry.isDirectory()
    );

    // Each directory is a task:
    for (const taskDir of taskDirectories) {
        const name = taskDir.name as Task['name'];
        // The rest of the codebase is hardcoded to these names, so make sure we're using them:
        console.assert(['easy', 'medium', 'hard'].includes(name));

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