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
  // Origin: "http://localhost:8081" bez tego działa
};

// Multiplayeer Game
const players = {};
var stars = [];
var maxNumberOfStars = 5;
var starsCounter = 0;
var maxHealth = 100;
let playersReady = 0;
const maxQuestions = 2;
let countdown;
let countdownInterval;
//
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

app.use("/api/tests", testRouter);
app.use("/api/games", gameRouter);
app.use("/api/users", userRouter);
app.use("/api/questions", questionRouter);
app.use("/api/answers", answerRouter);
app.use("/api/test-history", testHistoryRouter);
app.use("/api/user-results", userResultsRouter);

const PORT = process.env.PORT || 8080;

const sessions = new Map();
const userToSocket = new Map();
const socketToUser = new Map();
io.on("connection", (socket) => {
  players[socket.id] = {x: 100, y: 450, id: socket.id, hp: maxHealth, visible: true, role: null, isTargetable: true, questionsAnswered: 0}
  // players.push({posx: 100, posy: 450, id: socket.id, hp: maxHealth, visible: true, role: null, isTargetable: true});
  socket.on('requestCurrentPlayers', () => {
    socket.emit('currentPlayers', players);
  });

  socket.on('requestCurrentStars', () => {
    socket.emit('currentStars', stars);
  });
  socket.broadcast.emit('newPlayer', { id: socket.id, x: 100, y: 100, hp: maxHealth, visible: true, role: null, isTargetable: true, questionsAnswered: 0 });

  socket.on('playerMovement', (movementData, direction) => {
    const player = players[socket.id];
    if (!player) return;

    player.x += movementData.x;
    player.y += movementData.y;
    io.emit('playerMoved', { id: socket.id, x: player.x, y: player.y, direction: direction});
  });


  socket.on('requestAttackAnimation', (playerId) => {
    io.emit('attackAnimation', playerId);
  });

  socket.on('playerAttack', ({ attackerId, targetId }) => {
    if (players[attackerId] && players[targetId]) {
      const player = players[targetId];
      player.hp -= 10;
      io.emit('playerAttacked', {id: targetId, hp: player.hp});
      if (player.hp <= 0){
        player.x = Math.floor(Math.random() * 800);
        player.y = Math.floor(Math.random() * 600);
        player.hp = 100;
        io.emit('playerKilled', {id: targetId, hp: 100, x: player.x, y: player.y});
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

  socket.on('playerQuestionAnswered', (playerId) => {
    const player = players[playerId];
    if (!player) return;

    player.questionsAnswered++;
    if (player.questionsAnswered >= maxQuestions) {
      io.emit('gameFinished', playerId);
    }
    io.emit('playerQuestionAnswered', playerId, player.questionsAnswered);
  })
  // update PLayers
  //Multiplayer Game
  //
  // socket.on('start_multiplayer', () => {
  //   if (!countdown) { // minimalna liczba graczy do rozpoczęcia
  //     startCountdown();
  //   }
  // });
  // socket.on("roleChosen", (role, id) => {
  //   io.to(id).emit("roleChosen", role);
  //   for (player of players){
  //     if (player.id == socket.id){
  //       player.role = role;
  //       io.to(player.id).emit("roleChosen", role);
  //     }
  //   }
  //   socket.emit("updatePlayers", players);
  // })


  //Multiplayer Game END

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
      broadcastUserList(session);
    } else {
      console.log("Invalid join code");
      socket.emit("invalidJoinCode");
    }
  });

  socket.on("startGame", (date, time, game_route, test_id) => {
    const session = getSessionBySocket(socket);
    console.log(`Game will start at ${time} on ${date}`);
  
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
  
    cron.schedule(`${minute} ${hour} ${day} ${month} *`, async () => {
      const xml = await generateQuizXML(test_id);
      const testHistory = await createTestHistory({testName: test_id.name, content: xml, createdAt: new Date()});
      if (session) {
        setInterval(spawnStar, 5000);
        session.users.forEach((participantSocket) => {
          if (participantSocket !== socket) {
            participantSocket.emit("gameStarted", game_route, test_id, testHistory.id);
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
      console.log("User score updated", session.scoreBoard);
      broadcastScoreBoard(session);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
    // let count = 0;
    // for (player of players){
    //     if (player.id == socket.id){
    //         players.splice(count,1);
    //     }
    //     count++;
    // }
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


// Multiplayer Game

function spawnStar() {
  if (starsCounter >= maxNumberOfStars) {
    return;
  }

  const x = Math.floor(Math.random() * 800); // Assuming map width is 800
  const y = Math.floor(Math.random() * 600); // Assuming map height is 600
  const star = { x, y };
  stars.push(star);
  io.emit("spawnStar", star);
  starsCounter++;
}

setInterval(spawnStar, 5000);

function startCountdown() {
  countdown = 5;
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
// Multiplayer Game END