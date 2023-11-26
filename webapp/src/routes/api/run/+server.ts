/**
 * Sends code to be run on the RCE server, and logs all necessary study data.
 */

import { error, fail, json } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { logCompileOutput, logCompileEvent } from '$lib/server/database';
import { fakeEnhanceWithLLM, type RawLLMResponse } from '$lib/server/llm';
import type { ParticipantId } from '$lib/server/newtypes';
import type { Diagnostics, LLMEnhancedDiagnostics } from '$lib/types/diagnostics';
import type { RawRunResult, RunResult } from '$lib/server/run-code';
import type { ClientSideRunResult } from '$lib/types/client-side-run-results';
import { toCondition, toExerciseId } from '$lib/server/util';

/**
 * POST to this endpoint to compile and run the code.
 * NOTE: this URL is hardcoded for my docker-compose setup.
 */
const REMOTE_CODE_EXECUTION_URL = 'http://rce:8000/run/gcc';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ cookies, request }) {
    const participantId = cookies.get('participant_id') as ParticipantId;
    if (!participantId) throw error(StatusCodes.BAD_REQUEST, 'No participantId cookie found');

    const data = await request.formData();

    const condition = toCondition(data.get('condition'));
    if (condition === null) {
        throw fail(StatusCodes.BAD_REQUEST, { condition, missing: true });
    }

    // TODO: Should I accept a file upload?
    const sourceCode = data.get('sourceCode');
    if (!sourceCode || !(typeof sourceCode == 'string'))
        throw fail(StatusCodes.BAD_REQUEST, { sourceCode, missing: true });

    const exercise = toExerciseId(data.get('exerciseId'));
    if (exercise === null) {
        console.warn({ route: 'api/run', warning: 'No exerciseId provided' });
    }

    // Simultaneously insert a new compile event while running the actual code.
    const [compileEventId, rawRunResult] = await Promise.all([
        logCompileEvent(participantId, sourceCode, exercise),
        runCode(sourceCode)
    ]);

    // Enrich the raw run result.
    const success = rawRunResult.compilation.exitCode === 0;
    const result: RunResult = {
        success,
        runResult: rawRunResult
    };

    // Enhance the diagnostics with LLM, if appropriate.
    if (!success && condition === 'llm-enhanced') {
        const originalDiagnostics = rawRunResult.compilation.parsed;
        if (!originalDiagnostics) {
            throw error(500, "Can only enhance PEMs with LLM if they're parsed");
        }

        // TODO: this should make a (cached!) request to the LLM.
        result.apiResponse = await fakeEnhanceWithLLM(originalDiagnostics, sourceCode);
    }

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
async function runCode(sourceCode: string): Promise<RawRunResult> {
    const formData = new FormData();
    // TODO: do not hardcode "main.c"
    formData.append('file', new Blob([sourceCode]), 'main.c');

    // POST a file as multipart/form-data
    // TODO: do not hardcode for "gcc"
    const res = await fetch(REMOTE_CODE_EXECUTION_URL, {
        method: 'POST',
        body: formData
    });
    return res.json();
}

function toClientSideFormat(result: RunResult): ClientSideRunResult {
    return {
        success: result.success,
        diagnostics: extractDiagnostics(result),
        output: result.runResult.execution?.stdout
    };
}

function extractDiagnostics(results: RunResult): Diagnostics | undefined {
    if (results.apiResponse) {
        // There is only an API response if the condition is LLM-enhanced.
        if (results.runResult.compilation.parsed === undefined) {
            throw new Error('Expecting all LLM-enhanced diagnostics to have parsed content');
        }
        return rawLLMResponseToDiagnostic(
            results.runResult.compilation.parsed,
            results.apiResponse
        );
    }

    // Did compilation fail?
    if (results.runResult.compilation.exitCode !== 0) {
        if (!results.runResult.compilation.parsed) {
            throw new Error(
                "Not implemented: No parsed error message, but compilation didn't succeed"
            );
        }

        return results.runResult.compilation.parsed;
    }

    return;
}

/** Converts a raw response from the OpenAI API to a format usable by the UI. */
function rawLLMResponseToDiagnostic(
    originaDiagnostics: Diagnostics,
    raw: RawLLMResponse
): LLMEnhancedDiagnostics {
    if (raw.choices.length === 0) throw new Error('Empty LLM response');

    return {
        format: 'llm-enhanced',
        markdown: raw.choices[0].message.content,
        original: originaDiagnostics
    };
}
