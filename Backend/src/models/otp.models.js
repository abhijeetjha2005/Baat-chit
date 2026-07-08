const mongoose=require('mongoose')

const otpSchema= new mongoose.Schema({
  phoneNumber:{
   type:String,
   required:true,
   trim:true
  },
  otp:{
    type:String,
    required:true,
    minlength:6,
    maxlength:6
  },
  expireAt:{
    type:Date,
    required:true
  }
  },{
    timestamps:true

})

// AutoDelete expire opt
otpSchema.index({expiresAT:1},{expireAfterSeconds:0})

module.exports = mongoose.model('OTP', otpSchema);