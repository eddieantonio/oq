/**
 * Loads the participantId into EVERY page.
 */
export function load({ cookies }) {
    const participantId = cookies.get('participant_id');
    return {
        participantId
    };
}
