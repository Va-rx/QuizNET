const express = require('express');
const {createUserResults, getUserResultsByTestId} = require("../database/database-queries/user-results-queries");
const {generateAnswerXML, parseXML} = require("../XMLhandler");
const {getTestHistoryById} = require("../database/database-queries/test-history-queries");
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
    const test = await getTestHistoryById(id);
    const answers = await getUserResultsByTestId(userId,id);

    if (!test) {
        return res.status(404).send({ hasError: "Test not found" });
    }
    if (!answers) {
        return res.status(404).send({ hasError: "Answers not found" });
    }

    const parsedResult = await parseXML(test.content);
    const parsedAnswers = await parseXML(answers.answers);

    if (parsedAnswers === null) {
        return res.status(500).send({ hasError: "Error parsing XML" });
    }
    if (parsedResult === null) {
        return res.status(500).send({ hasError: "Error parsing XML" });
    }
    const answerIds = parsedAnswers.answers.question.flatMap(q => q.answer.map(a => parseInt(a)));

    const test1 = {
        createdAt: test.createdAt,
        testName: parsedResult.test.$.name,
        description: parsedResult.test.$.description,
        questions: parsedResult.test.questions.map((q) => ({
            question: q.$.question,
            id:  parseInt(q.$.id),
            answers: q.answers.map((a) => ({
                id: parseInt(a.$.id),
                answer: a.$.answer,
                isCorrect: a.$.isCorrect === 'true',
                selected: answerIds.includes(parseInt(a.$.id))
            }))
        }))
    };
    res.json(test1);
});

module.exports = router;

