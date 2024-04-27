const {Client} = require('pg');

const client = new Client ({
    host: "localhost",
    user: "root",
    port: 5432,
    password: "zaq1@WSX",
    database: "postgres"
})

client.connect();

module.exports = client;