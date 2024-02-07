import { shuffle } from '$lib/random';
import { CONDITIONS, type Assignment, type TaskName } from '$lib/types';
import { TASKS } from './tasks';

// TODO: DO NOT USE THIS GLOBAL ANY MORE
export const assignmentGenerator = generateAssignments(
    // Only assign C tasks.
    TASKS.filter((task) => task.language == 'c').map((task) => task.name)
);

/**
 * Infinite generator of all possible assignments.
 *
 * This generator will yield random assignments, but ensures that all possible
 * assignments are equally likely. That is, task and condition are both randomly
 * assigned, but counterbalanced.
 *
 * NOTE: assignments will be counterbalanced AS LONG AS only one server process
 * is creating the assignments and does not restart between all assignments!
 */
export function* generateAssignments(
    taskNames: TaskName[]
): Generator<Assignment[], undefined, undefined> {
    let state = createInitialState(taskNames);

    while (true) {
        const [assignments, updatedState] = yieldNextAssignment(state);
        state = updatedState;
        yield assignments;
    }
}

export interface GeneratorState {
    allPossibleAssignments: Assignment[][];
    index: number;
}

/**
 * Generates the next possible assignment.
 * @param state the current state of the generator
 * @returns one array of assignments and the updated state.
 */
export function yieldNextAssignment(state: GeneratorState): [Assignment[], GeneratorState] {
    const { allPossibleAssignments } = state;
    let { index } = state;

    // Reached the end of all possible assignments: shuffle and start over.
    if (index >= allPossibleAssignments.length) {
        shuffle(allPossibleAssignments);
        index = 0;
    }

    // Get the next assignment
    const assignments = allPossibleAssignments[index];
    return [assignments, { allPossibleAssignments, index: state.index + 1 }];
}

/**
 * @returns the initial state of the generator
 */
export function createInitialState(taskNames: TaskName[]): GeneratorState {
    const allPossibleAssignments = [];
    for (const taskOrder of permutations(taskNames)) {
        for (const conditionOrder of permutations(CONDITIONS)) {
            const assignments: Assignment[] = taskOrder.map((task, index) => ({
                task,
                // Cycle the conditions so that the conditions repeat if there are
                // more tasks than conditions.
                condition: conditionOrder[index % CONDITIONS.length]
            }));
            allPossibleAssignments.push(assignments);
        }
    }
    return { allPossibleAssignments, index: 0 };
}

// Returns an array of all permutations of the given array.
// Generated by GitHub Copilot.
function permutations<T>(array: readonly T[]): T[][] {
    if (array.length <= 1) return [[...array]];

    const result = [];
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        // Slice out the current element.
        const rest = array.slice(0, i).concat(array.slice(i + 1));
        // Recurse to get permutations of the rest of the array.
        const restPermutations = permutations(rest);
        for (const perm of restPermutations) {
            result.push([element, ...perm]);
        }
    }
    return result;
}
