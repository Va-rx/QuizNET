const express = require('express');
const router = express.Router();

const { getMap, deleteMap, createMap } = require('../database/database-queries/map-queries');

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await getMap(id);
        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await deleteMap(id);

        res.status(204);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.post("/games/:idg", async (req, res) => {
    const gameId = req.params.idg;
    const map = req.params.body;
    try {
        const result = createMap(gameId, map);

        res.status(201).send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;
