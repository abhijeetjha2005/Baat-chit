const WebSocket = require("ws");
const mongoose = require("mongoose");
const User = require("../models/user.model"); // Ensure path matches your structure

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  // 1. Map to store active connections: Map<userId, ws>
  const activeUsers = new Map();

  console.log("WebSocket Server Started");

  wss.on("connection", (ws) => {
    console.log("New user connected via WebSocket");

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);

        // --- NEW: Register user connection on connect/auth ---
        if (data.type === "register") {
          if (data.userId) {
            activeUsers.set(data.userId.toString(), ws);
            ws.userId = data.userId.toString(); // store on socket for cleanup
            console.log(`User registered on WS: ${data.userId}`);
          }
          return;
        }

        // --- FETCH CONTACTS LIST ---
        if (data.type === "fetch_contacts_list") {
          const currentUserId = data.userId;

          // Register user ID if sent along with this request
          if (currentUserId) {
            activeUsers.set(currentUserId.toString(), ws);
            ws.userId = currentUserId.toString();
          }

          const isValidId = currentUserId && mongoose.Types.ObjectId.isValid(currentUserId);
          const query = isValidId ? { _id: { $ne: currentUserId } } : {};
          
          const users = await User.find(query, "-password");

          ws.send(
            JSON.stringify({
              type: "contacts_list_add",
              users,
            })
          );
          return;
        }
// search logic
if(data.type==="search_users"){
  console.log("Search query:", data.query);
 const users= await User.find({

  $or:[
    {
      name: {
          $regex: data.query,
          $options: "i"
        }
      },
      {
        email: {
          $regex: data.query,
          $options: "i"
        }
      }

  ]
 },"-password") 
  ws.send(JSON.stringify({
    type: "search_results",
    users
  }));
  return
}

        // --- NEW: HANDLE CHAT MESSAGES ---
       if (data.type === "send_message") {

  console.log("SEND MESSAGE:", data);

  const { senderId, receiverId, text } = data;

  console.log(
    "Receiver socket:",
    activeUsers.get(receiverId?.toString())
  );

  const messageData = {
    type: "receive_message",
    senderId,
    receiverId,
    text,
    createdAt: new Date().toISOString()
  };

  const receiverSocket = activeUsers.get(receiverId?.toString());

  if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
    receiverSocket.send(JSON.stringify(messageData));
  }

  ws.send(JSON.stringify(messageData));

  return;
}

      } catch (err) {
        console.error("WebSocket message processing error:", err.message);

        ws.send(
          JSON.stringify({
            type: "contacts_list_add",
            users: [],
          })
        );
      }
    });

    // Clean up mapping when socket closes
    ws.on("close", () => {
      if (ws.userId) {
        activeUsers.delete(ws.userId);
        console.log(`User ${ws.userId} disconnected`);
      } else {
        console.log("Unregistered user disconnected");
      }
    });
  });
};

module.exports = setupWebSocket;