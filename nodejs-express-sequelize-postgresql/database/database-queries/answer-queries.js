const db = require('../database-connection');
const allColumns = "answer_id as id, question_id as \"questionId\", answer, is_correct as \"isCorrect\"";

const getAnswers = async () => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM answers`);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const getAnswerById = async (id) => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM answers WHERE question_id = $1`, [id]);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const createAnswer = async (answer) => {
    try {
        const res = await db.query(`INSERT INTO answers (question_id, answer, is_correct) VALUES ($1, $2, $3) RETURNING *`, [answer.questionId, answer.answer, answer.isCorrect]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const updateAnswer = async (id, answer) => {
    try {
        const res = await db.query(`UPDATE answers SET question_id = $1, answer = $2, is_correct = $3 WHERE answer_id = $4 RETURNING *`, [answer.questionId, answer.answer, answer.isCorrect, id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const deleteAnswer = async (id) => {
    try {
        const res = await db.query(`DELETE FROM answers WHERE id = $1`, [id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    getAnswers,
    getAnswerById,
    createAnswer,
    updateAnswer,
    deleteAnswer
}