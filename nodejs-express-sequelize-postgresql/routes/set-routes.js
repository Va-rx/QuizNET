const express = require('express');
const router = express.Router();

const { getSets, getSetById, createSet, updateSet, deleteSet } = require("../database/database-queries/sets-queries");

router.post("/", (req, res) => {
    const newSet = req.body;
    console.log(newSet);
    createSet(newSet)
        .then(set => {
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
    getSetById(id)
        .then(set => {
            res.send(set);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving set."
            });
        });
});
module.exports = router;