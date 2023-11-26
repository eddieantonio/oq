/**
 * @file A collection of functions that don't fit anywhere else.
 */

import type { ExerciseId } from './newtypes';

/**
 * Returns the exercise ID, or null if it's not a valid exercise ID.
 */
export function toExerciseId(exerciseId: FormDataEntryValue | null): ExerciseId | null {
    if (!exerciseId || typeof exerciseId != 'string') return null;
    return exerciseId as ExerciseId;
}
