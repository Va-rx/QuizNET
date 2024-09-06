const db = require('../database-connection');
const allColumns = "id, test_name as \"testName\", content, created_at as \"createdAt\""

const getTestHistoryById = async (id) => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM testhistory WHERE id = $1`, [id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const createTestHistory = async (testHistory) => {
    try {
        const res = await db.query(`INSERT INTO testhistory (test_name, content, created_at) VALUES ($1, $2, $3) RETURNING *`, [testHistory.testName, testHistory.content, testHistory.createdAt]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    getTestHistoryById,
    createTestHistory
}