import type { Diagnostics } from '$lib/types/diagnostics';
import type { MarkdownString } from './newtypes';

////////////////////////////////////////////// Types //////////////////////////////////////////////

/**
 * The raw response object from the LLM API.
 */
export interface RawLLMResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: LLMChoice[];
    usage: LLMUsage;
}

interface LLMChoice {
    index: number;
    message: LLMMessage;
    finish_reason: string;
}

interface LLMMessage {
    role: string;
    content: string;
}

interface LLMUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

const complexMultllmResponse: RawLLMResponse = {
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

const helloWorldLLMResponse: RawLLMResponse = {
    id: 'chatcmpl-8OqFtCQIYqDoE8gjvTEWQ5lWaJzri',
    object: 'chat.completion',
    created: 1700931433,
    model: 'gpt-4-0613',
    choices: [
        {
            index: 0,
            message: {
                role: 'assistant',
                content:
                    'The error is caused because the keyword `include` is not correctly used. In C programming, the correct keyword is `#include`. The `#include` directive is used to include the contents of any other file in the program at the time of preprocessing.\n\nThe corrected code should be:\n\n```c\n#include <stdio.h>\n\nint main(void) {\n   printf("Hello, world!\\n");\n   return 0;\n}\n```\n\nIn this corrected code, `#include <stdio.h>` is used to include the standard input/output library in C. This library is necessary for the `printf` function used in the program. Also, it\'s a good practice to return a value from the `main` function, typically `return 0;` is used to indicate that the program has run successfully.'
            },
            finish_reason: 'stop'
        }
    ],
    usage: {
        prompt_tokens: 108,
        completion_tokens: 163,
        total_tokens: 271
    }
};

//////////////////////////////////////////// Public API ////////////////////////////////////////////

export async function fakeEnhanceWithLLM(
    _diagnostics: Diagnostics,
    sourceCode: string
): Promise<RawLLMResponse> {
    if (sourceCode.includes('complex')) {
        return complexMultllmResponse;
    } else {
        return helloWorldLLMResponse;
    }
}

/**
 * Returns the Markdown-formatted response from the LLM.
 */
export function getMarkdownResponse(llmResponse: RawLLMResponse): MarkdownString {
    console.assert(llmResponse.choices.length > 0);
    console.assert(llmResponse.choices[0].message.role === 'assistant');
    return llmResponse.choices[0].message.content as MarkdownString;
}
