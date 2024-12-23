import * as fs from 'fs';

import type { Diagnostics, RootGCCDiagnostic, RootRustDiagnostic } from '$lib/types/diagnostics';
import type { SHA256Hash } from './newtypes';
import { hashSourceCode } from './hash';
import { getMarkdownResponse, type RawLLMResponse } from './llm';
import {
    type TaskName,
    type Condition,
    type ProgrammingLanguage,
    SUPPORTED_PROGRAMMING_LANGUAGES
} from '$lib/types';
import { getFirstGCCError } from './diagnostics-util';
import { parsePythonTraceback } from './python-traceback-parser';

const TASKS: Task[] = [];

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
 * Loading the tasks synchronously on server startup is okay because it only
 * happens once, and the data never changes.  That said... if the tasks DO
 * change, you need to restart the server. Yes, even in dev mode!
 * @param tasksDir path to tasks
 */
export function loadTasksSync(tasksDir: string) {
    // Sorry about this :/
    console.log('Loading tasks from', tasksDir);
    if (TASKS.length > 0) {
        console.log(`${TASKS.length} tasks already loaded!`);
        return;
    }

    // The structure of the tasks directory is:
    // tasks/
    //   [ProgrammingLanguage]/
    //      [TaskName]/             each task is a directory
    //
    // e.g.,
    // tasks/
    //   c/
    //      +common/                common files for all C tasks
    //      missing-brace/
    //      invalid-define/
    //  python/
    //      +common/                common files for all Python tasks
    //      missing-colon/
    //      missing-indentation/

    // First, figure out what languages exist, from the folder names
    const langDirectories = fs
        .readdirSync(tasksDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory());

    // Each directory is a task:
    for (const langDir of langDirectories) {
        const langDirPath = `${tasksDir}/${langDir.name}`;
        const language = requireSupportedProgrammingLanguage(langDir.name);

        // TEMPORARY!
        if (language != 'python') {
            console.log(`Ignoring ${language} tasks for now...`);
            continue;
        }

        const taskDirs = fs
            .readdirSync(langDirPath, {
                withFileTypes: true
            })
            .filter((entry) => entry.isDirectory())
            .filter((taskDir) => taskDir.name !== '+common');

        for (const taskDir of taskDirs) {
            const name = taskDir.name as TaskName;
            if (shouldIgnore(`${langDirPath}/${name}`)) continue;
            TASKS.push(loadOneTaskSync(`${langDirPath}/${name}`, name, language));
        }
    }

    // The code base assumes that task names are unique. Ensure that on start up:
    const taskNames = new Set(TASKS.map((t) => t.name));
    if (taskNames.size !== TASKS.length) throw new Error('duplicate task names found');

    console.log('Loaded', TASKS.length, 'tasks');
}

function requireSupportedProgrammingLanguage(s: string): ProgrammingLanguage {
    if ((SUPPORTED_PROGRAMMING_LANGUAGES as readonly string[]).includes(s))
        return s as ProgrammingLanguage;
    throw new Error(`Unsupported programming language: ${s}`);
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
 * Returns a task by its source code file's hash.
 * @returns the task, or undefined if no task has the given hash.
 */
export function getTaskBySourceCodeHash(hash: SHA256Hash): Task | undefined {
    // TODO: build a map if I have more than... oh... 16 tasks?
    return TASKS.find((t) => t.hash === hash);
}

/**
 * Returns all tasks for the given language.
 */
export function getTasksForLanguage(language: ProgrammingLanguage): Task[] {
    return TASKS.filter((t) => t.language === language);
}

/**
 * Returns whether any tasks have been loaded into the server.
 */
export function hasLoadedTasks(): boolean {
    return TASKS.length > 0;
}

/**
 * @deprecated This function is not language aware, and returns ALL tasks! (that is bad)
 * @returns all tasks names loaded into the server
 */
export function taskNames(): TaskName[] {
    return TASKS.map((t) => t.name);
}

function loadOneTaskSync(taskDir: string, name: TaskName, language: ProgrammingLanguage) {
    const loader = loaders[language];

    const filename = loader.getFilename();
    const sourceCode = fs.readFileSync(`${taskDir}/${filename}`, 'utf-8');
    const hash = hashSourceCode(sourceCode);

    const original = loader.getOriginalDiagnostics(taskDir);
    const rawGptResponse = JSON.parse(
        fs.readFileSync(`${taskDir}/gpt4-response.json`, 'utf-8')
    ) as RawLLMResponse;
    const rawFinetunedResponse = JSON.parse(
        fs.readFileSync(`${taskDir}/ft-response.json`, 'utf-8')
    ) as RawLLMResponse;

    const diagnostics: Task['diagnostics'] = {
        control: original,
        'llm-enhanced': {
            format: 'llm-enhanced',
            markdown: getMarkdownResponse(rawGptResponse),
            original
        },
        finetuned: {
            format: 'markdown',
            markdown: getMarkdownResponse(rawFinetunedResponse),
            original
        }
    };

    return {
        name: nameTask(language, name),
        language,
        filename,
        sourceCode,
        hash,
        diagnostics
    };
}

/**
 * Renames a task to include both the language and per-language name.
 */
function nameTask(language: ProgrammingLanguage, name: string): TaskName {
    return `${language}:${name}` as TaskName;
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
            const diagnostics = parsePythonTraceback(textFile);
            if (diagnostics == null)
                throw new Error(`Could not parse Python traceback in ${taskDir}`);
            return {
                format: 'parsed-python',
                diagnostics
            };
        }
    },
    rust: {
        getFilename: () => 'main.rs',
        getOriginalDiagnostics(taskDir) {
            const rawRustcDiagnostics = fs.readFileSync(`${taskDir}/rustc-error.json`, 'utf-8');
            const diagnostics = rawRustcDiagnostics
                .split('\n')
                .filter((line) => line.length > 0)
                .map((line) => JSON.parse(line) as RootRustDiagnostic);
            return {
                format: 'rustc-json',
                diagnostics: [getFirstRustcError(diagnostics)]
            };
        }
    }
} as const;

function getFirstRustcError(diagnostics: RootRustDiagnostic[]): RootRustDiagnostic {
    const error = diagnostics.find((d) => d.level === 'error');
    if (error == null) throw new Error('No error found in rustc diagnostics');
    return error;
}

function shouldIgnore(taskDir: string): boolean {
    return fs.existsSync(`${taskDir}/should-ignore`);
}
