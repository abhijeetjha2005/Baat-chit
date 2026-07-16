const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const { loginLimiter } = require('../middleware/auth.middleware');
// Import controllers
const { 
  sendOtp, 
  registerUser, 
  login ,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');

// Import middleware (if you have it)

// Routes
router.post('/send-otp', sendOtp);           // Send OTP
router.post('/register', registerUser);      // Register with OTP verification
router.post('/login', loginLimiter, login);  // Login with rate limiting
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;