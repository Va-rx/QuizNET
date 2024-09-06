const express = require('express');
const {getTestHistoryById} = require("../database/database-queries/test-history-queries");
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
        name: parsedResult.test.$.name,
        description: parsedResult.test.$.description,
        questions: parsedResult.test.questions.map((q) => ({
            question: q.$.question,
            id:  parseInt(q.$.id),
            answers: q.answers.map((a) => ({
                id: parseInt(a.$.id),
                answer: a.$.answer,
                isCorrect: a.$.isCorrect === 'true'
            }))
        }))
    };
    res.json(test1);
});

// Nie chcemy dodawać POST - test powinien się generować tylko podczas rozpoczęcia rozgrywki co jest robione po stronie serwera

module.exports = router;

