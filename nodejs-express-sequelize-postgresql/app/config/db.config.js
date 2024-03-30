module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "zaq1@WSX",
    DB: "quiznet",
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };