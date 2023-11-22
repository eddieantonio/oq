/**
 * Sends code to be run on the RCE server, and logs all necessary study data.
 */

import { logCompileOutput, logCompileEvent } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/participants.js';
import { error, fail, json } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

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

    // TODO: Need to get what "scenario" the participant is completing this for
    // TODO: Should I accept a file upload?
    const sourceCode = data.get('sourceCode');
    if (!sourceCode || !(typeof sourceCode == 'string'))
        throw fail(StatusCodes.BAD_REQUEST, { sourceCode, missing: true });

    // Simultaneously insert a new compile event while running the actual code.
    const [compileEventId, response] = await Promise.all([
        logCompileEvent(participantId, sourceCode),
        runCode(sourceCode)
    ]);

    // Log the result of the run.
    await logCompileOutput(compileEventId, response);

    // Okay, good to go!
    return json(response);
}

/**
 * Runs the source code on the server.
 *
 * @param sourceCode Source code to compile and run on the server.
 * @returns The result of compiling/running the code.
 */
async function runCode(sourceCode: string): Promise<RunResult> {
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
