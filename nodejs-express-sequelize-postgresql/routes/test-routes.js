const express = require('express');
const router = express.Router();

const { getTests, getTestById, createTest, deleteTest} = require("../database/database-queries/test-queries");

router.post("/", (req, res) => {
    const newTest = req.body;
    console.log(newTest);
    createTest(newTest)
        .then(test_set => {
            res.send(test_set);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the test_set."
            });
        });
});

router.get("/", (req, res) => {
    getTests()
        .then(test_sets => {
            res.send(test_sets);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving test_sets."
            });
        });
});

router.get("/:id", (req, res) => {
    const id = req.params.id;
    getTestById(id)
        .then(test_set => {
            res.send(test_set);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || `Some error occurred while retrieving test_set with id=${id}.`
            });
        });
}
);

router.delete("/:id", (req, res) => {
    const id = req.params.id;
    deleteTest(id)
      .then(result => {
        if (result) {
          res.send({ message: `Test set with id=${id} was deleted successfully.` });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || `Some error occurred while deleting test set with id=${id}.`
        });
      });
  });

module.exports = router;