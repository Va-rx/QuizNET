const express = require('express');
const upload = require('./upload');
const router = express.Router();
const { getQuestions, getQuestionById, updateQuestion, deleteQuestion, deleteQuestions, createQuestion,
    getQuestionByIdWithAnswers, getQuestionsWithAnswers
} = require("../database/database-queries/question-queries");


router.get("/",(req, res) => {
    getQuestions()
    .then(questions => {
        questions.map(question => {
            question.image_link = question.image_link ? question.image_link.toString('base64'): null;
        });
      res.send(questions);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving all questions."
      });
    });
  });
  
router.get("/answers/:id", (req, res) => {
    const id = req.params.id;
    getQuestionByIdWithAnswers(id)
    .then(question => {
        if (question.image_link){//if no image link is present, it will be null
          question.image_link = question.image_link.toString('base64');          
        }
        res.send(question);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving question with specified id."
      });
    });
})

router.get("/answers",(req, res) => {
    getQuestionsWithAnswers()
        .then(questions => {
            questions.map(question => {
                question.image_link = question.image_link ? question.image_link.toString('base64'): null;
            });
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
            if (question.image_link){//if no image link is present, it will be null
                question.image_link = question.image_link.toString('base64');
            }
            res.send(question);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving question with specified id."
            });
        });
})
  
router.post("/", upload.single('image_link'), (req, res) => {
    const newQuestion = req.body;
    newQuestion.image_link = req.file ? req.file.buffer : null;
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
  
router.put("/:id", upload.single('image_link'), (req, res) => {
    const id = req.params.id;
    const updatedQuestion = req.body;
    updatedQuestion.image_link = req.file ? req.file.buffer : null;
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