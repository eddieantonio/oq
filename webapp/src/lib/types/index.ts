/**
 * @file Miscellaneous types that are used on both the client and server.
 */

/**
 * All possible conditions in the study.
 * Note: conditions are labels, and are not ordered.
 */
export const CONDITIONS = [
    'control',
    //'enhanced',
    'llm-enhanced',
    'finetuned'
] as const;
/**
 * The study condition:
 *  - `control`: the basic error messages
 *  - `enhanced`: "better", (manually-enhanced) error messages
 *  - `llm-enhanced`: LLM-enhanced error messages
 *  - `finetuned`: LLM-enhanced error messages with a fine-tuned model
 */
export type Condition = (typeof CONDITIONS)[number];

/**
 * All possible stages of the study.
 * Stages are ordered from the initial stage to the final stage (completed).
 */
const STAGES = [
    'pre-questionnaire',
    // TODO: this is hacky. Instead, encapsulate global -- change to using classroom info to get the stages.
    'exercise-1',
    'post-exercise-1',
    'exercise-2',
    'post-exercise-2',
    'exercise-3',
    'post-exercise-3',
    'exercise-4',
    'post-exercise-4',
    'exercise-5',
    'post-exercise-5',
    'exercise-6',
    'post-exercise-6',
    'final-questionnaire',
    'completed',
    // Pseudo-stage. Participants are manually placed in this stage if they must restart from the beginnning.
    'retake'
] as const;
/** Stage of the participant during the study. */
export type Stage = (typeof STAGES)[number];

/** The name of a task. */
export type TaskName = string & { __taskName: never };

/**
 * Participants are assigned tasks and conditions for each exercise.
 * This should be done before the participant starts exercise-1.
 */
export interface Assignment {
    task: TaskName;
    condition: Condition;
}

/**
 * Code to be run on the server.
 */
export interface RunnableProgram {
    /** Programming language. */
    language: string;
    /** Name of the file.  */
    filename: string;
    /** Full source code of the file. */
    sourceCode: string;
}

/**
 * Code "markers", intended to be converted to annotations (e.g., red squiggly
 * lines) in the Monaco editor.
 */
export interface JsonMarkerData {
    severity: 'error' | 'hint' | 'info' | 'warning';
    message: string;
    startColumn: number;
    endColumn: number;
    startLineNumber: number;
    endLineNumber: number;
}

export const SUPPORTED_PROGRAMMING_LANGUAGES = ['c', 'python', 'rust'] as const;
/** A programming language supported by the webapp. */
export type ProgrammingLanguage = (typeof SUPPORTED_PROGRAMMING_LANGUAGES)[number];

/**
 * @returns the next stage after the given stage.
 * @throws if the given stage is invalid or if passed 'completed'
 */
export function nextStage(stage: Stage) {
    const index = STAGES.indexOf(stage);
    if (index === -1) throw new Error(`Invalid stage: ${stage}`);
    if (index === STAGES.length - 1) throw new Error(`No next stage after ${stage}`);

    const result = STAGES[index + 1];
    if (result == 'retake') throw new Error('Cannot advance to retake stage');
    return result;
}

/**
 * @returns the previous stage before the given stage.
 * @throws if the given stage is invalid or if passed 'pre-questionnaire'
 */
export function previousStage(stage: Stage): Stage {
    const index = STAGES.indexOf(stage);
    if (index === -1) throw new Error(`Invalid stage: ${stage}`);
    if (index === 0) throw new Error(`No previous stage before ${stage}`);
    return STAGES[index - 1];
}

/**
 * @returns the initial stage of the study.
 */
export function firstStage(): Stage {
    return STAGES[0];
}

/**
 * @returns an array of all stages
 */
export function stages(): readonly Stage[] {
    return STAGES;
}
