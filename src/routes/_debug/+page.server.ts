export function load({ cookies }) {
    const participantId = cookies.get('participant_id');

    return {
        participantId
    };
}

export const actions: import('./$types').Actions = {
    debugResetParticipantId: async ({ cookies }) => {
        cookies.delete('participant_id');
    }
};
