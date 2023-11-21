/**
 * The different types of diagnostics that can be returned by RCE.
 *
 * This is a discriminated union, with `format` as the discriminator.
 * See: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions
 */
type Diagnostics = GCCDiagnostics | PlainTextDiagnostics;

/**
 * Diagnostics generated by GCC using -fdiagnostics-format=json.
 */
interface GCCDiagnostics {
    format: 'gcc-json';
    diagnostics: RootGCCDiagnostic[];
}

/**
 * Generic, plain-text diagnostics.
 */
interface PlainTextDiagnostics {
    format: 'plain-text';
    diagnostics: string[];
}

/**
 * See: https://gcc.gnu.org/onlinedocs/gcc-11.1.0/gcc/Diagnostic-Message-Formatting-Options.html
 */
interface GCCDiagnostic {
    kind: 'error' | 'warning' | 'note';
    /**
     * The human-readable diagnostic message.
     */
    message: string;
    /**
     * If [kind] is 'warning', then there is an option key describing the command-line option controlling the warning.
     */
    option?: string;
    /**
     * A diagnostic can contain zero or more locations.
     */
    locations: Location[];
    /**
     * Diagnostics can have child diagnostics.
     * Eddie says: "This will often be a 'note' that provides some additional context".
     */
    children: GCCDiagnostic[];
    /**
     * [Hints] whether non-ASCII bytes should be escaped when printing the
     * pertinent lines of source code (true for diagnostics involving source
     * encoding issues).
     */
    'escape-source': boolean;
}

/**
 * A non-child GCC diagnostic. This will contain the column-origin field.
 */
interface RootGCCDiagnostic extends GCCDiagnostic {
    /**
     * What kind of indexing to use for the column numbers in the locations.
     * GCC defaults to 1-based indexing, but can be configured to use 0-based indexing.
     */
    'column-origin': number;
}

interface Location {
    /**
     * Each location has an optional label string and up to three positions within it: a caret position and optional start and finish positions.
     */
    label?: string;
    /**
     * The primary position of a location (where you would put the ^ when printing the message).
     */
    caret: Position;
    /**
     * Eddie says: "I have never seen GCC generate a start position outside a fixit hint"
     */
    start?: Position;
    /**
     * A position to the right of the caret.
     */
    finish?: Position;
}

interface Position {
    /**
     * A position is described by a file name, a line number, and three numbers indicating a column position.
     */
    file: string;

    /**
     * Line numbers are 1-based.
     */
    line: number;
    /**
     * display-column counts display columns, accounting for tabs and multibyte characters.
     */
    'display-column': number;
    /**
     * byte-column counts raw bytes.
     */
    'byte-column': number;
    /**
     * column is equal to one of the previous two, as dictated by the -fdiagnostics-column-unit option.
     */
    column: number;
}

/**
 * Running the code on the RCE server will return a JSON object with the
 * following structure:
 */
interface RunResult {
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