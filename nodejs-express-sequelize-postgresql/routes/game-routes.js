const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.json([
        {"game_name": "tanks", "description": "tankgame","route": "/tank-game"},
        {"game_name": "jumpking", "description": "jumpking game descrpitoino","route": "/game"},
    ]);
});

module.exports = router;
