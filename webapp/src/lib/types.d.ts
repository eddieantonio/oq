interface RawLLMResponse {
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

/**
 * The result of compiling and running code on the server, optionally including
 * enhanced diagnostics from querying the LLM.
 */
interface RunResult {
    /**
     * True when the submitted source code passes the success criteria.
     *
     * Note: the success criteria is dependent on the programming language, so
     * it might not be the same as the exit code from the raw run result.
     */
    success: boolean;
    /** Raw results from the RCE. */
    runResult: RawRunResult;
    /** (optional) The raw response from enhancing the diagnostics with an LLM. */
    apiResponse?: RawLLMResponse;
}
