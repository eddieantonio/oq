/**
 * Loads the participantId into EVERY page.
 */
export async function load({ cookies, locals }) {
    const participantId = cookies.get('participant_id');

    return {
        participantId,
        participant: locals.participant
    };
}
