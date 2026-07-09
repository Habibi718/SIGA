const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const Portfolio = require("../models/Portfolio");
const auth = require("../middleware/auth");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// @route   POST api/ai/ask
// @desc    Chat with AI Mentor incorporating student profile context
// @access  Private
router.post("/ask", auth, async (req, res) => {
  const { message } = req.body;

  try {
    // Attempt to pull student's portfolio context
    const portfolio = await Portfolio.findOne({ studentId: req.user.id });
    
    let contextPrompt = "";
    if (portfolio) {
      contextPrompt = `
You are mentoring the student: ${portfolio.fullName}.
Department: ${portfolio.academics.year} - ${portfolio.academics.semester}.
Current Innovation Score: ${portfolio.innovationScore}%
Current CGPA: ${portfolio.academics.cgpa}
Projects recorded: ${portfolio.projects.map(p => `${p.title} (${p.techStack})`).join(", ") || "None"}
Hackathons recorded: ${portfolio.hackathons.map(h => `${h.name} (${h.achievement})`).join(", ") || "None"}
Certifications: ${portfolio.certificates.map(c => c.title).join(", ") || "None"}
Internships: ${portfolio.internships.map(i => i.company).join(", ") || "None"}
`;
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are SIGA AI Mentor, an innovation advisor for engineering students.
Provide highly practical, specific, and motivating recommendations.
Always cross-reference their current achievements and guide them toward projects, internships, hackathons, and placements.

${contextPrompt}
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({
      reply: "Sorry, I am having trouble contacting the AI server right now.",
    });
  }
});

module.exports = router;
