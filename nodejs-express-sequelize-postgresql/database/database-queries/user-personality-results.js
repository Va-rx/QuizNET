const db = require('../database-connection');
const allColumns = "id, user_results_id as \"userResultsId\", socializer, killer, achiever, explorer";

const createUserPersonalityResults = async (userPersonalityResults) => {
    try {
        const res = await db.query(`INSERT INTO user_personality_results (user_results_id, socializer, killer, achiever, explorer) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [userPersonalityResults.userResultsId, userPersonalityResults.socializer, userPersonalityResults.killer, userPersonalityResults.achiever, userPersonalityResults.explorer]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const getAllPlayersAveragePersonalityConnectedToTest = async (testId) => {
    try {
        const res = await db.query(`SELECT ROUND(AVG(upr.socializer), 2) as socializer, ROUND(AVG(upr.killer), 2) as killer,
    ROUND(AVG(upr.achiever), 2) as achiever,
    ROUND(AVG(upr.explorer), 2) as explorer FROM test_history th INNER JOIN user_results ur ON th.id = ur.test_history_id INNER JOIN user_personality_results upr ON ur.id = upr.user_results_id WHERE th.id = $1`, [testId]);
        return res.rows;
    }
    catch (err) {
        console.log(err.message);
    }
}

const getPlayerPersonalityResultsConnectedToTest = async (userId, testId) => {
    try {
        const res = await db.query(`SELECT socializer, killer, achiever, explorer FROM test_history th INNER JOIN user_results ur ON th.id = ur.test_history_id INNER JOIN user_personality_results upr ON ur.id = upr.user_results_id WHERE th.id = $1 and ur.user_id = $2`, [testId, userId]);
        return res.rows;
        }
    catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    createUserPersonalityResults,
    getAllPlayersAveragePersonalityConnectedToTest,
    getPlayerPersonalityResultsConnectedToTest
}