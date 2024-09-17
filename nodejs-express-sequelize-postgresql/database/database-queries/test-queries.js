const db = require('../database-connection');

const { deleteQuestion, getQuestionMaxPoints } = require('./question-queries');

const getTests = () => {
    try {
        return db.query(`SELECT test_id as id, name, description, created_date, modified_date FROM tests`);
    } catch (err) {
        console.error('db query get tests error: ', err);
    }
}

const createTest = (test) => {
    if (test.name === undefined) test.name = "New test";
    if (test.description === undefined) test.description = null;

    try {
        return db.query(`INSERT INTO tests (name, description) VALUES ($1, $2) RETURNING test_id as id, name, description, created_date, modified_date`, [test.name, test.description]);
    } catch (err) {
        console.error('db query create test error: ', err);
    }
}

const getTest = (id) => {
    try {
        return db.query(`SELECT test_id as id, name, description, created_date, modified_date FROM tests WHERE test_id = $1`, [id]);
    } catch (err) {
        console.error('db query get test error: ', err);
    }
}

const updateTest = (test) => {
    try {
        return db.query(`UPDATE tests SET name = $1, description = $2 WHERE test_id = $3 RETURNING test_id as id, name, description, created_date, modified_date`, [test.name, test.description, test.id]);
    } catch (err) {
        console.error('db query update test error: ', err);
    }
}

const deleteTest = async (id) => {
    try {
        let rows_affected = 0;
        const questions_ids = (await getTestQuestions(id)).rows.map(row => row.id);

        rows_affected += (await db.query(`DELETE FROM sets WHERE test_id = $1`, [id])).rowCount;

        for (const question_id of questions_ids) {
            rows_affected += (await deleteQuestion(question_id));
        }

        rows_affected += (await db.query(`DELETE FROM tests WHERE test_id = $1`, [id])).rowCount

        return rows_affected;
    } catch (err) {
        console.error('db query delete test error: ', err);
    }
}

const getTestQuestions = (id) => {
    try {
        return db.query(`SELECT q.question_id as id, s.question_position as position, q.question, q.image_link, q.type FROM questions q JOIN sets s ON q.question_id = s.question_id WHERE s.test_id = $1 ORDER BY s.question_position ASC`, [id]);
    } catch (err) {
        console.error('db query get questions for test error: ', err);
    }
}

const getTestDetails = async (id) => {
    try {
        const test = (await getTest(id)).rows[0];
        const max_points = (await getTestMaxPoints(id));
        const questions = (await getTestQuestions(id)).rows;

        const result = {
            ...test,
            max_points: max_points,
            questions: questions
        };

        return result;
    } catch (err) {
        console.error('db query get test details error: ', err);
    }
}

const getTestMaxPoints = async (id) => {
    try {
        let result = 0;
        const questions = (await getTestQuestions(id)).rows;
        for (const question of questions) {
            result += (await getQuestionMaxPoints(question.id));
        }
        return result;
    } catch (err) {
        console.error('db query get test max points error: ', err);
    }
}

const addQuestionToTest = async (question, id) => {
    try {
        const numberOfQuestions = (await getTestQuestions(id)).rowCount;
        return db.query(`INSERT INTO sets (test_id, question_id, question_position) VALUES ($1, $2, $3) RETURNING question_position as position`, [id, question.id, numberOfQuestions+1]);
    } catch (err) {
        console.error('db query add question to test error: ', err);
    }
}

module.exports = {
    getTests,
    createTest,
    getTest,
    updateTest,
    deleteTest,
    getTestQuestions,
    getTestDetails,
    addQuestionToTest
}