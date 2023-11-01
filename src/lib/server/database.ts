
// The dumbest database for now.
export const db: Map<string, Answer> = new Map();
// Maps a question id to the response.
interface Answer {
    question_id: string,
    answer: string,
}
// That's it for now. Later I will add "partipant_id" later.