const express = require('express');
const router = express.Router();
const { getAnswers, getAnswerById, createAnswer, updateAnswer, deleteAnswer} = require("../database/database-queries/answer-queries");



router.post("/", (req, res) => {
    const newAnswer = req.body;
    console.log(newAnswer);
    createAnswer(newAnswer)
        .then(answer => {
            res.send(answer);
        })
        .catch (err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the answer."
            });
        });
});

router.get("/", (req, res) => {
    getAnswers()
        .then(answers => {
            res.send(answers);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving answers."
            });
        });
});

router.get("/:id", (req, res) => {
    const id = req.params.id;
    getAnswerById(id)
        .then(answer => {
            res.send(answer);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving answer."
            });
        });
}
);

module.exports = router;