/**
 * @file Miscellaneous types that are used on both the client and server.
 */

/**
 * All possible conditions in the study.
 * Note: conditions are labels, and are not ordered.
 */
export const CONDITIONS = ['control', 'enhanced', 'llm-enhanced'] as const;
/**
 * The study condition:
 *  - `control`: the basic error messages
 *  - `enhanced`: "better", (manually-enhanced) error messages
 *  - `llm-enhanced`: LLM-enhanced error messages
 */
export type Condition = (typeof CONDITIONS)[number];

/**
 * All possible stages of the study.
 * Stages are ordered from the initial stage to the final stage (completed).
 */
export const STAGES = [
    'pre-questionnaire',
    'exercise-1',
    'post-exercise-1',
    'exercise-2',
    'post-exercise-2',
    'exercise-3',
    'post-exercise-3',
    'final-questionnaire',
    'completed'
] as const;
/** Stage of the participant during the study. */
export type Stage = (typeof STAGES)[number];

/** The different tasks. Note: this will likely change */
export const TASK_NAMES = ['easy', 'medium', 'hard'] as const;
export type TaskName = (typeof TASK_NAMES)[number];

/**
 * Participants are assigned tasks and conditions for each exercise.
 * This should be done before the participant starts exercise-1.
 */
export interface Assignment {
    task: TaskName;
    condition: Condition;
}

/**
 * @returns the next stage after the given stage.
 * @throws if the given stage is invalid or if passed 'completed'
 */
export function nextStage(stage: Stage) {
    const index = STAGES.indexOf(stage);
    if (index === -1) throw new Error(`Invalid stage: ${stage}`);
    if (index === STAGES.length - 1) throw new Error(`No next stage after ${stage}`);
    return STAGES[index + 1];
}
