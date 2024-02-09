import { taskNames } from '$lib/server/tasks';

/**
 * @type {import('@sveltejs/kit').Load}
 */
export function load() {
    return {
        taskNames: taskNames()
    };
}

export const actions: import('./$types').Actions = {
    debugResetParticipantId: async ({ cookies }) => {
        cookies.delete('participant_id');
    }
};
