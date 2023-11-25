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
 * Running the code on the RCE server will return a JSON object with the
 * following structure:
 */
interface RawRunResult {
    /**
     * Diagnostics from the compilation step.
     */
    compilation: CommandResponse;
    /**
     * Output from running the code.
     */
    execution: CommandResponse | null;
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

/**
 * Results to be sent to the client.
 */
interface ClientSideRunResult {
    /** True when the source code can be submitted. */
    success: boolean;
    /** (optional) Diagnostics for this code run. */
    diagnostics?: Diagnostics;
    /** (optional) Runtime output for this code run. */
    output?: string;
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
    parsed?: Diagnostics;
}
