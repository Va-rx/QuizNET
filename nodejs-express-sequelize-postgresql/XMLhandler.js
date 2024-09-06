const {getTestByIdWithAnswers} = require("./database/database-queries/test-queries");
const xmlbuilder = require("xmlbuilder");
const xml2js = require("xml2js");

async function generateQuizXML(test) {
    const testWithAnswers = await getTestByIdWithAnswers(test.id);
    const quiz = xmlbuilder.create('test').att('name', test.name).att('description', test.description);
    testWithAnswers.forEach(q => {
        const question = quiz.ele('questions', { question: q.question, id: q.id});
        q.answers.forEach(answer => {
            question.ele('answers', { isCorrect: answer.isCorrect.toString(), answer: answer.answer, id: answer.id });
        });
    });
    return quiz.end({ pretty: true });
}

async function parseXML(xml) {
    try {
        return await xml2js.parseStringPromise(xml);
    } catch (err) {
        console.log(err)
        return null;
    }
}

async function generateAnswerXML(answers) {
    const quiz = xmlbuilder.create('answers');
    answers.forEach((value, key) => {
        const question = quiz.ele('question', { id: key });
        value.forEach(answer => {
            question.ele('answer', {}, answer);
        });
    });
    return quiz.end({ pretty: true });
}

module.exports = {
    generateAnswerXML,
    parseXML,
    generateQuizXML
};


