const express = require('express');
const router = express.Router();
const { getAnswers, getAnswerById, createAnswer, updateAnswer, deleteAnswer} = require("../database/database-queries/answers-queries");



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


module.exports = router;