import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, expect, test } from 'vitest';
import { generateAssignments } from './create-assignments';
import { TASKS, loadTasksSync, taskNames } from './tasks';
import { CONDITIONS } from '$lib/types';

// Need to load all the tasks before running the tests.
beforeAll(() => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const defaultTasksDir = path.resolve(`${here}/../../../tasks`);

    if (TASKS.length === 0) {
        loadTasksSync(defaultTasksDir);
    }
});

test('generates a random assignment', () => {
    // Just check that the first thing yielded is an array of assignments.
    const gen = generateAssignments(taskNames());
    const first = gen.next().value;
    if (first === undefined) {
        throw new Error('Expected a value');
    }
    expect(first).instanceOf(Array);
    expect(first.length).toBe(taskNames().length);
    expect(first[0]).toHaveProperty('task');
    expect(first[0]).toHaveProperty('condition');
});

test('generates all possible assignments', () => {
    const totalPossibleAssignments = factorial(taskNames().length) * factorial(CONDITIONS.length);

    const gen = generateAssignments(taskNames());
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
