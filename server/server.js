require("dotenv").config();

const connectDB = require("./src/config/db");
const app = require("./src/app");

connectDB()
  .then(() => {
    console.log("Database connected successfully"); // Add logging
  })
  .catch((err) => {
    console.error("Database connection failed:", err); // Add logging
  });

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Forum and feedback routes loaded"); // Add logging
});
