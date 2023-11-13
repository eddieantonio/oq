/**
 * Handles running the code
 */

import { exec as nodeExec } from 'child_process';
import fs from 'fs';

import { error, fail, json } from '@sveltejs/kit';
import util from 'util';

/* TODO: use basic HTTP status code module. */
const UNAUTHORIZED = 401;
const BAD_REQUEST = 400;

const exec = util.promisify(nodeExec);

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ cookies, request }) {
    const participantId = cookies.get('participant_id');
    if (!participantId) throw error(UNAUTHORIZED, 'No participantId cookie found');

    const data = await request.formData();
    const sourceCode = data.get('sourceCode');

    if (!sourceCode || !(typeof sourceCode == 'string'))
        throw fail(BAD_REQUEST, { sourceCode, missing: true });

    try {
        let { gccError } = await runCode(sourceCode);
        return json({ gccError });
    } catch (error) {
        console.error(`exec error: ${error}`);
    }
}

async function runCode(sourceCode: string) {
    const fileName = 'main';
    const filePath = `/tmp/${fileName}.c`;

    // Write the source code to a file
    await fs.promises.writeFile(filePath, sourceCode);

    // Compile the source code using gcc
    const command = `gcc -fdiagnostics-format=json ${filePath} -o /tmp/${fileName} || true`;
    console.log({ command });
    const { stdout, stderr } = await exec(command);
    console.log({ stdout, stderr });
    const parsedErrorMessage = JSON.parse(stderr);

    return { gccError: parsedErrorMessage };
}