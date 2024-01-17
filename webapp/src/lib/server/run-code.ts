import type { Diagnostics } from '$lib/types/diagnostics';
import type { PistonResponse } from '$lib/types/piston';
import type { RawLLMResponse } from './llm';

/**
 * The result of compiling and running code on the server, optionally including
 * enhanced diagnostics from querying the LLM.
 */
export interface RunResult {
    /**
     * True when the submitted source code passes the success criteria.
     *
     * Note: the success criteria is dependent on the programming language, so
     * it might not be the same as the exit code from the raw run result.
     */
    success: boolean;
    /** Raw results from Piston. */
    pistonResponse: PistonResponse;
    /** (optional) The raw response from enhancing the diagnostics with an LLM. */
    apiResponse?: RawLLMResponse;
    /** (optional) A data structure representing the diagnostics. This might be added later. */
    parsedDiagnostics?: Diagnostics;
}

/**
 * Represents the run of either a compiler or a program.
 */
export interface CommandResponse {
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
