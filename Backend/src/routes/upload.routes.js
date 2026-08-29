const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/audio/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/audio", upload.single("audio"), (req, res) => {
  try {
    console.log("Uploaded file:", req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "No audio file uploaded",
      });
    }

    const audioUrl = `/uploads/audio/${req.file.filename}`;

    res.status(200).json({
      message: "Audio upload successful",
      audioUrl: `/uploads/audio/${req.file.filename}`,
    });

  } catch (error) {
    console.error("Audio upload error:", error);

    res.status(500).json({
      message: "Audio upload failed",
      error: error.message,
    });
  }
});

module.exports = router;