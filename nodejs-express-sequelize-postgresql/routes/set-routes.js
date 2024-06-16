const express = require('express');
const router = express.Router();

const { getSets, getQuestionsByTestId, addQuestionToTest, deleteSet } = require("../database/database-queries/set-queries");

router.post("/", (req, res) => {
    const newSet = req.body;
    addQuestionToTest(newSet)
        .then(set => {
            res.send(set);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the set."
            });
        });
});

router.post("/all", (req, res) => {
    const newSets = req.body;
    const promises = newSets.map(set => addQuestionToTest(set));
    Promise.all(promises).then(set => {
            res.send(set);
        })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the set."
                });
            });
});

router.get("/", (req, res) => {
    getSets()
        .then(sets => {
            res.send(sets);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving sets."
            });
        });
});

router.get("/:id", (req, res) => {
    const id = req.params.id;
    getQuestionsByTestId(id)
        .then(set => {
            res.send(set);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving set."
            });
        });
});

router.delete("/:test_id/:question_id", (req, res) => {
    const set = req.params;
    deleteSet(set)
        .then(result => {
            if (result) {
                res.send({ message: `Set with id=${id} was deleted successfully.` });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || `Some error occurred while deleting set with id=${id}.`
            });
        });
});

router.post("/deleteAll", (req, res) => {
    const newSets = req.body;
    const promises = newSets.map(set => deleteSet(set));
    Promise.all(promises).then(set => {
            res.send(set);
        })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the set."
                });
            });
});





module.exports = router;