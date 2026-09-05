const express = require("express");
const ai = require("../config/gemini");
// const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/",  async (req, res) => {
    console.log("SAKHA REQUEST:", req.body);
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: message,
    });

    res.json({
      reply: response.text,
    });
  } catch (error) {
    console.error("Sakha AI error:", error);

    res.status(500).json({
      message: "Failed to get AI response",
    });
  }
});

module.exports = router;