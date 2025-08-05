const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const OpenAI = (await import("openai")).default; // import here after polyfills
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages = req.body.messages;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    res.json(completion.choices[0].message);
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
