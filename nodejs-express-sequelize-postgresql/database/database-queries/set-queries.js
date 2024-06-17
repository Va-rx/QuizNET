const db = require('../database-connection');
const allColumns = "set_id as id, test_id as \"testId\", question_id as \"questionId\"";

const getSets = async () => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM sets`);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const getQuestionsByTestId = async (id) => {
    try {
        const res = await db.query(`SELECT q.question_id as id, question, image_link FROM sets tq INNER JOIN questions q on q.question_id = tq.question_id WHERE test_id = $1`, [id]);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const addQuestionToTest = async (set) => {
    try {
        const res = await db.query(`INSERT INTO sets (test_id, question_id) VALUES ($1, $2) RETURNING *`, [set.testId, set.questionId]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const deleteSet = async (set) => {
    try {
        const res = await db.query(`DELETE FROM sets WHERE test_id = $1 and question_id = $2`, [set.testId, set.questionId]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}



module.exports = {
    getSets,
    getQuestionsByTestId,
    addQuestionToTest,
    deleteSet
}