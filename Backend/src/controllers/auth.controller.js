const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const nodemailer = require('nodemailer');
const OTP = require('../models/otp.models');


// 1. SEND OTP VIA EMAIL

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required"
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove old OTP if exists to keep DB clean
    await OTP.findOneAndDelete({ email });

    // Save new OTP
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // Valid for 10 minutes
    });

    // Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
      }
    });

    // Setup Email Options
    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is ${otpCode}. It is valid for 10 minutes.`,
      html: `<p>Your verification code is <b>${otpCode}</b>.</p><p>Valid for 10 minutes.</p>`
    };

    // Send email via Nodemailer
    await transporter.sendMail(mailOptions);
    
    console.log(`✅ OTP for ${email} → ${otpCode}`);
    
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email"
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    }); 
  }
};


// 2. REGISTER USER (EMAIL ONLY)

const registerUser = async (req, res) => {
  try {
    let { name, email, password, confirmPassword } = req.body;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" }); 
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    
    name = name.trim();
    email = email.trim().toLowerCase();

    // Check if user exists by email only
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = await User.create({ 
      name,
      email,
      password: hashedPassword 
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: { id: user._id, name: user.name, email: user.email }
    });
    
  } catch (error) {
    console.error("Register error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// 3. LOGIN (EMAIL ONLY)

const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    
    email = email.trim().toLowerCase();

    // Fetch user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    
    // Checking password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email }
    });
    
  } catch (error) {
    console.error("Backend Login Error:", error);
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
};

module.exports = { sendOtp, registerUser, login };