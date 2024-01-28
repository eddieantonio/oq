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

//////////////////////////////////////////// Public API ////////////////////////////////////////////

/**
 * Returns the Markdown-formatted response from the LLM.
 */
export function getMarkdownResponse(llmResponse: RawLLMResponse): MarkdownString {
    console.assert(llmResponse.choices.length > 0);
    console.assert(llmResponse.choices[0].message.role === 'assistant');
    return llmResponse.choices[0].message.content as MarkdownString;
}
