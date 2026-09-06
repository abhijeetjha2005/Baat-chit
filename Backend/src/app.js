const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const statusRoutes = require("./routes/status.routes");
const uploadRoutes = require("./routes/upload.routes");
const sakhaRoutes = require("./routes/sakha.routes");

const app = express();

// Render sits behind a reverse proxy — trust the first hop so
// X-Forwarded-For is read correctly (needed by express-rate-limit, req.ip, etc.)
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "https://baat-chit-bcd1.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith("-abhijeetjha2005s-projects.vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/sakha", sakhaRoutes);

module.exports = app;