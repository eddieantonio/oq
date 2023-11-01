
// The dumbest database for now.
const db: Map<string, Answer> = new Map();
// Maps a question id to the response.
export interface Answer {
    question_id: string,
    answer: string,
}
// That's it for now. Later I will add "partipant_id" later.

export function saveAnswer(answer: Answer) {
    db.set(answer.question_id, answer);
}

export function getAllAnswers(): Answer[] {
    return Array.from(db.values());
}
