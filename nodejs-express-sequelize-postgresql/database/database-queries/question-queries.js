const db = require('../database-connection');
const {getAnswerById, createAnswer, updateAnswer, getAnswersForQuestion} = require("./answer-queries");
const {deleteSetBySetId} = require("./set-queries");
const allColumns = "question_id as id, question, image_link";

const getQuestions = async () => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM questions`);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const  getQuestionById = async (id) => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM questions WHERE question_id = $1`, [id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}


const getQuestionsWithAnswers = async () => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM questions`);
        for (const row of res.rows) {
            row.answers = await getAnswerById(row.id);
        }
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const getQuestionByIdWithAnswers = async (id) => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM questions WHERE question_id = $1`, [id]);
        res.rows[0].answers = await getAnswerById(id);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const createQuestion = async (question) => {
    try {
        const res = await db.query(`INSERT INTO questions (question, image_link) VALUES ($1, $2) RETURNING *`, [question.question, question.image_link]);
        if (res.rows[0].question_id && res.rows[0].question_id !== -1){
            let parsedAnswers = JSON.parse(question.answers);
            for (const answer of parsedAnswers ){
                answer.questionId = res.rows[0].question_id;
                await createAnswer(answer);
            }
        }
    } catch (err) {
        console.log(err.message);
    }
}

const updateQuestion = async (id, question) => {
    try {
        const res =  question.image_link !== null ? await db.query(`UPDATE questions SET question = $1, image_link = $2 WHERE question_id = $3 RETURNING *`, [question.question, question.image_link, id]) : await db.query(`UPDATE questions SET question = $1 WHERE question_id = $2 RETURNING *`, [question.question, id]);
        if (res.rows[0]){
            let parsedAnswers = JSON.parse(question.answers);
            let updatedIds = [];
            for (const answer of parsedAnswers) {
                updatedIds.push(answer.id);
            }
            
            const oldIds = await getAnswersForQuestion(id);
            for (const answer of oldIds) {
                if (!updatedIds.includes(answer.id)) {
                    await db.query(`DELETE FROM answers WHERE answer_id = $1`, [answer.id]);
                }
            }

            for (const answer of parsedAnswers ){
                if (answer.id){
                    await updateAnswer(answer.id, answer);
                }
                else {
                    await createAnswer(answer);
                }

            }
        }
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const deleteQuestion = async (id) => {
    try {
        const res1 = await db.query(`SELECT set_id FROM sets WHERE question_id = $1`, [id]);
        console.log(res1);
        if (res1.rowCount > 0) {
            console.log("hm");
            await deleteSetBySetId(res1.rows[0].set_id);
        }

        const res = await db.query(`DELETE FROM questions WHERE question_id = $1`, [id]);
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
    getQuestionByIdWithAnswers,
    getQuestionsWithAnswers,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    deleteQuestions
}

