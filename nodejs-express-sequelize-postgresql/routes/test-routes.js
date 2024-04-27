const express = require('express');
const router = express.Router();
const { getQuestions, getQuestionById, updateQuestion, deleteQuestion, deleteQuestions, createQuestion} = require("../database/database-queries/questions-queries");


router.get("/", (req, res) => {
    getQuestions()
    .then(questions => {
      res.send(questions);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving all questions."
      });
    });
  });
  
router.get("/:id", (req, res) => {
    const id = req.params.id;
    getQuestionById(id)
    .then(question => {
      res.send(question);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving question with specified id."
      });
    });
})
  
router.post("/", (req, res) => {
    const newQuestion = req.body;
    createQuestion(newQuestion)
    .then(question => {
      res.send(question);
    })
    .catch (err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the question."
      });
    });
});
  
router.put("/:id", (req, res) => {
    const id = req.params.id;
    const updatedQuestion = req.body;
    updateQuestion(id, updatedQuestion)
    .then(question => {
      res.send(question);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while updating the question."
      });
    });
});
  
router.delete("/:id", (req, res) => {
    const id = req.params.id;
    deleteQuestion(id)
    .then(question => {
      res.send(question);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while deleting the question."
      });
    });
});

router.delete("/", (req, res) => {
    deleteQuestions()
    .then(questions => {
      res.send(questions);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while deleting all questions."
      });
    });
});

module.exports = router;