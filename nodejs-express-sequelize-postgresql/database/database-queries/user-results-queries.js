const db = require('../database-connection');
const allColumns = "id, user_id as \"userId\",test_history_id as \"testHistoryId\", answers"



const createUserResults = async (userResults) => {
    try {
        const res = await db.query(`INSERT INTO user_results (user_id, test_history_id, answers) VALUES ($1, $2, $3) RETURNING *`, [userResults.userId, userResults.testHistoryId, userResults.answers]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const getUserResultsByTestId = async (userId, testId) => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM user_results WHERE test_history_id = $1 and user_id = $2 `, [testId, userId]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    createUserResults,
    getUserResultsByTestId,
}