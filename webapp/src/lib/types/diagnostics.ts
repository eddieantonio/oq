import type { MarkdownString } from '$lib/server/newtypes';
import type { JsonMarkerData } from '.';

/**
 * The different types of diagnostics that can be associated with code that is
 * compiled and run by oq.
 *
 * This is a discriminated union, with `format` as the discriminator.
 * See: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions
 */
export type Diagnostics =
    | PreformattedDiagnostic
    | GCCDiagnostics
    | LLMEnhancedDiagnostics
    | ManuallyEnhancedDiagnostic;

/**
 * Plain-text diagnostics with pre-formatted text.
 */
export interface PreformattedDiagnostic {
    format: 'preformatted';
    plainText: string;
}

/**
 * Diagnostics generated by GCC using -fdiagnostics-format=json.
 */
export interface GCCDiagnostics {
    format: 'gcc-json';
    diagnostics: RootGCCDiagnostic[];
}

/**
 * Diagnostics that were "enhanced" by an LLM. These will always contain the
 * original diagnostics.
 */
export interface LLMEnhancedDiagnostics {
    format: 'llm-enhanced';
    markdown: MarkdownString;
    original: Diagnostics;
}

/**
 * Diagnostics that were manually enhanced by a human.
 * These will always be written in Markdown.
 * Currently (2023-01-20), you can find these in webapp/tasks/
 */
export interface ManuallyEnhancedDiagnostic {
    format: 'manually-enhanced';
    markdown: MarkdownString;
    markers: JsonMarkerData[];
}

/**
 * See: https://gcc.gnu.org/onlinedocs/gcc-11.1.0/gcc/Diagnostic-Message-Formatting-Options.html
 */
export interface GCCDiagnostic {
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
    locations: GCCLocation[];
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
export interface RootGCCDiagnostic extends GCCDiagnostic {
    /**
     * What kind of indexing to use for the column numbers in the locations.
     * GCC defaults to 1-based indexing, but can be configured to use 0-based indexing.
     *
     * @since gcc 11.1.0
     */
    'column-origin'?: number;
}

interface GCCLocation {
    /**
     * Each location has an optional label string and up to three positions within it: a caret position and optional start and finish positions.
     */
    label?: string;
    /**
     * The primary position of a location (where you would put the ^ when printing the message).
     */
    caret: GCCPosition;
    /**
     * Eddie says: "I have never seen GCC generate a start position outside a fixit hint"
     */
    start?: GCCPosition;
    /**
     * A position to the right of the caret.
     */
    finish?: GCCPosition;
}

interface GCCPosition {
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
    'display-column'?: number;
    /**
     * byte-column counts raw bytes.
     */
    'byte-column'?: number;
    /**
     * column is equal to one of the previous two, as dictated by the -fdiagnostics-column-unit option.
     */
    column: number;
}
