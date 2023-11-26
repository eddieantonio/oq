/**
 * @file A collection of functions that don't fit anywhere else.
 */

import type { Condition } from '$lib/types';
import type { ExerciseId } from './newtypes';

/**
 * Returns the exercise ID, or null if it's not a valid exercise ID.
 */
export function toExerciseId(exerciseId: FormDataEntryValue | null): ExerciseId | null {
    if (!exerciseId || typeof exerciseId != 'string') return null;
    return exerciseId as ExerciseId;
}

/**
 * Validates and returns the condition, or null if it's not a valid condition.
 */
export function toCondition(input: FormDataEntryValue | null): Condition | null {
    switch (input) {
        case 'control':
        case 'enhanced':
        case 'llm-enhanced':
            return input;
        default:
            return null;
    }
}
