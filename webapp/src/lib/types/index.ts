/**
 * @file Miscellaneous types that are used on both the client and server.
 */

/**
 * The study condition:
 *  - `control`: the basic error messages
 *  - `enhanced`: "better", (manually-enhanced) error messages
 *  - `llm-enhanced`: LLM-enhanced error messages
 */
export type Condition = 'control' | 'enhanced' | 'llm-enhanced';
