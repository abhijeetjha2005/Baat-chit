const User =require('../models/user.model')

const loginUser=async (req,res) =>{
  try{
    const {email,password}=req.body;
    // user exist or not
    const user= await User.findOne({email})
    if(!user){
      return res.status(400).json({message:"User does not exist"})
    }
    // password check
    if(user.password!==password){
      return res.status(400).json({message:"User does not exist"})
    }
    // success
    res.status(200).json({ 
            message: "Login successful! Redirecting to chat...",
            userId: user._id
        });
  }
  catch(error){
   res.status(500).json({ message: "Server error", error: error.message })
  }
}
module.exports = { loginUser };