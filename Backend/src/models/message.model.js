const mongoose=require('mongoose')

const messageSchema=new mongoose.Schema({
  conversationId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Conversation',
    required:true
  },
  sender:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text:{
type:String ,
trim:true,
default:null
  },
  messageType:{
    type:String,
    enum:["text","voice"],
    default:"text",
  },
  audioUrl:{
type:String,
default:null
  },

},

  
  {timestamps :true})

module.exports = mongoose.model('Message', messageSchema);