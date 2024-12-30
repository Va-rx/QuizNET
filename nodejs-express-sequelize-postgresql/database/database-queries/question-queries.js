const db = require('../database-connection');const { deleteAnswer, updateAnswer, createAnswer } = require('./answer-queries');


const getQuestion = (id) => {
    try {
        return db.query(`SELECT id, question, image_link, type FROM questions WHERE id = $1`, [id]);
    } catch (err) {
        console.error("db query get question error: ", err);
    }
}

const getAnswersToQuestion = (id) => {
    try {
        return db.query(`SELECT id, answer, is_correct as "isCorrect", points FROM answers WHERE question_id = $1`, [id]);
    } catch (err) {
        console.error("db query get answers error: ", err);
    }
}

const deleteQuestion = async (id) => {
    try {
        let rows_affected = 0;
        const answers_ids = (await getAnswersToQuestion(id)).rows.map(row => row.id);
        rows_affected += (await deleteQuestionFromTest(id)).rowCount;


        for (const answer_id of answers_ids) {
            rows_affected += (await deleteAnswer(answer_id)).rowCount;
        }

        rows_affected += (await db.query(`DELETE FROM questions WHERE id = $1`, [id])).rowCount;

        return rows_affected;
    } catch (err) {
        console.error("db query delete question error: ", err)
    }
}

const updateQuestion = async (id, question) => {
    try {
        const updatedQuestion = await db.query(`UPDATE questions SET question = $1, image_link = $2, type = $3 WHERE id = $4 RETURNING question, image_link, type, id`, [question.question, question.image_link, question.type, id]);
        const updatedPosition = await db.query(`UPDATE sets SET question_position = $1 WHERE question_id = $2 RETURNING question_position as position`, [question.position, id]);
        const result = {
            id: updatedQuestion.rows[0].id,
            question: updatedQuestion.rows[0].question,
            image_link: updatedQuestion.rows[0].image_link,
            type: updatedQuestion.rows[0].type,
            position: updatedPosition.rows[0].position
        };
        return result;
    } catch (err) {
        console.error("db query update question error: ", err);
    }
}

const createQuestion = (question) => {
    try {
        return db.query(`INSERT INTO questions (question, image_link, type) VALUES ($1, $2, $3) RETURNING id, question, image_link, type`, [question.question, question.image_link, question.type]);
    } catch (err) {
        console.error('db query create question error: ', err);
    }
}

const deleteQuestionFromTest = (id) => {
    try {
        return db.query(`DELETE FROM sets WHERE question_id = $1`, [id]);
    } catch (err) {
        console.error('db query deleting question from tests error: ', err);
    }
}

const getQuestionMaxPoints = async (id) => {
    try {
        let result = 0;
        const answers = (await getAnswersToQuestion(id)).rows;
        for (const answer of answers) {
            if (answer.isCorrect) {
                result += answer.points;
            }
        }
        return result;
    } catch (err) {
        console.error('db query get question max points error: ', err);
    }
}

const getTestQuestionsWithAnswers = async (id) => {
    try {

    } catch (err) {
        console.error('db query get test questions with answers error')
    }
}


module.exports = {
    getQuestion,
    getAnswersToQuestion,
    deleteQuestion,
    createQuestion,
    getQuestionMaxPoints,
    updateQuestion,
    // getTestQuestionsWithAnswers
}