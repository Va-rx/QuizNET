const db = require('../database-connection');
const allColumns = "test_id as id, name, description";
const {deleteSetBySetId} = require("./set-queries");

const getTests = async () => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM tests`);
        return res.rows;
    } catch (err) {
        console.log(err.message);
    }
}

const getTestById = async (id) => {
    try {
        const res = await db.query(`
        SELECT q.question_id as id, q.question, q.image_link
        FROM questions q
        JOIN sets s ON q.question_id = s.question_id
        WHERE s.test_id = $1
    `, [id]);        
    return res.rows;
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
        const res = await db.query(`UPDATE tests SET name = $1, description = $2 WHERE test_id = $3 RETURNING *`, [test.name, test.description, id]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const deleteTest = async (id) => {
    try {
        const res1 = await db.query(`SELECT set_id FROM sets WHERE test_id = $1`, [id]); // pytanie zostaje dalej w bazie, tylko set usuwane
        console.log(res1);
        console.log("DZIALA");
        if (res1.rowCount > 0) {
            res1.rows.forEach(rows => {
                deleteSetBySetId(rows.set_id);
            })
        }

        const res = await db.query(`DELETE FROM tests WHERE test_id = $1`, [id]);
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