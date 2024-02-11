export interface PythonError {
    exception: string;
    message: string;
    frames: Frame[];
}

export interface Frame {
    filename: string;
    startLineNumber: number;
    name?: string;
    line?: string;
    marker?: string;
}

/**
 * Parses simple Python tracebacks. Currently supported:
 *  - syntax errors (no execution frames)
 *  - simple runtime errors
 *
 * Not supported:
 *  - exception groups
 *  - nested exceptions
 */
export function parsePythonTraceback(error: string): PythonError | null {
    // The following is a weird, line-based recursive descent parser thing.
    // Key observation: most lines can be categorized by their leading whitespace:
    //
    //       0 | Traceback (most recent call last):
    //       2 |   File "/tmp/foo.py", line 3
    //      ≥4 |     do_bad_stuff()
    //      ≥4 |     ^^^^^^^^^^^^
    //       0 | BadStuffError: did bad stuff
    //       ? | and here is an extra line of message, just for fun
    //
    // Additionally, the entire traceback can be expressed as a regular
    // expression (treat each line as "character"):
    //
    //      T?(F(LS?)?)*EX
    //
    //       T | Traceback (most recent call last):
    //       F |   File "/tmp/foo.py", line 3
    //       L |     do_bad_stuff()
    //       S |     ^^^^^^^^^^^^
    //       E | BadStuffError: did bad stuff
    //       X | and here is an extra line of message, just for fun
    //
    // It is only sufficient to check how many preceding blanks there are
    // before deciding how to parse any given line.
    let lineIndex = 0;
    const lines = error.split('\n').map((line) => {
        const match = line.match(/^ */);
        if (match == null) throw new Error('failure-proof regex failed');
        const whitespace = match[0].length;
        return { whitespace, line };
    });

    // Nothing to parse:
    if (lines.length == 0) return null;

    try {
        parseTraceback();
        const frames = parseFrames();
        const [exception, message] = parseException();
        return {
            exception,
            message,
            frames
        };
    } catch (e) {
        if (e instanceof ParseError) return null;
        // Rethrow any other error -- it's probably a bug
        throw e;
    }

    function parseTraceback() {
        if (currentLine() == 'Traceback (most recent call last):') nextLine();
    }

    function parseFrames(): Frame[] {
        const frames = [];
        let nextFrame;
        while ((nextFrame = parseFrame()) != null) {
            frames.push(nextFrame);
        }
        return frames;
    }

    function parseFrame(): Frame | null {
        // A frame will ALWAYS have at least two spaces of indentation
        if (currentLeadingWhitespace() < 2) return null;

        const match = currentLine().match(/^ {2}File "([^"]+)", line (\d+)(?:, in (.+))?/);
        if (match == null) throw new ParseError('Frame header did not match');
        nextLine();
        const [, filename, lineNumber, maybeName] = match;

        const context = parseLine();

        const frame: Frame = {
            filename,
            startLineNumber: +lineNumber
        };

        if (maybeName) frame.name = maybeName;
        if (context?.line) frame.line = context.line;
        if (context?.squiggles) frame.marker = context.squiggles;

        return frame;
    }

    function parseLine(): { line: string; squiggles: string | null } | null {
        // A line will ALWAYS have at least four spaces of indentation
        if (currentLeadingWhitespace() < 4) return null;
        const line = currentLine().substring(4);
        nextLine();

        const squiggles = parseSquiggles();

        return { line, squiggles };
    }

    function parseSquiggles(): string | null {
        // The squiggles, like its line will ALWAYS have at least four spaces of indentation
        if (currentLeadingWhitespace() < 4) return null;
        const squiggles = currentLine().substring(4);
        nextLine();
        return squiggles;
    }

    function parseException(): [string, string] {
        const [exception] = currentLine().split(':', 1);

        const messageLines = [currentLine().substring(exception.length + 2)];
        while (nextLine()) {
            messageLines.push(currentLine());
        }
        // Remove trailing empty line:
        if (messageLines.length && messageLines[messageLines.length - 1] == '') messageLines.pop();

        return [exception, messageLines.join('\n')];
    }

    function nextLine(): boolean {
        lineIndex++;
        return lineIndex < lines.length;
    }

    function currentLine(): string {
        if (lineIndex >= lines.length) throw new ParseError('premature end of input');
        return lines[lineIndex].line;
    }

    function currentLeadingWhitespace() {
        if (lineIndex >= lines.length) throw new ParseError('premature end of input');
        return lines[lineIndex].whitespace;
    }
}

/** Thrown when the Python error message cannot be parsed. */
class ParseError extends Error {}
