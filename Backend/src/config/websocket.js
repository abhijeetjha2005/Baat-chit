const WebSocket = require("ws");
const mongoose = require("mongoose");
const jwt =require("jsonwebtoken")
const User = require("../models/user.model"); // Ensure path matches your structure
const Message=require("../models/message.model")
const Conversation=require("../models/conversation.model")

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  // 1. Map to store active connections: Map<userId, ws>
  const activeUsers = new Map();

  console.log("WebSocket Server Started");

  wss.on("connection", (ws) => {
    console.log("New user connected via WebSocket");

    ws.on("message", async (message) => {
       console.log("RAW MESSAGE:", message.toString());
      try {
        const data = JSON.parse(message);
        // authentication handling
        if(!ws.isAuthenticated){
          if(data.type!=="authenticate"||!data.token){
            ws.close(1008,"Authentication required");
            return;
          }
          try{
             const decoded=jwt.verify(data.token, process.env.JWT_SECRET); 
             ws.userId=decoded.id.toString();
             ws.isAuthenticated=true;
             console.log("websocket authenticated",ws.userId);
             
            
             
             ws.send(
  JSON.stringify({
    type: "authenticated",
    userId: ws.userId,
  })
)
          }catch(error){
            console.error("WebSocket JWT error:", error.message);
         ws.close(1008, "Invalid or expired token");
       return;
        }   
        }        

        // --- NEW: Register user connection on connect/auth ---
if (data.type === "register") {
 
   const userId =ws.userId;
   activeUsers.set(userId,ws);
    // Mark user online
    await User.findByIdAndUpdate(userId, {
      isOnline: true
    });


    console.log(`User registered on WS: ${userId}`);

    // Notify other connected users
    for (const [otherUserId, otherSocket] of activeUsers.entries()) {
      if (
        otherUserId !== userId &&
        otherSocket.readyState === WebSocket.OPEN
      ) {
        otherSocket.send(
          JSON.stringify({
            type: "user_status_change",
            userId: userId,
            status: "online"
          })
        );
      }
    }
  

  return;
}

        // --- FETCH CONTACTS LIST ---
        if (data.type === "fetch_contacts_list") {
         const currentUserId = ws.userId;


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

// FETCH OLD CHAT MESSAGES
if (data.type === "fetch_messages") {

  console.log("FETCH MESSAGE REQUEST:", data);

const senderId = ws.userId;
const { receiverId } = data;  

  // Send current receiver status immediately
  const receiver = await User.findById(receiverId)
    .select("isOnline lastSeen");

  ws.send(
    JSON.stringify({
      type: "user_status_change",
      userId: receiverId,
      status: receiver?.isOnline ? "online" : "offline",
      lastSeen: receiver?.lastSeen || null
    })
  );

  const conversation = await Conversation.findOne({
    participants: {
      $all: [senderId, receiverId]
    },
    isGroup: false
  });

  if (!conversation) {
    ws.send(
      JSON.stringify({
        type: "old_messages",
        messages: []
      })
    );
    return;
  }

  const messages = await Message.find({
    conversationId: conversation._id,
     
  }).sort({ createdAt: 1 });

  console.log("FOUND MESSAGES:", messages);

  ws.send(
    JSON.stringify({
      type: "old_messages",
      conversationId: conversation._id,
      messages
    })
  );

  return;
}
  if(data.type==="typing"){
   const senderId = ws.userId;
const { receiverId, isTyping } = data;
    console.log("Typing Event" ,{
      senderId,
      receiverId,
      isTyping}
    );
    
    const receiverSocket=activeUsers.get(receiverId?.toString());
    if(receiverSocket && receiverSocket.readyState===WebSocket.OPEN){
      receiverSocket.send(
        JSON.stringify({
            type: "typing",
        senderId: senderId,
        isTyping: isTyping
        })
      )
       
    }
    return;
  }
        // --- NEW: HANDLE CHAT MESSAGES  and store it---
if (data.type === "send_message") {

  console.log("SEND MESSAGE:", data);

  const senderId = ws.userId;
const { receiverId, text } = data;

let conversation=await Conversation.findOne({
  participants :{$all :[senderId,receiverId]},
  isGroup:false
})
if(!conversation){
  conversation=await Conversation.create({
    participants:[senderId,receiverId],
    isGroup:false
  })
}

  // Save message in MongoDB
  const savedMessage =await Message.create({
 conversationId:conversation._id,
 sender: senderId,
 text,
  });
conversation.lastMessage = savedMessage._id;
await conversation.save();

  const messageData = {
    type: "receive_message",
     conversationId: conversation._id,
    message: {
    _id: savedMessage._id,
    conversationId: savedMessage.conversationId,
    sender: savedMessage.sender,
    text: savedMessage.text,
    createdAt: savedMessage.createdAt
  }
  };


  const receiverSocket = activeUsers.get(receiverId?.toString());


  if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
    receiverSocket.send(JSON.stringify(messageData));
  }


  ws.send(JSON.stringify(messageData));

  return;
}
if (data.type === "send_voice") {
  console.log("SEND VOICE:", data);
  const senderId = ws.userId;
const { receiverId, audioUrl } = data;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    isGroup: false,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      isGroup: false,
    });
  }

  const savedMessage = await Message.create({
    conversationId: conversation._id,
    sender: senderId,
    messageType: "voice",
    audioUrl: audioUrl,
  });

  conversation.lastMessage = savedMessage._id;
  await conversation.save();

  const messageData = {
    type: "receive_message",

    conversationId: conversation._id,

    message: {
      _id: savedMessage._id,
      conversationId: savedMessage.conversationId,
      sender: savedMessage.sender,
      messageType: savedMessage.messageType,
      audioUrl: savedMessage.audioUrl,
      createdAt: savedMessage.createdAt,
    },
  };

  // Send to receiver
  const receiverSocket = activeUsers.get(receiverId?.toString());

  if (
    receiverSocket &&
    receiverSocket.readyState === WebSocket.OPEN
  ) {
    receiverSocket.send(JSON.stringify(messageData));
  }

  // Send back to sender
  ws.send(JSON.stringify(messageData));

  return;
}
/* ================= SEND FILE ================= */

if (data.type === "send_file") {
  console.log("SEND FILE:", data);

  const senderId = ws.userId;

  const {
    receiverId,
    fileUrl,
    fileName,
    fileType,
    fileSize,
  } = data;

  // Find conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    isGroup: false,
  });

  // Create conversation if it doesn't exist
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      isGroup: false,
    });
  }

  // Save file message
  const savedMessage = await Message.create({
    conversationId: conversation._id,
    sender: senderId,

    messageType: "file",

    fileUrl,
    fileName,
    fileType,
    fileSize,
  });

  // Update last message
  conversation.lastMessage = savedMessage._id;
  await conversation.save();

  // Prepare WebSocket response
  const messageData = {
    type: "receive_message",

    conversationId: conversation._id,

    message: {
      _id: savedMessage._id,
      conversationId: savedMessage.conversationId,
      sender: savedMessage.sender,

      messageType: savedMessage.messageType,

      fileUrl: savedMessage.fileUrl,
      fileName: savedMessage.fileName,
      fileType: savedMessage.fileType,
      fileSize: savedMessage.fileSize,

      createdAt: savedMessage.createdAt,
    },
  };

  // Send to receiver
  const receiverSocket = activeUsers.get(receiverId.toString());

  if (
    receiverSocket &&
    receiverSocket.readyState === WebSocket.OPEN
  ) {
    receiverSocket.send(JSON.stringify(messageData));
  }

  // Send back to sender
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


    ws.on("error", (error) => {
  console.error("WebSocket ERROR:", error);
});
    // Clean up mapping when socket closes
ws.on("close", async () => {
  if (!ws.userId) {
    console.log("Unregistered user disconnected");
    return;
  }

  const userId = ws.userId;

  try {
    // Only remove this socket if it is still
    // the active socket for this user
    if (activeUsers.get(userId) === ws) {
      activeUsers.delete(userId);

      const lastSeen = new Date();

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: lastSeen,
      });

      // Notify other connected users
      for (const [otherUserId, otherSocket] of activeUsers.entries()) {
        if (otherSocket.readyState === WebSocket.OPEN) {
          otherSocket.send(
            JSON.stringify({
              type: "user_status_change",
              userId: userId,
              status: "offline",
              lastSeen: lastSeen,
            })
          );
        }
      }
    }

    console.log(`User ${userId} disconnected`);
  } catch (error) {
    console.error("Error during WebSocket close:", error);
  }
});
  });
};

module.exports = setupWebSocket;