export const actions: import('./$types').Actions = {
    debugResetParticipantId: async ({ cookies }) => {
        cookies.delete('participant_id');
    }
};
