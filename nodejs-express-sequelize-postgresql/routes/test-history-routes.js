const express = require('express');
const {getTestHistoryById, getAllTestHistory, getAllTestHistoryConnectedToUser} = require("../database/database-queries/test-history-queries");
const {parseXML} = require("../XMLhandler");
const router = express.Router();

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const test = await getTestHistoryById(id);
    const parsedResult = await parseXML(test.content);

    if (parsedResult === null) {
        return res.status(500).send({ hasError: "Error parsing XML" });
    }
    const test1 = {
        testName: parsedResult.test.$.name,
        createdDate: test.createdDate,
        maxPoints: parseInt(parsedResult.test.$.max_points),
        description: parsedResult.test.$.description,
        questions: parsedResult.test.questions.map((q) => ({
            question: q.$.question,
            id:  parseInt(q.$.id),
            image_link: q.$.image_link,
            answers: q.answers.map((a) => ({
                id: parseInt(a.$.id),
                answer: a.$.answer,
                isCorrect: a.$.isCorrect === 'true',
                points: parseInt(a.$.points)
            }))
        }))
    };
    res.json(test1);
});

router.get("/",  (req, res) => {
    getAllTestHistory().then((tests) => {
        res.json(tests);
    }).catch((err) => {
        console.log(err.message);
        res.status(500).send({ hasError: "Error getting all tests" });
    });
});


router.get("/user/:id",  (req, res) => {
    const id = req.params.id;
    getAllTestHistoryConnectedToUser(id).then((tests) => {
        res.json(tests);
    }).catch((err) => {
        console.log(err.message);
        res.status(500).send({ hasError: "Error getting all tests connected to user" });
    });
});

module.exports = router;

