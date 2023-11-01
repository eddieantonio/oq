import { getAllAnswers } from "$lib/server/database";

export async function load() {
    // Fetch all records from database and return them as an array.
    const answers = await getAllAnswers();
    return {
        answers
    };
}
