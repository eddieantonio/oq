/**
 * A request to compile and run code in Piston.
 *
 * See: https://github.com/engineer-man/piston/tree/b46690de0607fe5049bf648a2e5dbd4f584c27be?tab=readme-ov-file#execute-endpoint
 */
export interface PistonRequest {
    language: string;
    version: string;
    files: {
        name: string;
        content: string;
        encoding?: string;
    }[];
    stdin?: string;
    args?: string[];
    compile_timeout?: number;
    run_timeout?: number;
    compile_memory_limit?: number;
    run_memory_limit?: number;
}

/**
 * Successful response from Piston.
 *
 * See: https://github.com/engineer-man/piston/tree/b46690de0607fe5049bf648a2e5dbd4f584c27be?tab=readme-ov-file#execute-endpoint
 */
export interface PistonResponse {
    language: 'c';
    version: string;
    compile?: {
        stdout: string;
        stderr: string;
        output: string;
        code: number;
        signal: string | null;
    };
    run: {
        stdout: string;
        stderr: string;
        output: string;
        code: number;
        signal: string | null;
    };
}
