const express = require('express');
const router = express.Router();
const db = require('../database/database-connection');
const e = require('express');
const upload = require('../upload');

const { getQuestion, getAnswersToQuestion, deleteQuestion, updateQuestion, createQuestion, getQuestionMaxPoints } = require("../database/database-queries/question-queries");


router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const question = (await getQuestion(id)).rows;
        if (question.length === 0) {
            res.status(404).send({ message: 'Question not found' });
        }

        const answers = (await getAnswersToQuestion(id)).rows;
        const max_points = await getQuestionMaxPoints(id);

        if (question[0].image_link) {
            question[0].image_link = question[0].image_link.toString('base64');
        }

        const result = {
            ...question[0],
            maxPoints: max_points,
            answers: answers
        }

        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
    }
})

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const rowsAffected = await deleteQuestion(id);
        if (rowsAffected > 0) {
            res.status(200).send({ message: `${rowsAffected} row(s) deleted` });
        } else {
            res.status(404).send({ message: 'No rows found to delete' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
    }
})

router.patch("/:id", upload.single('image_link'), async (req, res) => {
    try {
        const id = req.params.id;
        const question = req.body;
        question.image_link = req.file.buffer;

        const result = (await updateQuestion(id, question));
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
    }
})

router.post("/", async (req, res) => {
    const question = req.body;
    try {
        const updatedQuestion = (await createQuestion(question)).rows[0];
        res.status(201).send(updatedQuestion);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Internal server error' });
    }
})


module.exports = router;