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
// Optional: General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

module.exports = { loginLimiter,apiLimiter };