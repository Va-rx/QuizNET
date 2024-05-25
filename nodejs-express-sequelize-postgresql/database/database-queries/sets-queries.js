const db = require('../database-connection');

const getSets = async () => {
    try {
        const res = await db.query(`SELECT * FROM sets`);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const getSetById = async (id) => {
    try {
        const res = await db.query(`SELECT * FROM sets WHERE test_id = $1`, [id]);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const createSet = async (set) => {
    try {
        const res = await db.query(`INSERT INTO sets (test_id, question_id) VALUES ($1, $2) RETURNING *`, [set.test_id, set.question_id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const updateSet = async (id, set) => {
    try {
        const res = await db.query(`UPDATE sets SET test_id = $1, question_id = $2 WHERE id = $3 RETURNING *`, [set.testId, set.questionId, id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const deleteSet = async (id) => {
    try {
        const res = await db.query(`DELETE FROM sets WHERE id = $1`, [id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    getSets,
    getSetById,
    createSet,
    updateSet,
    deleteSet
}