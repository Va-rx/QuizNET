const express = require('express');
const router = express.Router();

const { getTests, createTest, getTest, updateTest, deleteTest, getTestDetails, addQuestionToTest } = require('../database/database-queries/test-queries');

router.get("/", async (req, res) => {
    try {
        const result = await getTests();
        res.status(200).send(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.post("/", async (req, res) => {
    const test = req.body;
    try {
        const result = await createTest(test);
        res.status(201).send(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
    }

});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await getTest(id);
        if (result.rows.length === 0) {
            res.status(404).send({ message: 'Test not found' });
        }
        res.status(200).send(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.put("/:id", async (req, res) => {
    const test = req.body;
    try {
        const result = await updateTest(test);
        if (result.rows.length === 0) {
            res.status(404).send({ message: 'Test not found' });
        }
        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error(error);

    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const rowsAffected = await deleteTest(id);
        if (rowsAffected > 0) {
            res.status(200).send({ message: `${rowsAffected} row(s) deleted` });
        } else {
            res.status(404).send({ message: 'No rows found to delete' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.get("/:id/details", async (req, res) => {
    const id = req.params.id;
    try {
        const test_details = (await getTestDetails(id));
        // dodać ewentualnie czy dobry test_id
        res.status(200).send(test_details);
    } catch (error)  {
        console.error(error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

router.post("/:id/questions", async (req, res) => {
    const test_id = req.params.id;
    const question = req.body;
    try {
        const result = await addQuestionToTest(question, test_id);
        res.status(201).send(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
    }
})

module.exports = router;