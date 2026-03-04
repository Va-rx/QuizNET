const express = require('express');
const router = express.Router();
const upload = require('../upload');

const { getLevel, deleteLevel, createLevel, getAllLevels } = require('../database/database-queries/level-queries');

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

router.get("/", async (req, res) => {
    try {
        const levels = await getAllLevels();
        const groupedLevels = levels.reduce((acc, level) => {
            const gameId = level.gameId;
            if (!acc[gameId]) {
                acc[gameId] = [];
            }
            acc[gameId].push(level);
            return acc;
        }, {});

        res.status(200).send(groupedLevels);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await deleteLevel(id);
        res.status(200).send(!!result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.post("/games/:idg", upload.single('map'), async (req, res) => {
    const gameId = parseInt(req.params.idg);
    const { name, difficulty, time } = req.body;
    const map = req.file;
    const level = {
        name: name,
        difficulty: difficulty,
        time: parseInt(time),
        map: map
    }
    try {
        const result = await createLevel(gameId, level);
        res.status(201).send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;
