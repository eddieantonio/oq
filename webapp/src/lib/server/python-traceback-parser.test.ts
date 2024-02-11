import { expect, test } from 'vitest';

import { parsePythonTraceback } from './python-traceback-parser';

const SIMPLE_SYNTAX_ERROR = `  File "/tmp/main.py", line 5
    a + b = c
    ^^^^^
SyntaxError: cannot assign to expression here. Maybe you meant '==' instead of '='?
`;

test('it parses a simple syntax error', () => {
    const result = parsePythonTraceback(SIMPLE_SYNTAX_ERROR);
    expect(result).toMatchObject({
        exception: 'SyntaxError',
        message: "cannot assign to expression here. Maybe you meant '==' instead of '='?",
        frames: [
            {
                filename: '/tmp/main.py',
                startLineNumber: 5,
                line: 'a + b = c',
                marker: '^^^^^'
            }
        ]
    });
});

const MULTI_FRAME_ERROR = `Traceback (most recent call last):
  File "/tmp/main.py", line 13, in <module>
    print("the first 7 fibonacci numbers are", fibonacci(7))
                                               ^^^^^^^^^^^^
  File "/tmp/main.py", line 9, in fibonacci
    sequence.append(now)
    ^^^^^^^^^^^^^^^
AttributeError: 'tuple' object has no attribute 'append'
`;

test('it parses a multi-frame error', () => {
    const result = parsePythonTraceback(MULTI_FRAME_ERROR);
    expect(result).toMatchObject({
        exception: 'AttributeError',
        message: "'tuple' object has no attribute 'append'",
        frames: [
            {
                filename: '/tmp/main.py',
                name: '<module>',
                startLineNumber: 13,
                line: 'print("the first 7 fibonacci numbers are", fibonacci(7))',
                marker: '                                           ^^^^^^^^^^^^'
            },
            {
                filename: '/tmp/main.py',
                name: 'fibonacci',
                startLineNumber: 9,
                line: 'sequence.append(now)',
                marker: '^^^^^^^^^^^^^^^'
            }
        ]
    });
});

const NO_SOURCE_CONTEXT = `Traceback (most recent call last):
  File "<stdin>", line 3, in f
  File "<stdin>", line 2, in g
ValueError: fake error message
`;

test('it parses a multi-frame error without source context', () => {
    const result = parsePythonTraceback(NO_SOURCE_CONTEXT);
    expect(result).toMatchObject({
        exception: 'ValueError',
        message: 'fake error message',
        frames: [
            {
                filename: '<stdin>',
                name: 'f',
                startLineNumber: 3
            },
            {
                filename: '<stdin>',
                name: 'g',
                startLineNumber: 2
            }
        ]
    });
});
