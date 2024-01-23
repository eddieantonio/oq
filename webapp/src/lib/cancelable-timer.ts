export interface CancelableTimer {
    /** Cancels the timer. The timer cannot be un-cancelled. */
    cancel(): void;
    /** Returns how much time left is on the timer, in miliseconds. */
    timeLeft(): number;
}

/**
 * Returns a cancelable timer, queriable timer.
 *
 * @param delay How long the timer should be, in milliseconds.
 * @param callback What to call when the timer expires.
 * @returns A timer that can be cancelled.
 */
export function createTimer(delay: number, callback: () => void): CancelableTimer {
    // Code is inspired by: https://stackoverflow.com/a/20745721/6626414
    // (however, does not use pause/start semantics...)
    const started = new Date();
    const id = setTimeout(callback, delay);
    let running = true;

    return {
        cancel() {
            if (!running) return;
            running = false;
            clearTimeout(id);
        },

        timeLeft() {
            if (!running) return 0;

            const now = new Date();
            // Ensure that the time left is never negative:
            return Math.max(0, delay - (now.getTime() - started.getTime()));
        }
    };
}
