const db = require('../database-connection');

const getTests = async () => {
    try {
        const res = await db.query(`SELECT * FROM tests`);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const getTestById = async (id) => {
    try {
        const res = await db.query(`SELECT * FROM tests WHERE id = $1`, [id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const createTest = async (test) => {
    try {
        const res = await db.query(`INSERT INTO tests (name, description) VALUES ($1, $2) RETURNING *`, [test.name, test.description]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const updateTest = async (id, test) => {
    try {
        const res = await db.query(`UPDATE tests SET name = $1, description = $2 WHERE id = $3 RETURNING *`, [test.name, test.description, id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const deleteTest = async (id) => {
    try {
        const res = await db.query(`DELETE FROM tests WHERE id = $1`, [id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    getTests,
    getTestById,
    createTest,
    updateTest,
    deleteTest
}