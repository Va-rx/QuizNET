const express = require('express');
const router = express.Router();

const { getGames, getGame, getMapsLabelsToGame } = require('../database/database-queries/game-queries');

router.get("/", async (req, res) => {
    try {
        const result = (await getGames()).rows;
        const resultWithRoutes = result.map(game => ({
            ...game,
            route: mapGameRoute(game.id)
        }));

        res.status(200).send(resultWithRoutes);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const game = (await getGame(id)).rows[0];
        const maps = (await getMapsLabelsToGame(id)).rows;

        const resultWithRoutes = {
            ...game,
            route: mapGameRoute(game.id),
            maps: maps
        };
        res.status(200).send(resultWithRoutes);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

function mapGameRoute(id) {
    const map = {
      1: '/tank-game',
      2: '/deathmatch',
      3: '/platformer',
    };
    return map[id];
}

module.exports = router;
