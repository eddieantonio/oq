/**
 * Sends code to be run on the RCE server, and logs all necessary study data.
 */

import { logCompileOutput, logCompileEvent } from '$lib/server/database';
import type { ParticipantId } from '$lib/server/newtypes';
import { error, fail, json } from '@sveltejs/kit';
import { StatusCodes } from 'http-status-codes';

/**
 * POST to this endpoint to compile and run the code.
 * NOTE: this URL is hardcoded for my docker-compose setup.
 */
const REMOTE_CODE_EXECUTION_URL = 'http://rce:8000/run/gcc';

// TODO: I really need to filter this...
const llmResponse: LLMResponse = {
    id: '<redacted>',
    object: 'chat.completion',
    created: 1700779908,
    model: 'gpt-4-0613',
    choices: [
        {
            index: 0,
            message: {
                role: 'assistant',
                content:
                    "The error message is indicating that the C programming language does not support multiplication (or any other arithmetic operations) directly on complex or struct data types. In other words, you can't just multiply two complex numbers (or structs) using the '*' operator as you're trying to do in the line `struct complex z_squared = z * z;`.\n\nTo fix this problem, you need to manually implement the multiplication of two complex numbers. The multiplication of two complex numbers (a + bi) and (c + di) is defined as (ac - bd) + (ad + bc)i.\n\nHere's how you can modify your code:\n\n```c\n#include <stdio.h>\n\nstruct complex {\n   double real;\n   double imag;\n};\n\nstruct complex multiply(struct complex a, struct complex b) {\n   struct complex result;\n   result.real = a.real * b.real - a.imag * b.imag;\n   result.imag = a.real * b.imag + a.imag * b.real;\n   return result;\n}\n\nint main() {\n   struct complex z = { .real  = 1, .imag = 1};\n   struct complex z_squared = multiply(z, z);\n   printf(\"%lf+%lfi\", z_squared.real, z_squared.imag);\n\n   return 0;\n}\n```\n\nIn this modified code, I've added a new function `multiply()` that takes two complex numbers (as structs) and returns their product as a new complex number (struct). This function implements the formula for multiplying complex numbers. Then, in the `main()` function, I've replaced the direct multiplication of `z` with `z` with a call to the `multiply()` function."
            },
            finish_reason: 'stop'
        }
    ],
    usage: {
        prompt_tokens: 145,
        completion_tokens: 337,
        total_tokens: 482
    }
};

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

    // HACK
    const scenario = data.get('scenario');
    if (scenario === 'llm') {
        if (response.compilation.parsed === undefined) {
            throw error(500, "that's not right...");
        }

        response.compilation.parsed = {
            format: 'llm-enhanced',
            diagnostics: llmResponse,
            original: response.compilation.parsed
        };
    }

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
