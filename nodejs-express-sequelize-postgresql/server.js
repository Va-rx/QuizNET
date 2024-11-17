const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const cron = require("node-cron");
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    methods: ["GET", "POST", "DELETE", "PUT"], // Allow GET and POST requests
  },
});
var corsOptions = {
  // Origin: "http://72.145.1.108:8081" bez tego działa
};

// #region MultiplayerVariables
const players = {};
var stars = [];
var maxNumberOfStars;
var starsCounter = 0;
var maxHealth = 30;
var maxQuestions = 2;
let countdown;
let countdownInterval;
const playerSpeed = 2.2;
let MAX_HEIGHT = 1280;
let MAX_WIDTH = 720;
var readyClients = 0;
let spawnInterval;
var boundariesSet = false;

const MultiplayerRoles = Object.freeze({
  OFFENSIVE: 0,
  DEFENSIVE: 1,
  NONE: 2
});

const ShareHealthAnswer = Object.freeze({
  NO: 0,
  YES: 1,
  SPLIT: 2
});

offensivePowerUps = ['damage', 'attackRange'];
defensivePowerUps = ['health', 'speed'];

// #endregion

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'application/xml' }));

const testRouter = require("./routes/test-routes");
const gameRouter = require("./routes/game-routes");
const userRouter = require("./routes/user-routes");
const questionRouter = require("./routes/question-routes");
const answerRouter = require("./routes/answer-routes");
const testHistoryRouter = require("./routes/test-history-routes");
const userResultsRouter = require("./routes/user-results-routes");
const {createTestHistory} = require("./database/database-queries/test-history-queries");
const {generateQuizXML} = require("./XMLhandler");
const {getNumberOfQuestions} = require("./database/database-queries/test-queries");

app.use("/api/tests", testRouter);
app.use("/api/games", gameRouter);
app.use("/api/users", userRouter);
app.use("/api/questions", questionRouter);
app.use("/api/answers", answerRouter);
app.use("/api/test-history", testHistoryRouter);
app.use("/api/user-results", userResultsRouter);

const PORT = process.env.PORT || 8080;

