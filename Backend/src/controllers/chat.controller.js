const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');


// 1. Get or Create Conversation + Load Messages
exports.getOrCreateConversation=async (req,res)=>{
  try{
    const senderId=req.user.id;
    const {receiverId}=req.params;
    if(!receiverId){
      return res.status(400).json({message:"Receiver not found "})
    }
    // Find conversation involving BOTH users
   let conversation = await Conversation.findOne({
  participants: { $all: [senderId, receiverId] }
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
exports.sendMessage=async(req,res)=>{
  try{

const senderId= req.user.id
const {conversationId,text}=req.body
if(!conversationId|| !text){
  return res.status(400).json
({message:"Conversation ID and text are required."})

}
// Create and save message
const newMessage =await Message.create({
  conversationId,
  sender:senderId,
  text
})
// Update the conversation's last message reference
await Conversation.findByIdAndUpdate(conversationId,
  {lastMessage:newMessage._id
}
)

  }catch(error){
    res.status(500).json({message:"server error",error: error.message})
  }
}

// unsend
exports.deleteMessage=async(req,res)=>{
  try{
    const userId=req.user.id;
    const {messageId}=req.params;

    // Find the message first to verify ownership
    const message =await Message.findById(messageId)
    if(!message){
      return res.status.status(404).json({message: "Message not found."})

    }
    //  Security Check: Only the sender can delete their own message
if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this message." });
    }
    const conversationId = message.conversationId;
    await Message.findByIdAndDelete(messageId);

    // Optimization: If we deleted the "lastMessage", update the conversation reference
    const remaininngLastMessage=await Message.findOne({conversationId}).sort({createdAt:-1})

     await Conversation.findByIdAndUpdate(conversationId,{
      lastMessage:remaininngLastMessage?remaininngLastMessage._id:null
     })
 res.status(200).json({ message: "Message deleted successfully.", messageId });

  }catch(error){
res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// clear chat

exports.deleteConversation=async=>{
  try{
const userID=req.user.id;
const {conversationId}=req.params;

const conversation= await Conversation.findById(conversationId);
if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Unauthorized to delete this chat." });
    }

    // Delete all messages linked to this conversation
    await Message.deleteMany({ conversationId });

    // Delete the conversation document itself
    await Conversation.findByIdAndDelete(conversationId);

res.status(200).json({ message: "Conversation and chat history cleared successfully." });

  }catch(error){
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}
