const db = require('../database-connection');

const getGames = () => {
    try {
        return db.query(`SELECT game_id as id, name, description FROM games`);
    } catch (err) {
        console.error('db query get games error: ', err);
    }
}

const getGame = (id) => {
    try {
        return db.query(`SELECT game_id as id, name, description FROM games WHERE game_id = $1`, [id]);
    } catch (err) {
        console.error('db query get game error: ', err);
    }
}

const getMapsLabelsToGame = (id) => {
    try {
        return db.query(`SELECT map_id as id, name, difficulty, time FROM maps WHERE game_id = $1`, [id]);
    } catch (err) {
        console.error('db query get maps label to game error: ', err);
    }
}

module.exports = {
    getGames,
    getGame,
    getMapsLabelsToGame
}