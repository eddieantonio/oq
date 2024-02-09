import * as fs from 'fs';

import type { Diagnostics, RootGCCDiagnostic } from '$lib/types/diagnostics';
import type { MarkdownString, SHA256Hash } from './newtypes';
import { hashSourceCode } from './hash';
import { getMarkdownResponse, type RawLLMResponse } from './llm';
import type { TaskName, JsonMarkerData, Condition, ProgrammingLanguage } from '$lib/types';
import { getFirstGCCError } from './diagnostics-util';

export const TASKS: Task[] = [];

export interface Task {
    /** An arbitrary name for the task. */
    name: TaskName;
    /** The programming language supported */
    language: ProgrammingLanguage;
    /** What should be the file name in error messages: */
    filename: string;
    /** Full source code to show the user. */
    sourceCode: string;
    /** Hash of the source code. */
    hash: SHA256Hash;
    /** The diagnostics for each condition. */
    diagnostics: { [key in Condition]: Diagnostics };
}

/**
 * Schema of the task.json metadata file.
 */
interface TaskMetadata {
    language: ProgrammingLanguage;
}

/**
 * Loading the tasks synchronously on server startup is okay because it only
 * happens once, and the data never changes.  That said... if the tasks DO
 * change, you need to restart the server. Yes, even in dev mode!
 * @param tasksDir path to tasks
 */
export function loadTasksSync(tasksDir: string) {
    // Sorry about this :/
    console.log('Loading tasks from', tasksDir);

    // First, figure out what the task names are from the folder names
    const taskDirectories = fs
        .readdirSync(tasksDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory());

    // Each directory is a task:
    for (const taskDir of taskDirectories) {
        // Skip the +common/ directory
        if (taskDir.name == '+common') continue;

        const name = taskDir.name as TaskName;
        TASKS.push(loadOneTaskSync(`${tasksDir}/${name}`, name));
    }

    console.log('Loaded', TASKS.length, 'tasks');
}
/**
 * Returns the task with the given name. If the task doesn't exist, throws an error.
 */
export function getTaskByName(name: string): Task {
    const task = TASKS.find((t) => t.name === name);
    if (!task) throw new Error(`No task found with name ${name}`);
    return task;
}

export function getTaskBySourceCodeHash(hash: SHA256Hash): Task | undefined {
    // TODO: build a map if I have more than... oh... 16 tasks?
    return TASKS.find((t) => t.hash === hash);
}

/**
 * @deprecated This function is not language aware, and returns ALL tasks! (that is bad)
 * @returns all tasks names loaded into the server
 */
export function taskNames(): TaskName[] {
    return TASKS.map((t) => t.name);
}

function loadOneTaskSync(taskDir: string, name: TaskName) {
    const metadata = JSON.parse(fs.readFileSync(`${taskDir}/task.json`, 'utf-8')) as TaskMetadata;
    const language = metadata.language;
    const loader = loaders[language];

    const filename = loader.getFilename();
    const sourceCode = fs.readFileSync(`${taskDir}/${filename}`, 'utf-8');
    const hash = hashSourceCode(sourceCode);

    const original = loader.getOriginalDiagnostics(taskDir);
    const manuallyEnhancedMessage = fs.readFileSync(
        `${taskDir}/manual-explanation.md`,
        'utf-8'
    ) as MarkdownString;
    const manuallyEnhancedMessageMarkers = JSON.parse(
        fs.readFileSync(`${taskDir}/manual-markers.json`, 'utf-8')
    ) as JsonMarkerData[];
    const rawLlmResponse = JSON.parse(
        fs.readFileSync(`${taskDir}/gpt4-response.json`, 'utf-8')
    ) as RawLLMResponse;

    const diagnostics: Task['diagnostics'] = {
        control: original,
        enhanced: {
            format: 'manually-enhanced',
            markdown: manuallyEnhancedMessage,
            markers: manuallyEnhancedMessageMarkers
        },
        'llm-enhanced': {
            format: 'llm-enhanced',
            markdown: getMarkdownResponse(rawLlmResponse),
            original
        }
    };

    return {
        name,
        language,
        filename,
        sourceCode,
        hash,
        diagnostics
    };
}

interface TaskLoader {
    getFilename(): string;
    getOriginalDiagnostics(taskDir: string): Diagnostics;
}

/**
 * Task loaders for each programming language.
 * Figures out which files to load for each programming language, and how to parse them.
 */
const loaders: { [key in ProgrammingLanguage]: TaskLoader } = {
    c: {
        getFilename: () => 'main.c',
        getOriginalDiagnostics(taskDir) {
            const rawGccDiagnostics = JSON.parse(
                fs.readFileSync(`${taskDir}/gcc-diagnostics.json`, 'utf-8')
            ) as RootGCCDiagnostic[];

            return {
                format: 'gcc-json',
                diagnostics: [getFirstGCCError(rawGccDiagnostics)]
            };
        }
    },
    python: {
        getFilename: () => 'main.py',
        getOriginalDiagnostics(taskDir) {
            const textFile = fs.readFileSync(`${taskDir}/python-errors.txt`, 'utf-8');
            return {
                format: 'preformatted',
                plainText: textFile
            };
        }
    }
} as const;
