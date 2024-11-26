const express = require('express');
const {createUserPersonalityResults, getPlayerPersonalityResultsConnectedToTest} = require("../database/database-queries/user-personality-results");
const {getAllPlayersAveragePersonalityConnectedToTest} = require("../database/database-queries/user-personality-results");
const router = express.Router();

router.post("/", async (req, res) => {
  const userPersonalityResults = req.body;
    createUserPersonalityResults(userPersonalityResults).then(result => {
        res.send(result);
    }).catch(
        err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the user personality results."
        });
        }
    );
})

router.get("/:testHistoryId", async (req, res) => {
    const testId = req.params.testHistoryId;
    const results = await getAllPlayersAveragePersonalityConnectedToTest(testId);
    res.send(results[0]);
})

router.get("/:testHistoryId/:userId", async (req, res) => {
  const testId = req.params.testHistoryId;
  const userId = req.params.userId;
  const results = await getPlayerPersonalityResultsConnectedToTest(userId, testId);
  res.send(results[0]);
})


module.exports = router;