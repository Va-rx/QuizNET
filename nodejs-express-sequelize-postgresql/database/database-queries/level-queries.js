const db = require('../database-connection');

const createLevel = (gameId, level) => {
    try {
        return db.query(`INSERT INTO levels (game_id, name, difficulty, time, map) VALUES ($1, $2, $3, $4, $5) RETURNING id, game_id as "gameId", name, difficulty, map`, [gameId, level.name, level.difficulty, level.time, level.map]);
    } catch (err) {
        console.error('db query create level error: ', err);
    }
}

const getLevel = (id) => {
    try {
        return db.query(`SELECT id, game_id as "gameId", name, difficulty, time, map FROM levels WHERE id = $1`, [id]);
    } catch (err) {
        console.error('db query get level error: ', err);
    }
}

const getAllLevels = async () => {
    try {
        const result = await db.query(`SELECT id, game_id as "gameId", name, difficulty, time FROM levels`);
        return result.rows;
    } catch (err) {
        console.error('db query get all levels error: ', err);
    }
}

const deleteLevel = async (id) => {
    try {
        return await db.query(`DELETE FROM levels WHERE id = $1`, [id]);
    } catch (err) {
        console.error('db query delete level error: ', err);
    }
}

module.exports = {
    createLevel,
    deleteLevel,
    getLevel,
    getAllLevels
}