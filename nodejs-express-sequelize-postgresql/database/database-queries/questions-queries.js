const db = require('../database-connection');

const getQuestions = async () => {
    try {
        const res = await db.query(`SELECT * FROM questions`);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const getQuestionById = async (id) => {
    try {
        const res = await db.query(`SELECT * FROM questions WHERE id = $1`, [id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const createQuestion = async (question) => {
    try {
        const res = await db.query(`INSERT INTO questions (question, image_link) VALUES ($1, $2) RETURNING *`, [question.question, question.image_link]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const updateQuestion = async (id, question) => {
    try {
        const res = await db.query(`UPDATE questions SET question = $1, image_link = $2 WHERE id = $3 RETURNING *`, [question.question, question.image_link, id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const deleteQuestion = async (id) => {
    try {
        const res = await db.query(`DELETE FROM questions WHERE id = $1`, [id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const deleteQuestions = async () => {
    try {
        const res = await db.query(`TRUNCATE TABLE questions CASCADE;`);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    deleteQuestions
}

