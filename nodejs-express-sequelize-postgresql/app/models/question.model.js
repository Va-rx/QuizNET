module.exports = (sequelize, Sequelize) => {
    const Question = sequelize.define("question", {
      question: {
        type: Sequelize.STRING
      }
    });
    return Question;
  };