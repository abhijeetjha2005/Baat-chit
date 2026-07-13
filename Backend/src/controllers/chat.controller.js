const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');


// 1. Get or Create Conversation + Load Messages personal chat
exports.getOrCreateConversation=async (req,res)=>{
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

// 2. GROUP CHAT: Create Group

exports.createGroup = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { title, participantIds } = req.body; // Array of user IDs

    if (!title || !participantIds || participantIds.length === 0) {
      return res.status(400).json({ message: "Group title and members are required." });
    }

    // Ensure the creator is included in the group members array
    const uniqueParticipants = Array.from(new Set([...participantIds, adminId]));

    const group = await Conversation.create({
      groupTitle: title,
      participants: uniqueParticipants,
      isGroup: true,
      groupAdmin: adminId
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

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

    const isParticipant = conversation?.participants.some(
  (id) => id.toString() === senderId
);


if (!conversation || !isParticipant) {
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
exports.deleteMessage=async(req,res)=>{
  try{
    const userId=req.user.id;
    const {messageId}=req.params;

    // Find the message first to verify ownership
    const message =await Message.findById(messageId)
    if(!message){
      return res.status(404).json({message: "Message not found."})

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


// delete conversation
exports.deleteConversation=async(req,res)=>{
  try{

    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Chat not found." });

    // Group Security Rule: Only group admin can completely dissolve a group chat
    if (conversation.isGroup && conversation.groupAdmin.toString() !== userId) {
      return res.status(403).json({ message: "Only group admins can delete group chats." });
    }

    // Personal Chat Security Rule: Must be part of it
const isParticipant = conversation.participants.some(
  (id) => id.toString() === userId
);

if (!conversation.isGroup && !isParticipant) {
  return res.status(403).json({
    message: "Unauthorized."
  });
}  

    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndDelete(conversationId);

   return res.status(200).json({
  message: "Conversation deleted successfully."
});
  }catch(error){
res.status(500).json({ message: "Server Error", error: error.message });
  }
}