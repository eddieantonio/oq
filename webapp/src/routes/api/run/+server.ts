/**
 * Sends code to be run on Piston and logs all necessary study data.
 */

import { error, json } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { logCompileOutput, logCompileEvent } from '$lib/server/database';
import type { ExerciseId } from '$lib/server/newtypes';
import type { Diagnostics, RootGCCDiagnostic } from '$lib/types/diagnostics';
import type { RunResult } from '$lib/server/run-code';
import type { ClientSideRunResult } from '$lib/types/client-side-run-results';
import type { PistonRequest, PistonResponse } from '$lib/types/piston.js';

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
export async function POST({ request, locals }) {
    const participant = locals.participant;
    if (!participant) throw error(StatusCodes.UNAUTHORIZED, 'Must be logged in to run code');

    const participantId = participant.participant_id;
    const exercise = participant.stage as ExerciseId;

    const data = await request.formData();

    // TODO: Should I accept a file upload?
    const sourceCode = data.get('sourceCode');
    if (!sourceCode || !(typeof sourceCode == 'string'))
        throw error(StatusCodes.BAD_REQUEST, "Missing or invalid 'sourceCode' parameter");
    if (sourceCode.length > MAX_SOURCE_CODE_LENGTH)
        throw error(StatusCodes.BAD_REQUEST, 'Source code is too long');

    // Simultaneously insert a new compile event while running the actual code.
    const [compileEventId, pistonResponse] = await Promise.all([
        logCompileEvent(participantId, sourceCode, exercise),
        runCode(sourceCode)
    ]);

    // Enrich the raw run result.
    const success = pistonResponse.compile?.code === 0;
    const result: RunResult = {
        success,
        pistonResponse
    };

    // The compiler diagnostics SHOULD BE in a JSON format. Parse it!
    result.parsedDiagnostics = parseGccDiagnostics(pistonResponse.compile?.stderr || '[]');

    // Log the result of the run.
    await logCompileOutput(compileEventId, result);

    // Okay, good to go!
    const response: ClientSideRunResult = toClientSideFormat(result);
    return json(response);
}

/**
 * Runs the source code on the server.
 *
 * @param sourceCode Source code to compile and run on the server.
 * @returns The result of compiling/running the code.
 */
async function runCode(sourceCode: string): Promise<PistonResponse> {
    // TODO: get this from the client.
    const filename = 'main.c';
    const request: PistonRequest = {
        language: 'c',
        version: '10.2.0',
        files: [
            {
                name: filename,
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

function toClientSideFormat(result: RunResult): ClientSideRunResult {
    return {
        success: result.success,
        diagnostics: extractDiagnostics(result),
        output: result.pistonResponse.run.stdout
    };
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
    try {
        const diagnostics = JSON.parse(stderr) as RootGCCDiagnostic[];
        return {
            format: 'gcc-json',
            // Only show the first error.
            diagnostics: diagnostics.slice(0, 1)
        };
    } catch (e) {
        return undefined;
    }
}
