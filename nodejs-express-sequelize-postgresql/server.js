const express = require("express");
const cors = require("cors");
const http = require("http"); // Require the HTTP module
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server, {
  cors: {
    //origin: "http://localhost:8081", // Allow requests from this origin
    methods: ["GET", "POST"], // Allow GET and POST requests
    //allowedHeaders: ["my-custom-header"], // Allow custom headers
    //credentials: true // Allow sending cookies from the client
  }
});
var corsOptions = {
  // Origin: "http://localhost:8081" bez tego działa
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
db.sequelize.sync({ force: true })
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to TEST application." });
});

require("./app/routes/question.routes")(app);

const PORT = process.env.PORT || 8080;

//map socket.io to the client and generated code
const sessions = new Map();

//map socket.io to the clients list
// Handle Socket.io connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle event coordinator's request for join code
  socket.on("requestJoinCode", () => {
    console.log("Event coordinator requested a join code");
    // Generate a random join code
    const joinCode = generateJoinCode();
    // Create a new session with the join code and an empty user list
    sessions.set(joinCode, { users: [socket] });
    // Send the join code back to the event coordinator
    socket.emit("joinCode", joinCode);
  });

  // Handle event participant's request to join the event
  socket.on("joinByCode", (joinCode) => {
    console.log(`Event participant requested to join event with join code: ${joinCode}`);
    // Retrieve the session associated with the join code
    const session = sessions.get(joinCode);
    if (session) {
      // Add participant's socket to the session
      session.users.push(socket);
      console.log("Event participant joined the event");
      // Send a confirmation to the participant
      socket.emit("joinedConfirmation");
      // Broadcast the updated user list to all participants
      broadcastUserList(session);
    } else {
      // Send an error message to the participant
      console.log("Invalid join code");
      socket.emit("invalidJoinCode");
    }
  });

  // Handle event coordinator's message broadcast to all participants
  socket.on("startGame", (data) => {
    // Retrieve the session associated with the socket
    const session = getSessionBySocket(socket);
    if (session) {
      // Broadcast the message to all sockets in the session except the sender
      session.users.forEach((participantSocket) => {
        if (participantSocket !== socket) {
          participantSocket.emit("gameStarted", data);
        }
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
    // Remove the socket from all sessions it belongs to
    sessions.forEach((session, _) => {
      const index = session.users.indexOf(socket);
      if (index !== -1) {
        session.users.splice(index, 1);
        // Broadcast the updated user list to all participants
        broadcastUserList(session);
      }
    });
  });

  // Function to broadcast the updated user list to all participants
  function broadcastUserList(session) {
    session.users.forEach((userSocket) => {
      userSocket.emit("userList", session.users.map((socket) => socket.id));
    });
  }

  // Function to retrieve session by socket
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

// Function to generate a random join code
function generateJoinCode() {
  // Implement your join code generation logic here
  // For example, you can generate a random alphanumeric code
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const codeLength = 6;
  let joinCode = "";
  for (let i = 0; i < codeLength; i++) {
    joinCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return joinCode;
}
