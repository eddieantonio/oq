/**
 * Sends code to be run on Piston and logs all necessary study data.
 */

import { error, json } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';
import { dev } from '$app/environment';

import { logCompileOutput, logCompileEvent, getParticipantAssignment } from '$lib/server/database';
import type { ExerciseId } from '$lib/server/newtypes';
import type { Diagnostics, RootGCCDiagnostic } from '$lib/types/diagnostics';
import type { RunResult } from '$lib/server/run-code';
import type { ClientSideRunResult } from '$lib/types/client-side-run-results';
import type { PistonRequest, PistonResponse } from '$lib/types/piston.js';
import { hashSourceCode } from '$lib/server/hash.js';
import { getTaskBySourceCodeHash } from '$lib/server/tasks.js';
import { diagnosticsForCondition } from '$lib/server/diagnostics-util.js';
import {
    SUPPORTED_PROGRAMMING_LANGUAGES,
    type ProgrammingLanguage,
    type RunnableProgram
} from '$lib/types';
import type { RequestEvent } from './$types';
import { parsePythonTraceback } from '$lib/server/python-traceback-parser';

/**
 * POST to this endpoint to compile and run the code.
 * NOTE: this URL is hardcoded for my docker-compose setup.
 */
const PISTON_EXECUTE_URL = 'http://piston:2000/api/v2/execute';

/**
 * The maximum length of the source code, in UTF-16 code units (yeah, sorry).
 */
const MAX_SOURCE_CODE_LENGTH = 1024; // 2 KiB (each code point is 2 bytes)

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST(event) {
    const data = await event.request.formData();
    if (dev && data.get('DEBUG')) return runCodeForDebug(data, event);
    else return runCodeDuringStudy(data, event);
}

async function runCodeDuringStudy(data: FormData, { locals }: RequestEvent) {
    const participant = locals.expectParticipant('Must be logged in to run code');

    const participantId = participant.participant_id;
    const exercise = participant.stage as ExerciseId;

    // TODO: Should I accept a file upload?
    let sourceCode = data.get('sourceCode');
    if (!sourceCode || !(typeof sourceCode == 'string'))
        throw error(StatusCodes.BAD_REQUEST, "Missing or invalid 'sourceCode' parameter");
    if (sourceCode.length > MAX_SOURCE_CODE_LENGTH)
        throw error(StatusCodes.BAD_REQUEST, 'Source code is too long');
    const filename = asStringOrBadRequest(data.get('filename'));
    const language = asProgrammingLanguageOrBadRequest(data.get('language'));

    // HACK: **Something** is putting CRLFs in the source code, but I am a Unix nerd,
    // so obviously this is unacceptable! Replace all those awful, uncivilized CRLFs:
    sourceCode = sourceCode.replace(/\r\n/g, '\n');

    // Figure out if we should return the stored PEM or actually run the code.
    const currentAssignment = await getParticipantAssignment(participant.participant_id, exercise);
    if (!currentAssignment)
        throw error(StatusCodes.INTERNAL_SERVER_ERROR, 'No assignment found for participant');
    const hashed = hashSourceCode(sourceCode);

    // TODO: change the promise.all to do things in parallel a bit better.
    // TODO: only hash the source code once
    const originalTask = getTaskBySourceCodeHash(hashed);
    if (originalTask) {
        await logCompileEvent(participantId, sourceCode, exercise);
        const response: ClientSideRunResult = {
            success: false,
            executionTimedOut: false,
            diagnostics: diagnosticsForCondition(originalTask, currentAssignment.condition)
        };
        return json(response);
    }

    // Simultaneously insert a new compile event while running the actual code.
    const [compileEventId, pistonResponse] = await Promise.all([
        logCompileEvent(participantId, sourceCode, exercise),
        runOnPiston({
            filename,
            language,
            sourceCode
        })
    ]);

    // Process the response from Piston.
    // Each programming language has a slightly different way of interpreting the response.
    const languageAdaptor = ADAPTORS[language];
    const success = languageAdaptor.getSuccess(pistonResponse);
    const result: RunResult = {
        success,
        executionTimedOut: didPistonTimeOut(pistonResponse),
        pistonResponse
    };
    result.parsedDiagnostics = languageAdaptor.parseDiagnostics(pistonResponse);

    // Log the result of the run.
    await logCompileOutput(compileEventId, result);

    // Okay, good to go!
    return json(languageAdaptor.toClientSideFormat(result));
}

async function runCodeForDebug(data: FormData, _: RequestEvent) {
    let sourceCode = data.get('sourceCode');
    if (!sourceCode || !(typeof sourceCode == 'string'))
        throw error(StatusCodes.BAD_REQUEST, "Missing or invalid 'sourceCode' parameter");
    if (sourceCode.length > MAX_SOURCE_CODE_LENGTH)
        throw error(StatusCodes.BAD_REQUEST, 'Source code is too long');
    const filename = asStringOrBadRequest(data.get('filename'));
    const language = asProgrammingLanguageOrBadRequest(data.get('language'));

    // HACK: **Something** is putting CRLFs in the source code, but I am a Unix nerd,
    // so obviously this is unacceptable! Replace all those awful, uncivilized CRLFs:
    sourceCode = sourceCode.replace(/\r\n/g, '\n');
    const pistonResponse = await runOnPiston({ language, filename, sourceCode });

    console.log({ pistonResponse });

    // Process the response from Piston.
    // Each programming language has a slightly different way of interpreting the response.
    const languageAdaptor = ADAPTORS[language];
    const success = languageAdaptor.getSuccess(pistonResponse);
    const result: RunResult = {
        success,
        executionTimedOut: didPistonTimeOut(pistonResponse),
        pistonResponse
    };
    result.parsedDiagnostics = languageAdaptor.parseDiagnostics(pistonResponse);

    // Okay, good to go!
    return json(languageAdaptor.toClientSideFormat(result));
}

