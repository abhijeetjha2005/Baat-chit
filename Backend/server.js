const http = require("http");
const fs = require("fs");
const path = require("path");
const dns = require("dns");


dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const connectDb = require("./src/config/db");
const app = require("./src/app");
const setupWebSocket = require("./src/config/websocket");

// Connect to MongoDB
connectDb();

// Create HTTP Server
const server = http.createServer(app);
// Create audio upload directory
fs.mkdirSync(path.join(__dirname, "uploads/audio"), {
  recursive: true,
});

// Initialize WebSocket Server
setupWebSocket(server);

// Start Server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log("WebSocket server is running");
});