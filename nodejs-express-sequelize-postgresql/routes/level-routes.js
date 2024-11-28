const express = require('express');
const router = express.Router();

const { getLevel, deleteLevel, createLevel } = require('../database/database-queries/level-queries');

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await getLevel(id);
        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await deleteLevel(id);

        res.status(204);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.post("/games/:idg", async (req, res) => {
    const gameId = req.params.idg;
    const level = req.params.body;
    try {
        const result = createLevel(gameId, level);

        res.status(201).send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;
