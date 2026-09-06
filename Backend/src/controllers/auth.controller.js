const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const OTP = require('../models/otp.models');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. SEND OTP VIA EMAIL

const sendOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    email = email.trim().toLowerCase();

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Email service is not configured",
      });
    }

    // Generate OTP
    const otpCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Delete previous OTP
    await OTP.findOneAndDelete({ email });

    // Send email FIRST
    const { data, error } = await resend.emails.send({
      from: "Baat-Chit <onboarding@resend.dev>",
      to: [email],
      subject: "OTP Verification - Baat-Chit",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otpCode}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    // Save OTP only after email is successfully sent
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    console.log("OTP email sent:", data);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};


// 2. REGISTER USER (EMAIL ONLY)

const registerUser = async (req, res) => {
  try {
    let { name, email, password, confirmPassword, otp } = req.body;
    
    // 1. Structural Validation
    if (!name || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({ success: false, message: "All fields are required" }); 
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters."
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    name = name.trim();
    email = email.trim().toLowerCase();    

    // 2. Verify Security Tokens (OTP)
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found"
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // OTP is correct, remove it
    await OTP.deleteOne({ email });
    
    // 3. Check Account Availability
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    
    // 4. Encrypt and Commit Record
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
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


// 4. FORGOT PASSWORD

const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "No account found with this email address." 
      });
    }    

    const resetToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
  
    const resetUrl = `https://baat-chit-bcd1.vercel.app/reset-password?token=${resetToken}`;

 const { data, error } = await resend.emails.send({
  from: "Baat-Chit Security <onboarding@resend.dev>",
  to: [email],
  subject: "Reset your Password - Baat-Chit",

  html: `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: auto;
      padding: 20px;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
    ">

      <h2 style="color: #10b981; text-align: center;">
        बात-चीत
      </h2>

      <h3 style="color: #1f2937;">
        Reset Your Password
      </h3>

      <p style="color: #4b5563;">
        We received a request to reset your password.
        Click the button below to create a new password.
      </p>

      <div style="text-align: center; margin: 30px 0;">

        <a
          href="${resetUrl}"
          style="
            background-color: #10b981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>

      </div>

      <p style="color: #9ca3af; font-size: 12px;">
        This link is valid for 15 minutes.
      </p>

      <p style="color: #9ca3af; font-size: 12px;">
        If you did not request this, you can safely ignore this email.
      </p>

    </div>
  `,
});

if (error) {
  console.error("Resend Error:", error);

  return res.status(500).json({
    success: false,
    message: "Failed to send reset email",
  });
}

console.log("Reset email sent:", data);

   

    return res.status(200).json({
      success: true,
      message: "Reset link sent successfully",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to send reset email. Try again later." 
    });
  }
};


// 5. APPLY NEW PASSWORD

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    // 1. Structural Validation (FIXED: Length checking shifted directly to early fail points)
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields (token, password, confirmPassword) are required." 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters."
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Passwords do not match." 
      });
    }

    // 2. Decode Identity Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Fetch Matching User Identity
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found." 
      });
    }

    // 4. Hash and Persist New Credentials
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ 
        success: false, 
        message: "The reset link has expired. Please request a new one." 
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid reset link/token." 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: "An unexpected error occurred while resetting your password." 
    });
  }
};

module.exports = { sendOtp, registerUser, login, forgotPassword, resetPassword };