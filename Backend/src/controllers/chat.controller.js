const mongoose = require("mongoose");
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');


// 1. Get or Create Conversation + Load Messages personal chat
exports.getOrCreateConversation=async (req,res)=>{
    console.log("getOrCreateConversation called");
  console.log("Sender:", req.user.id);
  console.log("Receiver:", req.params.receiverId);
  try{
    const senderId=req.user.id;
    const {receiverId}=req.params;
    if(!receiverId){
      return res.status(400).json({message:"Receiver not found "})
    }
    // Find conversation involving BOTH users
    let conversation = await Conversation.findOne({
  isGroup: false,
  participants: {
    $all: [senderId, receiverId]
  }
});



// 2. If no conversation exists between these two, create one

if(!conversation){
  conversation=await Conversation.create({
    participants: [senderId, receiverId]
  })
}



// / 3. Fetch all historical messages for this conversation

const messages= await Message.find({
  conversationId:conversation._id
}).sort({
  createdAt:1
})

// 4. Return both the conversation meta-data and the history to the frontend

res.status(200).json({
      conversationId: conversation._id,
      messages
    });

  }catch(error){
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}
/**
 * @desc    HTTP Fallback/Persistence to save messages to MongoDB
 * @route   POST /api/chat/send
 * @acess  Private
 */



// send messages
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, text } = req.body;
    
    if (!conversationId || !text) {
      return res.status(400).json({ message: "Conversation ID and text are required." });
    }

    // Verify sender belongs to this conversation/group
    const conversation = await Conversation.findById(conversationId);
 if (!conversation) {
    return res.status(404).json({
        message: "Conversation not found."
    });
}

const isParticipant = conversation.participants.some(
    id => id.toString() === senderId
);

if (!isParticipant) {
    return res.status(403).json({
        message: "Unauthorized to post in this chat."
    });
}


    const newMessage = await Message.create({
      conversationId,
      sender: senderId,
      text
    });

    // FIXED: Corrected Mongoose syntax (ID, updateBody)
    await Conversation.findByIdAndUpdate(conversationId, { 
      lastMessage: newMessage._id 
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// unsend
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found."
      });
    }

    // Find the conversation containing this message
    const conversation = await Conversation.findById(message.conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found."
      });
    }

    // Check that the logged-in user belongs to this conversation
    const isParticipant = conversation.participants.some(
      (id) => id.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Unauthorized to delete this message."
      });
    }

    // Delete message for everyone
  // Delete message for everyone
await Message.findByIdAndDelete(messageId);

// Update lastMessage if the deleted message was the last message
const remainingLastMessage = await Message.findOne({
  conversationId: message.conversationId
}).sort({ createdAt: -1 });

await Conversation.findByIdAndUpdate(message.conversationId, {
  lastMessage: remainingLastMessage
    ? remainingLastMessage._id
    : null
});    

    res.status(200).json({
      message: "Message deleted successfully.",
      messageId
    });

  } catch (error) {
    console.error("Delete message error:", error);

    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    console.log("DELETE CONVERSATION ID:", conversationId);
    console.log("DELETE USER ID:", userId);

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(200).json({
        message: "Chat already deleted"
      });
    }

    const isParticipant = conversation.participants.some(
      (id) => id.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "Unauthorized."
      });
    }

    // Delete all messages belonging to this conversation
    await Message.deleteMany({
      conversationId: conversationId
    });

    // Delete conversation
    await Conversation.findByIdAndDelete(conversationId);

    console.log("Conversation deleted:", conversationId);

    return res.status(200).json({
      message: "Conversation deleted successfully.",
      conversationId
    });

  } catch (error) {
    console.error("Delete conversation error:", error);

    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

exports.getConversation=async(req,res)=>{
  try{
    // Logged in user
      const userId=req.user.id;
  // Find all conversations where the logged-in user is a participant
    const conversations=await Conversation.find({
      participants :userId
    })
    // Get participant details instead of only ObjectIds
    .populate("participants","name email")
      // Get last message details
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name email",
        },
      })
         // Latest conversation first
      .sort({ updatedAt: -1 });
        return res.status(200).json({
      success: true,
      conversations,
    });
 
  }catch(error){
  return res.status(500).json
({
 success:false,
 message:"server error",
 error:error.message
}) 
 }
}