interface LanguageAdaptor {
    getSuccess(response: PistonResponse): boolean;
    parseDiagnostics(response: PistonResponse): Diagnostics | undefined;
    toClientSideFormat(result: RunResult): ClientSideRunResult;
}

const ADAPTORS: { [key in ProgrammingLanguage]: LanguageAdaptor } = {
    c: {
        getSuccess: (response: PistonResponse) => response.compile?.code === 0,
        parseDiagnostics: (response: PistonResponse) =>
            parseGccDiagnostics(response.compile?.stderr || '[]\n'),
        toClientSideFormat(result: RunResult) {
            return {
                success: result.success,
                executionTimedOut: result.executionTimedOut,
                diagnostics: extractDiagnostics(result),
                output: result.pistonResponse.run.stdout
            };
        }
    },
    python: {
        getSuccess: (response: PistonResponse) => response.run.code === 0,
        parseDiagnostics(response: PistonResponse) {
            const diagnostics = parsePythonTraceback(response.run.stderr);
            if (diagnostics == null) return undefined;
            return {
                format: 'parsed-python',
                diagnostics
            };
        },
        toClientSideFormat(result: RunResult): ClientSideRunResult {
            if (result.success) {
                return {
                    success: true,
                    executionTimedOut: result.executionTimedOut,
                    output: result.pistonResponse.run.stdout
                };
            }

            // Fallback to preformatted diagnostics if the Python traceback failed to parse:
            const diagnostics = result.parsedDiagnostics ?? {
                format: 'preformatted',
                plainText: result.pistonResponse.run.stderr
            };

            return {
                success: false,
                executionTimedOut: result.executionTimedOut,
                diagnostics,
                output: result.pistonResponse.run.stdout
            };
        }
    }
} as const;

/**
 * Runs the source code on the server.
 *
 * @returns The result of compiling/running the code.
 */
async function runOnPiston({
    language,
    filename,
    sourceCode
}: RunnableProgram): Promise<PistonResponse> {
    const request: PistonRequest = {
        language,
        version: '*',
        files: [
            {
                name: sanitizeFilename(filename),
                content: sourceCode
            }
        ],
        // TODO: set these to reasonable values.
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1
    };

    const res = await fetch(PISTON_EXECUTE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });
    return res.json();
}

function asStringOrBadRequest(value: FormDataEntryValue | null): string {
    if (value === null) throw error(StatusCodes.BAD_REQUEST, 'Missing form data');
    if (typeof value !== 'string') throw error(StatusCodes.BAD_REQUEST, 'Invalid form data');
    return value;
}

function asProgrammingLanguageOrBadRequest(value: FormDataEntryValue | null): ProgrammingLanguage {
    const str = asStringOrBadRequest(value);
    if (!(SUPPORTED_PROGRAMMING_LANGUAGES as readonly string[]).includes(str))
        throw error(StatusCodes.BAD_REQUEST, 'Invalid programming language');
    return str as ProgrammingLanguage;
}

function sanitizeFilename(filename: string): string {
    // Make sure it is limited to a short, safe string.
    if (!/^[a-zA-Z0-9_-]{1,223}\.[a-zA-Z0-9_-]{1,15}$/.test(filename)) {
        throw error(StatusCodes.BAD_REQUEST, 'Invalid filename');
    }
    return filename;
}

function extractDiagnostics(results: RunResult): Diagnostics | undefined {
    // Did compilation fail?
    if (results.pistonResponse.compile?.code !== 0) {
        if (!results.parsedDiagnostics) {
            throw new Error(
                "Not implemented: No parsed error message, but compilation didn't succeed"
            );
        }

        return results.parsedDiagnostics;
    }

    return;
}

function parseGccDiagnostics(stderr: string): Diagnostics | undefined {
    if (stderr.startsWith('[]\n') && stderr.length > 3) {
        // There is some other kind of error, like a linker error.
        return {
            format: 'preformatted',
            plainText: stderr.slice(3)
        };
    }

    const firstLine = stderr.split('\n', 1)[0];
    // TODO: what to do with the rest of stderr?
    try {
        const diagnostics = JSON.parse(firstLine) as RootGCCDiagnostic[];
        return {
            format: 'gcc-json',
            // Only show the first error.
            diagnostics: diagnostics.slice(0, 1)
        };
    } catch (e) {
        return undefined;
    }
}

function didPistonTimeOut(pistonResponse: PistonResponse): boolean {
    return pistonResponse.run.signal === 'SIGKILL' || pistonResponse.compile?.signal === 'SIGKILL';
}
