const express =require('express')
const router=express.Router()
const {login}=require('../controllers/auth.controller')
const rateLimit=require('express-rate-limit')

// Brute forcce protection 
// block for 15 min
const loginLimiter= rateLimit({
  windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { message: "Too many login attempts. Try again in 15 minutes." },
    standardHeaders: true, 
    legacyHeaders: false,
})
router.post('/login', loginLimiter, login);

module.exports=router;

