import type { Diagnostics } from '$lib/types/diagnostics';

/**
 * Running the code on the RCE server will return a JSON object with the
 * following structure:
 */
export interface RawRunResult {
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
