/**
 * Handles running the code
 */

import { error, fail, json } from '@sveltejs/kit';

/* TODO: use basic HTTP status code module. */
const UNAUTHORIZED = 401;
const BAD_REQUEST = 400;

/**
 * POST to this endpoint to compile and run the code.
 * NOTE: this URL is hardcoded for my docker-compose setup.
 */
const REMOTE_CODE_EXECUTION_URL = 'http://rce:8000/run/gcc';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ cookies, request }) {
    const participantId = cookies.get('participant_id');
    if (!participantId) throw error(UNAUTHORIZED, 'No participantId cookie found');

    const data = await request.formData();
    const sourceCode = data.get('sourceCode');

    if (!sourceCode || !(typeof sourceCode == 'string'))
        throw fail(BAD_REQUEST, { sourceCode, missing: true });

    let response = await runCode(sourceCode);
    return json(response);
}

// TODO: define TS interface for run output
async function runCode(sourceCode: string) {
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