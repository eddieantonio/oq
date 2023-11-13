/**
 * Handles running the code
 */

import { error, fail, json } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

/**
 * POST to this endpoint to compile and run the code.
 * NOTE: this URL is hardcoded for my docker-compose setup.
 */
const REMOTE_CODE_EXECUTION_URL = 'http://rce:8000/run/gcc';

/**
 * Running the code on the RCE server will return a JSON object with the
 * following structure:
 */
interface RunResult {
    compilation: CommandResponse;
    execution: CommandResponse | null;
}

/**
 * Represents the run of either a compiler or a program.
 */
interface CommandResponse {
    stdout: string;
    stderr: string;
    /**
     * A UNIX exit code (0 == success).
     */
    exitCode: number;
    /**
     * The diagnostic, parsed into a JSON object.
     */
    parsed?: any;
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ cookies, request }) {
    const participantId = cookies.get('participant_id');
    if (!participantId) throw error(StatusCodes.BAD_REQUEST, 'No participantId cookie found');

    const data = await request.formData();
    const sourceCode = data.get('sourceCode');

    if (!sourceCode || !(typeof sourceCode == 'string'))
        throw fail(StatusCodes.BAD_REQUEST, { sourceCode, missing: true });

    let response = await runCode(sourceCode);
    return json(response);
}

// TODO: define TS interface for run output
async function runCode(sourceCode: string): Promise<RunResult> {
    const formData = new FormData();
    // TODO: do not hardcode "main.c"
    formData.append("file", new Blob([sourceCode]), "main.c");

    // POST a file as multipart/form-data
    const res = await fetch(REMOTE_CODE_EXECUTION_URL, {
        method: "POST",
        body: formData,
    });
    return res.json();
}