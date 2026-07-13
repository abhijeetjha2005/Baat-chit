const rateLimit=require('express-rate-limit')
const jwt = require("jsonwebtoken");


// token
const auth =(req,res,next)=>{
  try{
    const token= req.cookies?.token;

      if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided."
      });
    }
      // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

       // Make user data available in controllers
    req.user = decoded;
 
    next();
  }catch(error){
        return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
  }



// Brute forcce protection 
// block for 15 min
const loginLimiter= rateLimit({
  windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { message: "Too many login attempts. Try again in 15 minutes." },
    standardHeaders: true, 
    legacyHeaders: false,
})
// Optional: General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

module.exports = {auth, loginLimiter,apiLimiter };