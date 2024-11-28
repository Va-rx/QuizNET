const db = require('../database-connection');

const createMap = (gameId, map) => {
    try {
        return db.query(`INSERT INTO maps (game_id, name, difficulty, time, map) VALUES ($1, $2, $3, $4) RETURNING map_id as id, game_id as "gameId", name, difficulty, map`, [gameId, map.name, map.difficulty, map.time, map.json]);
    } catch (err) {
        console.error('db query create map error: ', err);
    }
}

const getMap = (id) => {
    try {
        return db.query(`SELECT map_id as id, game_id as "gameId", name, difficulty, time, map FROM maps WHERE map_id = $1`, [id]);
    } catch (err) {
        console.error('db query get map error: ', err);
    }
}

const deleteMap = (id) => {
    try {
        return db.query(`DELETE FROM maps WHERE map_id = $1`, [id]);
    } catch (err) {
        console.error('db query delete map error: ', err);
    }
}

module.exports = {
    createMap,
    deleteMap,
    getMap
}