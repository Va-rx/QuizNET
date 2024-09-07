const express = require('express');
const {createUserResults, getUserResultsByTestId} = require("../database/database-queries/user-results-queries");
const {generateAnswerXML, parseXML} = require("../XMLhandler");
const router = express.Router();

router.post("/", async (req, res) => {
    const { testId, userId, answers } = req.body;
    const answerMap = new Map(answers);
    let answerXML = await generateAnswerXML(answerMap);
    createUserResults({ userId, testHistoryId: testId, answers: answerXML }).then(result => {
        res.send(result);
    }).catch(
        err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the user result."
            });
        }
    );
});

router.get("/:id/:userId", async (req, res) => {
    const {id, userId} = req.params;
    const answers = await getUserResultsByTestId(userId,id);
    const parsedAnswers = await parseXML(answers.answers);

    if (parsedAnswers === null) {
        return res.status(500).send({ hasError: "Error parsing XML" });
    }
    const answers1 = {
        questions: parsedAnswers.answers.question.map((q) => ({
            id:  parseInt(q.$.id),
            answers: q.answer.map(a => parseInt(a))
        }))
    };

    res.json(answers1);
});

module.exports = router;

