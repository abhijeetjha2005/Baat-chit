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
        message: "Email is required",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email credentials are missing in .env",
      });
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete previous OTP
    await OTP.findOneAndDelete({ email });

    // Save new OTP
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS Length:",
  process.env.EMAIL_PASS.replace(/\s/g, "").length
);
    // Verify transporter
    await transporter.verify();

    // Send email
    await transporter.sendMail({
      from: `"Baat-Chit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otpCode}. It is valid for 10 minutes.`,
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otpCode}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
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