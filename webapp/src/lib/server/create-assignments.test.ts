import { expect, test } from 'vitest';
import { generateAssignments } from './create-assignments';
import { CONDITIONS, type TaskName } from '$lib/types';

const TASK_NAMES = [
    'flipped-assignment' as TaskName,
    'invalid-import' as TaskName,
    'keyword-as-identifier' as TaskName,
    'missing-indent' as TaskName,
    'missing-param' as TaskName,
    'modify-const' as TaskName
];

test('generates a random assignment', () => {
    // Just check that the first thing yielded is an array of assignments.
    const gen = generateAssignments(TASK_NAMES);
    const first = gen.next().value;
    if (first === undefined) {
        throw new Error('Expected a value');
    }
    expect(first).instanceOf(Array);
    expect(first.length).toBe(TASK_NAMES.length);
    expect(first[0]).toHaveProperty('task');
    expect(first[0]).toHaveProperty('condition');
});

test('generates all possible assignments', () => {
    const totalPossibleAssignments = factorial(TASK_NAMES.length) * factorial(CONDITIONS.length);

    const gen = generateAssignments(TASK_NAMES);
    const set = new Set();
    for (let i = 0; i < totalPossibleAssignments; i++) {
        const assignments = gen.next().value;
        if (assignments === undefined) {
            throw new Error('Expected a value');
        }
        set.add(JSON.stringify(assignments));
    }

    expect(set.size).toBe(totalPossibleAssignments);

    // Get another one, for a laugh.
    const assignments = gen.next().value;
    if (assignments === undefined) {
        throw new Error('Expected a value');
    }
    set.add(JSON.stringify(assignments));
    // It should already be in the set.
    expect(set.size).toBe(totalPossibleAssignments);

    function factorial(n: number): number {
        let result = 1;
        while (n > 1) {
            result *= n;
            n--;
        }
        return result;
    }
});
