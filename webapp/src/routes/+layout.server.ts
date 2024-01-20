import { TASKS } from '$lib/server/tasks';

/**
 * Loads the participantId into EVERY page.
 */
export function load({ cookies }) {
    const participantId = cookies.get('participant_id');
    const tasks = TASKS;
    return {
        participantId,
        // DEBUG:
        tasks
    };
}