const codeToSessionInfo = new Map();
const sessions = new Map();
const userToSocket = new Map();
const socketToUser = new Map();
io.on("connection", (socket) => {
  console.log("A user connected" + socket.id);

  // #region MultiplayerSockets
  socket.on('requestCurrentPlayers', () => {
    socket.emit('currentPlayers', players);
  });

  socket.on('requestCurrentStars', () => {
    socket.emit('currentStars', stars);
  });

  socket.on('mapBoundaries', (boundaries) => {

    MAX_WIDTH = boundaries.width;
    MAX_HEIGHT = boundaries.height
    if (!boundariesSet) {
      boundariesSet = true;
      Object.values(players).forEach(player => {
        player.x = Math.floor(Math.random() * MAX_WIDTH);
        player.y = Math.floor(Math.random() * MAX_HEIGHT);
        io.emit('randomPlacePlayers', { id: player.id, x: player.x, y: player.y});
      });
    }
  })

  socket.on('playerMovement', (movementData, direction, boundaries) => {
    const player = players[socket.id];
    if (!player) return;

    player.x = movementData.x;
    player.y = movementData.y;
    io.emit('playerMoved', {id: socket.id, x: player.x, y: player.y, direction: direction});
  });


  socket.on('requestAttackAnimation', (playerId) => {
    io.emit('attackAnimation', playerId);
  });

  socket.on('playerAttack', ({attackerId, targetId}) => {
    if (players[attackerId] && players[targetId]) {
      const player = players[targetId];
      player.hp -= players[attackerId].attackDamage;
      io.emit('playerAttacked', {id: targetId, hp: player.hp});
      if (player.hp <= 0) {
        player.x = Math.floor(Math.random() * MAX_WIDTH);
        player.y = Math.floor(Math.random() * MAX_HEIGHT);
        player.hp = player.maxHealth;
        const attacker = players[attackerId];
        attacker.playersKilled++;
        io.emit('playerKilled', {
          id: targetId,
          hp: player.hp,
          x: player.x,
          y: player.y,
          killerId: attackerId,
          killerKills: attacker.playersKilled
        });
      }
    }
  });

  socket.on('collectStar', (star, playerId) => {
    const player = players[playerId];
    if (!player) return;

    stars = stars.filter(s => s.x !== star.x && s.y !== star.y);
    player.visible = false;

    io.emit('playerStarCollected', star, playerId);
  });
  socket.on('playerRandomBuff', (id, attackDamage) => {
    const player = players[id];
    if (!player) return;

    player.attackDamage = attackDamage;
    io.emit('playerBuffed', id, attackDamage);
  })

  socket.on('playerQuestionAnswered', (playerId) => {
    const player = players[playerId];
    if (!player) return;

    player.questionsAnswered++;
    if (player.questionsAnswered >= maxQuestions) {
      io.emit('gameFinished', playerId);
    }
    io.emit('playerQuestionAnswered', playerId, player.questionsAnswered);
  })

  socket.on("clientReady", () => {
    readyClients++;
    if (readyClients === Object.keys(players).length) {
      setTimeout(() => {
        spawnStar();
      }, 50000)
    }
  });

  socket.on('MULTIPLAYER_shareHealth', (playerId, shareType) => {
    const filteredPlayers = Object.values(players).filter(player => (player.id !== playerId && player.questionsAnswered < maxQuestions));
    if (filteredPlayers && filteredPlayers.length > 0) {
      switch (shareType) {
        case ShareHealthAnswer.YES:
          const randomPlayer = filteredPlayers[Math.floor(Math.random() * filteredPlayers.length)];
          players[randomPlayer.id].hp = Math.min(players[randomPlayer.id].hp + players[playerId].hp, players[randomPlayer.id].maxHealth); // Adjust the health value as needed
          io.emit('healthShared', [{ id: randomPlayer.id, hp: players[randomPlayer.id].hp }]);
          break
        case ShareHealthAnswer.SPLIT:
          const healthToShare = Math.floor(players[playerId].hp / filteredPlayers.length);
          filteredPlayers.forEach(player => {
            players[player.id].hp = Math.min(players[player.id].hp + healthToShare, players[player.id].maxHealth);
          });
          io.emit('healthShared', filteredPlayers.map(player => ({ id: player.id, hp: players[player.id].hp })));
          break
      }
    }


  });

  socket.on('start_multiplayer', () => {
    if (!countdown) {
      startCountdown();
    }
  });

  socket.on("roleChosen", (role, id) => {
    const player = players[id];
    if (!player) return;
    if (player.role !== MultiplayerRoles.NONE) return;

    player.role = role;
    const powerUp = generateRandomPowerUp(player);
    io.emit("playerRoleChosen", role, id, powerUp);
  })

  // #endregion
  //Handle Health sharing
  socket.on("shareHealth",(userName)=>{
    const session = getSessionBySocket(socket);
    const filteredUsers = session.users
    .map((socket) => socketToUser.get(socket))
    .filter((user) => user !== userName && user !== 'Creator');

    console.log(filteredUsers);

    if (filteredUsers.length > 0) {
      const randomUser = filteredUsers[Math.floor(Math.random() * filteredUsers.length)];
      console.log(randomUser);
      console.log(userToSocket.get(randomUser))
      console.log(userToSocket)
      userToSocket.get(randomUser).user[0].emit("receiveHealth",userName);
    } else {
      console.log("No valid users found.");
    }


  })
  
  // Handle event coordinator request for join code
  socket.on("requestJoinCode", (userName, lobbyName) => {
    console.log(
      "Event coordinator requested a join code" +
        " Coordinator: " +
        userName +
        " with lobbyName: " +
        lobbyName
    );
    const joinCode = generateJoinCode();
    // Create a new session with the join code and an empty user list
    sessions.set(joinCode, { users: [socket], scoreBoard: new Map() });
    //map userName or userToken to socket, assuming userName is unique
    userToSocket.set(userName, { user: [socket] });
    socketToUser.set(socket, userName);
    socket.emit("joinCode", joinCode);
  });

  // Handle event participant request to join the event
  socket.on("joinByCode", (joinCode, userName) => {
    console.log(
      `Event participant: ${userName} requested to join event with join code: ${joinCode}`
    );
    const session = sessions.get(joinCode);
    if (session) {
      userToSocket.set(userName, { user: [socket] }); // TODO: dodac usuwanie z tego mappingu po disconnect
      socketToUser.set(socket, userName); // TODO: dodac usuwanie z tego mappingu po disconnect
      session.users.push(socket);
      console.log("Event participant joined the event");
      socket.emit("joinedConfirmation");
      players[socket.id] = {
        x: 100, y: 450, id: socket.id, hp: maxHealth, visible: true, role: MultiplayerRoles.NONE, isTargetable: true,
        questionsAnswered: 0, attackDamage: 10, attackRange: 60, maxHealth: maxHealth, speed: 2.2, playersKilled: 0, nickname: userName
      };
      const sesInfo= codeToSessionInfo.get(joinCode);
      socket.emit("receive_Data",sesInfo.date,sesInfo.test.name,sesInfo.test.description,sesInfo.game.game_name);
      broadcastUserList(session);
    } else {
      console.log("Invalid join code");
      socket.emit("invalidJoinCode");
    }
  });

  socket.on("startGame", (date, time, game_route, test_id,timer) => {
    console.log(`Game will start at ${time} on ${date}`);

    codeToSessionInfo.set(getJoinCodeBySession(getSessionBySocket(socket)),{ date: `Game will start at ${time} on ${date}`, test: test_id, game:game_route})

    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
  
    cron.schedule(`${minute} ${hour} ${day} ${month} *`, async () => {
      const session = getSessionBySocket(socket);
      const xml = await generateQuizXML(test_id);
      maxQuestions = parseInt((await getNumberOfQuestions(1)).rows[0].count);
      maxNumberOfStars = maxQuestions * Object.keys(players).length + 2;
      const testHistory = await createTestHistory({testName: test_id.name, content: xml, createdAt: new Date()});
      if (session) {
        starsCounter = 0;
        stars = [];
        readyClients = 0;
        session.users.forEach((participantSocket) => {
          if (participantSocket !== socket) {
            participantSocket.emit("gameStarted", game_route, test_id, testHistory.id,timer, players, maxQuestions);
          }
        });
      }
    });
  });

  socket.on("userScoreUpdate", (userName, userScore, joinCode) => {
    console.log(`User: ${userName} current score: ${userScore}`);
    const session = sessions.get(joinCode);
    if (session) {
      session.scoreBoard.set(userName, userScore);
      session.scoreBoard.forEach((key, val) => console.log(key + val));
      broadcastScoreBoard(session);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
    sessions.forEach((session, _) => {
      const index = session.users.indexOf(socket);
      if (index !== -1) {
        session.users.splice(index, 1);
        broadcastUserList(session);
      }
    });
  });

  function broadcastScoreBoard(session) {
    session.users.forEach((userSocket) => {
      console.log(JSON.stringify(Object.fromEntries(session.scoreBoard)));
      userSocket.emit(
        "broadcastScoreBoard",
        JSON.stringify(Object.fromEntries(session.scoreBoard))
      );
    });
  }

  function broadcastUserList(session) {
    session.users.forEach((userSocket) => {
      userSocket.emit(
        "userList",
        session.users.map((socket) => socketToUser.get(socket))
      );
    });
  }

  function getSessionBySocket(socket) {
    for (const session of sessions.values()) {
      if (session.users.includes(socket)) {
        return session;
      }
    }
    return null;
  }

  function getJoinCodeBySession(session) {
    for (const [joinCode, storedSession] of sessions.entries()) {
      if (storedSession === session) {
        return joinCode;
      }
    }
    return null; // Return null if the session is not found
  }
  
});

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// TODO: zastapic to funkjca taka jak ma byc porzadna
function generateJoinCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const codeLength = 6;
  let joinCode = "";
  for (let i = 0; i < codeLength; i++) {
    joinCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return joinCode;
}


// #region MultiplayerFunctions
function spawnStar() {
  spawnInterval = setInterval(() => {
    if (starsCounter >= maxNumberOfStars) {
      clearInterval(spawnInterval)
      return;
    }
    const x = Math.floor(Math.random() * MAX_WIDTH);
    const y = Math.floor(Math.random() * MAX_HEIGHT);
    const star = {x, y};
    stars.push(star);
    io.emit("spawnStar", star);
    starsCounter++;
  }, 5000);
}

function startCountdown() {
  countdown = 50;
  io.emit('countdownUpdate', countdown);

  countdownInterval = setInterval(() => {
    countdown--;
    io.emit('countdownUpdate', countdown);

    if (countdown <= 0) {
      clearInterval(countdownInterval);
      io.emit('countdownEnd');
    }
  }, 1000);
}


function generateRandomPowerUp(player){
  if (player.role === MultiplayerRoles.OFFENSIVE) {
    return addPowerUp(player, offensivePowerUps[Math.floor(Math.random() * offensivePowerUps.length)]);
  }
  return addPowerUp(player, defensivePowerUps[Math.floor(Math.random() * defensivePowerUps.length)]);
}

function addPowerUp(player, powerUp){
  switch (powerUp) {
    case 'attackRange':
      player.attackRange += 30;
      break;
    case 'damage':
      player.attackDamage += 5;
      break;
    case 'health':
      player.maxHealth = 45;
      player.hp += 15;
      break;
    case 'speed':
      player.speed += 0.8;
      break;
  }

  return powerUp;
}
// #endregion
