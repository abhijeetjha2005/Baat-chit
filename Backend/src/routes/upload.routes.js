const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();


/* ================= AUDIO STORAGE ================= */

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/audio/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadAudio = multer({
  storage: audioStorage,
});


/* ================= FILE STORAGE ================= */

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/files/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadFile = multer({
  storage: fileStorage,
});


// audio

router.post("/audio", uploadAudio.single("audio"), (req, res) => {
  try {
    console.log("Uploaded audio:", req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "No audio file uploaded",
      });
    }

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


// file upload

router.post("/file", uploadFile.single("file"), (req, res) => {
  try {
    console.log("Uploaded file:", req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    res.status(200).json({
      message: "File upload successful",

      fileUrl: `/uploads/files/${req.file.filename}`,

      fileName: req.file.originalname,

      fileType: req.file.mimetype,

      fileSize: req.file.size,
    });

  } catch (error) {
    console.error("File upload error:", error);

    res.status(500).json({
      message: "File upload failed",
      error: error.message,
    });
  }
});


module.exports = router;