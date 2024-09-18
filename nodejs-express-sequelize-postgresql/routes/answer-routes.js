const express = require('express');
const router = express.Router();

const { deleteAnswer, updateAnswer, createAnswer } = require('../database/database-queries/answer-queries');

router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const answer = req.body;
        
        const updatedAnswer = (await updateAnswer(id, answer));

        if (updatedAnswer.rows.length === 0) {
            res.status(404).send('There is not answer with specified id');
        }

        res.status(200).send(updatedAnswer.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    };
});

router.post("/", async (req, res) => {
    try {
        const answer = req.body;
    
        const createdAnswer = (await createAnswer(answer));


        res.status(201).send(createdAnswer.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    };
})

router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const deletedAnswerResponse = (await deleteAnswer(id));

        res.status(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
})

module.exports = router;
