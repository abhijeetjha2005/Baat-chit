const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const statusRoutes = require("./routes/status.routes");
const uploadRoutes = require("./routes/upload.routes");
const sakhaRoutes = require("./routes/sakha.routes");

const app = express();

// Render is behind a reverse proxy
app.set("trust proxy", 1);

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://baat-chit-bcd1.vercel.app",
];

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost and production domain
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments
      if (
        /^https:\/\/baat-chit-bcd1-[a-z0-9-]+\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/sakha", sakhaRoutes);

// Static uploads
app.use("/uploads", express.static("uploads"));

module.exports = app;