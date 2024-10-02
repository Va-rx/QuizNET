const db = require('../database-connection');
const allColumns = "id, test_name as \"testName\", content, created_at as \"createdAt\""

const getTestHistoryById = async (id) => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM test_history WHERE id = $1`, [id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const getAllTestHistory = async () => {
    try {
        const res = await db.query(`SELECT id, test_name as \"testName\" , created_at as \"createdAt\" FROM test_history`);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const getAllTestHistoryConnectedToUser = async (userId) => {
    try {
        const res = await db.query(`select th.test_name as \"testName\", th.created_at as \"createdAt\", th.id from test_history th inner join user_results ur on th.id = ur.test_history_id where user_id = $1`, [userId]);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const createTestHistory = async (testHistory) => {
    try {
        const res = await db.query(`INSERT INTO test_history (test_name, content, created_at) VALUES ($1, $2, $3) RETURNING *`, [testHistory.testName, testHistory.content, testHistory.createdAt]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    getTestHistoryById,
    createTestHistory,
    getAllTestHistory,
    getAllTestHistoryConnectedToUser
}