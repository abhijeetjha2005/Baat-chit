const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// register user
const registerUser= async(req,res)=>{
  try{
    let{name,phoneNumber,email,password,confirmPassword}=req.body;
    // validation
    if(!name||!phoneNumber||!email||!password||!confirmPassword){
     return res.status(400).json({ success: false, message: "All fields are required" }); 
    }
    if(password!==confirmPassword){
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    // check if user exists
    const existingUser= await User.findOne({$or:[{email},{phoneNumber}]})
    // create new user
    const user = await User.create({ name, phoneNumber, email, password });
    res.status(201).json({
      success:true,
      message:"Registration successful",
      user:{id:user._id,name:user.name,email:user.email}
    })
  }catch(error){
    console.error(error);
    res.status(500).json({success: false, message: "Server error"})
    
  }
}


// login code
const login = async (req, res) => {
     try{
      let {email,password}=req.body
      if (!email || !password) {
  return res.status(400).json({ message: "Email and password are required." });
     }
email = email.trim().toLowerCase();
// Fetch user by email
   const user= await User.findOne({email})
// user present or not
    if(!user){
      return res.status(401).json({message:"Invalid email or password."})
    }
    // checking password with hash password
 const isPasswordValid= await bcrypt.compare(password ,user.password)
 if(!isPasswordValid){
  return res.status(401).json({message: "Invalid email or password."})
 }
//  generate token
const token =jwt.sign(
  {id:user._id,email:user.email},
  process.env.JWT_SECRET,
  {expiresIn:'2h'}
)
return res.status(200).json({
  message:"Login successfull",
  token,
  user:{id:user._id,email:user.email}
})
     }catch(error){
      console.error("Backend Login Error:", error);
      return res.status(500).json({ message: "An unexpected error occurred." });
     }
}


module.exports = { registerUser,login };