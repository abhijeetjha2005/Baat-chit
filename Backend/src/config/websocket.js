const WebSocket = require("ws");
const mongoose = require("mongoose");
const User = require("../models/user.model"); // Ensure path matches your structure

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  console.log("WebSocket Server Started");

  wss.on("connection", (ws) => {
    console.log("New user connected via WebSocket");

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);

        // Fetch contacts list
        if (data.type === "fetch_contacts_list") {
          const currentUserId = data.userId;

          // 2. Safely check if currentUserId is a valid MongoDB ObjectId
          const isValidId = currentUserId && mongoose.Types.ObjectId.isValid(currentUserId);  

         
          // Only exclude the user if a valid ID was passed
          const query = isValidId ? { _id: { $ne: currentUserId } } : {};
          
          const users = await User.find(query, "-password");

          ws.send(
            JSON.stringify({
              type: "contacts_list_add",
              users,
            })
          );
        }
      } catch (err) {
        console.error("WebSocket message processing error:", err.message);

        // Send fallback empty array so frontend stops loading
        ws.send(
          JSON.stringify({
            type: "contacts_list_add",
            users: [],
          })
        );
      }
    });

    ws.on("close", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = setupWebSocket;