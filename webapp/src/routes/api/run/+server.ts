/**
 * Sends code to be run on the RCE server, and logs all necessary study data.
 */

import { error, fail, json } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

import { logCompileOutput, logCompileEvent } from '$lib/server/database';
import { fakeEnhanceWithLLM } from '$lib/server/llm';
import type { ParticipantId } from '$lib/server/newtypes';
import type { Diagnostics, LLMEnhancedDiagnostics } from '$lib/types/diagnostics';
import type { RawRunResult, RunResult } from '$lib/server/run-code';
import type { ClientSideRunResult } from '$lib/types/client-side-run-results';

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

    // TODO: change name to "condition"?
    const scenario = asScenario(data.get('scenario'));

    // TODO: Should I accept a file upload?
    const sourceCode = data.get('sourceCode');
    if (!sourceCode || !(typeof sourceCode == 'string'))
        throw fail(StatusCodes.BAD_REQUEST, { sourceCode, missing: true });

    // Simultaneously insert a new compile event while running the actual code.
    const [compileEventId, rawRunResult] = await Promise.all([
        logCompileEvent(participantId, sourceCode),
        runCode(sourceCode)
    ]);

    // Enrich the raw run result, optionally enhancing it with the LLM.
    const internalRunResult = await enrichRawRunResult(scenario, sourceCode, rawRunResult);

    // Log the result of the run.
    await logCompileOutput(compileEventId, internalRunResult);

    // Okay, good to go!
    const response: ClientSideRunResult = toClientSideFormat(internalRunResult);
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

// TODO: move this somewhere else?
// TODO: rename to Condition?
type Scenario = 'control' | 'enhanced' | 'llm-enhanced';

function asScenario(scenario: FormDataEntryValue | null): Scenario {
    if (scenario === null) {
        console.warn("Received null scenario, defaulting to 'control'");
        return 'control';
    }

    if (scenario === 'control' || scenario === 'enhanced' || scenario === 'llm-enhanced') {
        return scenario;
    }

    throw error(StatusCodes.BAD_REQUEST, `Invalid scenario: ${scenario}`);
}

async function enrichRawRunResult(
    scenario: Scenario,
    sourceCode: string,
    rawResult: RawRunResult
): Promise<RunResult> {
    // TODO: this depends on the programming language. Right now, this is hardcoded for C.
    const success = rawResult.compilation.exitCode === 0;

    const result: RunResult = {
        success,
        runResult: rawResult
    };

    if (!success) {
        // Enhance the diagnostics with LLM
        if (scenario === 'llm-enhanced') {
            if (rawResult.compilation.parsed === undefined) {
                throw error(500, "Can only enhance PEMs with LLM if they're parsed");
            }

            // TODO: this should make a (cached!) request to the LLM.
            result.apiResponse = await fakeEnhanceWithLLM(rawResult.compilation.parsed, sourceCode);
        }
    }

    return result;
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
        // There is only an API response if the scenario is LLM-enhanced.
        if (results.runResult.compilation.parsed === undefined) {
            throw new Error('Expecting all LLM-enhanced diagnostics to have parsed content');
        }
        return rawLLMResponseToDiagnostic(
            results.runResult.compilation.parsed,
            results.apiResponse
        );
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
