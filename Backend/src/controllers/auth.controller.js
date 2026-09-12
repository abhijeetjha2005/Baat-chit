
const { BrevoClient } = require("@getbrevo/brevo");

const brevoClient = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const OTP = require("../models/otp.models");




// 1. SEND OTP


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


    // Generate 6 digit OTP
    const otpCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();


    // Delete old OTP
    await OTP.findOneAndDelete({ email });


    // Save new OTP
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });


    // Send email using Resend
   // Send email using Brevo
await brevoClient.sendTransacEmail({
  sender: {
    name: "Baat-Chit",
    email: "abhijeethoshiyar100@gmail.com"
  },
  to: [
    {
      email: email
    }
  ],
  subject: "Your Baat-Chit OTP Verification",
  htmlContent: `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: auto;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
    ">

      <h2 style="
        text-align: center;
        color: #10b981;
      ">
        बात-चीत
      </h2>

      <h3>Email Verification</h3>

      <p>Your OTP verification code is:</p>

      <div style="
        text-align: center;
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 8px;
        color: #10b981;
        padding: 20px;
      ">
        ${otpCode}
      </div>

      <p>This OTP is valid for 10 minutes.</p>

      <p style="
        color: #6b7280;
        font-size: 13px;
      ">
        Do not share this OTP with anyone.
      </p>

    </div>
  `
});

console.log("OTP Email Sent Successfully");



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



// 2. REGISTER USER


const registerUser = async (req, res) => {
  try {

    let {
      name,
      email,
      password,
      confirmPassword,
      otp
    } = req.body;


    // Validation
    if (!name || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }


    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }


    name = name.trim();
    email = email.trim().toLowerCase();


    // Find OTP
    const otpRecord = await OTP.findOne({ email });


    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }


    // Check expiration
    if (otpRecord.expiresAt < new Date()) {

      await OTP.deleteOne({ email });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }


    // Check OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }


    // Check existing user BEFORE deleting OTP
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);


    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });


    // Delete OTP
    await OTP.deleteOne({ email });


    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// 3. LOGIN


const login = async (req, res) => {
  try {

    let { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }


    email = email.trim().toLowerCase();


    const user = await User.findOne({ email });


    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }


    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );


    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }


    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );


    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.error("Login Error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred",
    });
  }
};


// 4. FORGOT PASSWORD


const forgotPassword = async (req, res) => {
  try {

    let { email } = req.body;


    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }


    email = email.trim().toLowerCase();


    const user = await User.findOne({ email });


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }


    // Create reset token
    const resetToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );


    // IMPORTANT: Normal URL string
    const resetUrl =
      `https://baat-chit-bcd1.vercel.app/reset-password?token=${resetToken}`;


    // Send email using Resend
   // Send email using Brevo
await  brevoClient.sendTransacEmail({
  sender: {
    name: "Baat-Chit",
    email: "abhijeethoshiyar100@gmail.com"
  },

  to: [
    {
      email: email
    }
  ],

  subject: "Reset Your Password - Baat-Chit",

  htmlContent: `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: auto;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
    ">

      <h2 style="
        color: #10b981;
        text-align: center;
      ">
        बात-चीत
      </h2>

      <h3>Reset Your Password</h3>

      <p style="
        color: #4b5563;
        line-height: 1.6;
      ">
        We received a request to reset your password.
      </p>

      <div style="
        text-align: center;
        margin: 30px 0;
      ">

        <a
          href="${resetUrl}"
          style="
            background-color: #10b981;
            color: white;
            padding: 14px 25px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>

      </div>

      <p style="color: #6b7280;">
        This link is valid for 15 minutes.
      </p>

      <p style="
        color: #9ca3af;
        font-size: 12px;
      ">
        If you did not request this password reset,
        you can safely ignore this email.
      </p>

    </div>
  `
});

console.log("Reset Email Sent Successfully");


    return res.status(200).json({
      success: true,
      message: "Reset link sent successfully",
    });

  } catch (error) {

    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send reset email",
    });
  }
};



// 5. RESET PASSWORD


const resetPassword = async (req, res) => {
  try {

    const {
      token,
      password,
      confirmPassword
    } = req.body;


    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }


    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }


    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    const user = await User.findById(decoded.id);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // Hash new password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );


    user.password = hashedPassword;

    await user.save();


    return res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in.",
    });

  } catch (error) {

    console.error("Reset Password Error:", error);


    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "The reset link has expired",
      });
    }


    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset link",
      });
    }


    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


module.exports = {
  sendOtp,
  registerUser,
  login,
  forgotPassword,
  resetPassword,
};