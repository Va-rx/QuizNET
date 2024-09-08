const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const cron = require("node-cron");

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

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const questionRouter = require("./routes/question-routes");
const answerRouter = require("./routes/answer-routes");
const setRouter = require("./routes/set-routes");
const testRouter = require("./routes/test-routes");
const gameRouter = require("./routes/game-routes");
const userRouter = require("./routes/user-routes")

app.use("/api/questions", questionRouter);
app.use("/api/answers", answerRouter);
app.use("/api/sets", setRouter);
app.use("/api/tests", testRouter);
app.use("/api/games", gameRouter);
app.use("/api/users", userRouter);

const PORT = process.env.PORT || 8080;

const sessions = new Map();
const userToSocket = new Map();
const socketToUser = new Map();
io.on("connection", (socket) => {
  console.log("A user connected" + socket.id);
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
  
    cron.schedule(`${minute} ${hour} ${day} ${month} *`, () => {
      if (session) {
        session.users.forEach((participantSocket) => {
          if (participantSocket !== socket) {
            participantSocket.emit("gameStarted", game_route, test_id);
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
