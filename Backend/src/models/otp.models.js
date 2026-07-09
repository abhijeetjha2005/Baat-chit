const mongoose=require('mongoose')

const otpSchema= new mongoose.Schema({
  
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otp:{
    type:String,
    required:true,
    minlength:6,
    maxlength:6
  },
  expiresAt:{
    type:Date,
    required:true
  }
  },{
    timestamps:true

})

// AutoDelete expire opt
otpSchema.index({expiresAt:1},{expireAfterSeconds:0})

module.exports = mongoose.model('OTP', otpSchema);