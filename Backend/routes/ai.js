const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const Portfolio = require("../models/Portfolio");
const auth = require("../middleware/auth");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Helper function to calculate innovation score and radar metrics
function calculateMetrics(portfolio) {
  const hasProjects = portfolio.projects && portfolio.projects.length > 0;
  const hasHackathons = portfolio.hackathons && portfolio.hackathons.length > 0;
  const hasResearch = portfolio.research && portfolio.research.length > 0;
  const hasCertificates = portfolio.certificates && portfolio.certificates.length > 0;
  const hasInternships = portfolio.internships && portfolio.internships.length > 0;
  const hasAchievements = portfolio.achievements && portfolio.achievements.length > 0;
  const cgpa = portfolio.academics?.cgpa || 0;

  if (!hasProjects && !hasHackathons && !hasResearch && !hasCertificates && !hasInternships && !hasAchievements && cgpa === 0) {
    portfolio.innovationScore = 0;
    portfolio.radarMetrics = {
      research: 0,
      technical: 0,
      entrepreneurship: 0,
      leadership: 0,
      collaboration: 0,
      creativity: 0
    };
    portfolio.semesterScores = {
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
      s5: 0,
      s6: 0
    };
    return;
  }

  let score = 30; // base score

  // Count approved items or fallback to all items if they are pending (for simplicity in demo)
  const approvedProjects = portfolio.projects.filter(p => p.verificationStatus !== "Rejected");
  const approvedHackathons = portfolio.hackathons.filter(h => h.verificationStatus !== "Rejected");
  const approvedResearch = portfolio.research.filter(r => r.verificationStatus !== "Rejected");
  const approvedCertificates = portfolio.certificates.filter(c => c.verificationStatus !== "Rejected");
  const approvedInternships = portfolio.internships.filter(i => i.verificationStatus !== "Rejected");

  // Score contributions
  score += approvedProjects.length * 8;
  score += approvedHackathons.length * 8;
  score += approvedResearch.length * 12;
  score += approvedCertificates.length * 4;
  score += approvedInternships.length * 10;

  // Add academic factor (e.g. cgpa * 1.5)
  score += Math.round(cgpa * 1.5);

  // Cap score at 98%
  portfolio.innovationScore = Math.min(score, 98);

  // Calculate radar indices (out of 100)
  portfolio.radarMetrics = {
    research: Math.min(30 + approvedResearch.length * 25, 100),
    technical: Math.min(40 + approvedProjects.length * 10 + approvedCertificates.length * 5, 100),
    entrepreneurship: Math.min(20 + approvedProjects.length * 10 + approvedInternships.length * 15, 100),
    leadership: Math.min(30 + approvedHackathons.length * 15 + approvedInternships.length * 10, 100),
    collaboration: Math.min(40 + approvedHackathons.length * 15 + approvedProjects.length * 5, 100),
    creativity: Math.min(35 + approvedProjects.length * 10 + approvedResearch.length * 10, 100)
  };

  // Adjust semester scores based on overall innovation growth progression
  portfolio.semesterScores = {
    s1: 30 + Math.round(cgpa * 1),
    s2: Math.min(40 + approvedCertificates.length * 2 + Math.round(cgpa * 1.2), 100),
    s3: Math.min(50 + approvedProjects.length * 4 + approvedCertificates.length * 3, 100),
    s4: Math.min(portfolio.innovationScore, 100),
    s5: Math.min(portfolio.innovationScore + 4, 100),
    s6: Math.min(portfolio.innovationScore + 8, 100)
  };
}

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

// @route   POST api/ai/update-portfolio
// @desc    Directly parse natural language and update Mongoose portfolio record autonomously
// @access  Private
router.post("/update-portfolio", auth, async (req, res) => {
  const { message, history } = req.body;
  console.log("-> Incoming AI update request, message:", message);
  if (!message) return res.status(400).json({ reply: "Message is required." });

  try {
    let portfolio = await Portfolio.findOne({ studentId: req.user.id });
    if (!portfolio) {
      console.log("-> Portfolio not found for user ID:", req.user.id);
      return res.status(404).json({ reply: "Portfolio not found. Please complete your profile wizard first." });
    }

    const systemPrompt = `
You are an expert MERN database parser assistant.
The user wants to add/update an item in their portfolio.

For items like projects, hackathons, research, internships, certificates, and achievements, you require the following fields to make a complete record:
- "techStack" (e.g. React, Node.js, C++)
- "description" (what the project or work does)
- "semester" (e.g. Sem 4, Sem 3)
- "pdfUrl" (PDF link or image URL: accepts .png, .jpg, .jpeg, .pdf)
- "githubLink" (GitHub profile or project link)

If the user's message or the conversation history is missing any of these details for the new item they want to add (e.g., they just said "add microcontroller project" but did not specify techStack, description, semester, PDF link, or githubLink), you must respond in Format A to request the missing fields.
Only respond in Format B to save the item once you have collected all these details (or the user explicitly says they do not have them or want to skip them).

Your response must always be a JSON object in one of these two formats:

Format A (If details like techStack, description, semester, pdfUrl, githubLink are missing):
{
  "status": "need_more_info",
  "reply": "A polite message stating you will add the item, and asking for the missing fields: Tech Stack, Description, Semester, PDF/Image link, and GitHub link."
}

Format B (If you have all details or the user skipped them):
{
  "status": "save",
  "section": "projects" | "hackathons" | "research" | "internships" | "certificates" | "achievements" | "academics",
  "data": { ... fields ... },
  "explanation": "A friendly confirmation sentence explaining what was added."
}

Ensure your response is valid JSON and contains only these fields. Do not include markdown codeblocks or extra text.
`;

    // Construct message history for Groq to maintain conversational state
    const groqMessages = [
      { role: "system", content: systemPrompt }
    ];

    if (history && Array.isArray(history)) {
      history.forEach(h => {
        // Map sender to role (ai -> assistant, user -> user)
        groqMessages.push({
          role: h.sender === "ai" ? "assistant" : "user",
          content: h.text
        });
      });
    }

    // Append the current message
    groqMessages.push({ role: "user", content: message });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      response_format: { type: "json_object" }
    });

    let cleanedContent = completion.choices[0].message.content.trim();
    console.log("-> Cleaned Groq response:", cleanedContent);
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    }

    const result = JSON.parse(cleanedContent);
    console.log("-> Parsed result:", result);
    
    if (result.status === "need_more_info") {
      return res.json({
        reply: result.reply,
        status: "need_more_info"
      });
    }

    const { section, data, explanation } = result;

    if (!section || !data) {
      console.log("-> Missing section or data keys!");
      return res.status(422).json({ reply: "Could not parse details from your message. Please specify the name/details of your project, internship, or score." });
    }

    // Apply the updates
    if (section === "academics") {
      portfolio.academics = { ...portfolio.academics, ...data };
    } else if (portfolio[section]) {
      // Force verificationStatus: Pending for new user-inserted items
      data.verificationStatus = "Pending";
      portfolio[section].push(data);
    } else {
      return res.status(400).json({ reply: `Section ${section} is not supported.` });
    }

    // Recalculate Innovation Index metrics
    calculateMetrics(portfolio);
    await portfolio.save();

    res.json({
      reply: `🚀 **Success!** ${explanation} \n\nYour portfolio metrics have been recalculated and updated automatically.`,
      status: "save",
      portfolio
    });
  } catch (err) {
    console.error("AI Update Error:", err);
    res.status(500).json({
      reply: "Sorry, I had an error parsing your request and saving it to the database.",
    });
  }
});

module.exports = router;
