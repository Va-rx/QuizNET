const db = require('../database-connection');

const createLevel = (gameId, level) => {
    try {
        return db.query(`INSERT INTO levels (game_id, name, difficulty, time, map) VALUES ($1, $2, $3, $4) RETURNING level_id as id, game_id as "gameId", name, difficulty, map`, [gameId, level.name, level.difficulty, level.time, level.map]);
    } catch (err) {
        console.error('db query create level error: ', err);
    }
}

const getLevel = (id) => {
    try {
        return db.query(`SELECT level_id as id, game_id as "gameId", name, difficulty, time, map FROM levels WHERE level_id = $1`, [id]);
    } catch (err) {
        console.error('db query get level error: ', err);
    }
}

const deleteLevel = (id) => {
    try {
        return db.query(`DELETE FROM levels WHERE level_id = $1`, [id]);
    } catch (err) {
        console.error('db query delete level error: ', err);
    }
}

module.exports = {
    createLevel,
    deleteLevel,
    getLevel
}