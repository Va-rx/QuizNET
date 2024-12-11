const db = require('../database-connection');

const deleteAnswer = (id) => {
    try {
        return db.query(`DELETE FROM answers WHERE id = $1`, [id]);
    } catch (err) {
        console.error('db query delete answer error: ', err);
    }
}

const updateAnswer = (id, answer) => {
    try {
        return db.query(`UPDATE answers SET question_id = $1, answer = $2, is_correct = $3, points = $4 WHERE id = $5
                         RETURNING question_id as questionId, answer, is_correct as isCorrect, points`, [answer.questionId, answer.answer, answer.isCorrect, answer.points, id]);
    } catch (err) {
        console.error('db query update answer error: ', err);
    }
}

const createAnswer = (answer) => {
    try {
        return db.query(`INSERT INTO answers (question_id, answer, is_correct, points) VALUES ($1, $2, $3, $4) RETURNING question_id as questionId, answer, is_correct as isCorrect, points`, [answer.questionId, answer.answer, answer.isCorrect, answer.points]);
    } catch (err) {
        console.error('db query create answer error: ', err);
    }
}

module.exports = {
    deleteAnswer,
    updateAnswer,
    createAnswer
}