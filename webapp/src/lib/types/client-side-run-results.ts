import type { Diagnostics } from './diagnostics';

/**
 * Results of running code, intended for use on the client-side.
 *
 * These results include information that is:
 *  - safe to transmit to the client
 *  - convenient to use by client-side code
 */
export interface ClientSideRunResult {
    /** True when the source code can be submitted. */
    success: boolean;
    /** (optional) Diagnostics for this code run. */
    diagnostics?: Diagnostics;
    /** (optional) Runtime output for this code run. */
    output?: string;
}
