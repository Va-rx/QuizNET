const {getTestWithAnswers} = require("./database/database-queries/test-queries");
const {getTestMaxPoints} = require("./database/database-queries/test-queries");
const xmlbuilder = require("xmlbuilder");
const xml2js = require("xml2js");

async function generateQuizXML(test) {
    const testWithAnswers = await getTestWithAnswers(test.id);
    const testMaxPoints = await getTestMaxPoints(test.id);
    const quiz = xmlbuilder.create('test').att('name', test.name).att('description', test.description).att('max_points', testMaxPoints);
    testWithAnswers.forEach(q => {
        const question = quiz.ele('questions', { question: q.question, id: q.id, max_points: q.max_points, image_link: byteaToBase64(q.image_link)});
        q.answers.forEach(answer => {
            question.ele('answers', { isCorrect: answer.isCorrect.toString(), answer: answer.answer, id: answer.id, points: answer.points });
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

function byteaToBase64(byteaData) {
    if (byteaData === null) {
        return '';
    }
    return byteaData.toString('base64');
}

module.exports = {
    generateAnswerXML,
    parseXML,
    generateQuizXML
};


