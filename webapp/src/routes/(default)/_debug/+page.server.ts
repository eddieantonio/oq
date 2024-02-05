import { TASKS } from '$lib/server/tasks';

/**
 * @type {import('@sveltejs/kit').Load}
 */
export function load() {
    const taskNames = TASKS.map((task) => task.name);
    return {
        taskNames
    };
}

export const actions: import('./$types').Actions = {
    debugResetParticipantId: async ({ cookies }) => {
        cookies.delete('participant_id');
    }
};
