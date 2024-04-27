const { createQuestion, getQuestions } = require('./database-queries/question-queries');

getQuestions()
    .then(res => console.log(res))
    .catch(err => console.error(err));

// const newQuestion = {
//     question: 'Jakie jest Twoje ulubione zwierzę 3?',
//     image_link: 'link_do_obrazka'
// };

// createQuestion(newQuestion)
//     .then(res => console.log(res))
//     .catch(err => console.error(err));