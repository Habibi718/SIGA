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
  const cgpa = portfolio.academics.cgpa || 0;
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
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Message is required." });

  try {
    let portfolio = await Portfolio.findOne({ studentId: req.user.id });
    if (!portfolio) {
      return res.status(404).json({ reply: "Portfolio not found. Please complete your profile wizard first." });
    }

    const systemPrompt = `
You are an expert MERN database parser assistant.
The user wants to add/update an item in their portfolio based on their natural language message: "${message}".

Based on their message, determine which section of their portfolio is being described:
- "academics": updates SGPA, CGPA, year, semester, or attendance.
- "projects": adds a project (fields: title, techStack, description, githubLink, liveUrl, pdfUrl, semester).
- "hackathons": adds a hackathon (fields: name, role, achievement, projectTitle, pdfUrl, semester).
- "research": adds a research paper (fields: title, journal, status, link, pdfUrl, semester).
- "internships": adds an internship (fields: company, role, duration, description, pdfUrl, semester).
- "certificates": adds a certificate (fields: title, issuer, credentialId, credentialUrl, pdfUrl, semester).
- "achievements": adds an achievement (fields: title, description, date, pdfUrl, semester).

You must respond with a JSON object ONLY, in this exact format:
{
  "section": "projects" | "hackathons" | "research" | "internships" | "certificates" | "achievements" | "academics",
  "data": { ... fields for that section ... },
  "explanation": "A friendly confirmation sentence explaining what you parsed and will add/update."
}

Example 1: "I got a 9.2 CGPA in Sem 4"
Response:
{
  "section": "academics",
  "data": { "cgpa": 9.2, "semester": "Sem 4" },
  "explanation": "Updated your cumulative CGPA to 9.2 for Semester 4."
}

Example 2: "I won first place at Smart India Hackathon for a disaster alert system"
Response:
{
  "section": "hackathons",
  "data": { "name": "Smart India Hackathon", "achievement": "First Place", "projectTitle": "Disaster Alert System" },
  "explanation": "Added your First Place achievement at the Smart India Hackathon for the 'Disaster Alert System' project."
}

Example 3: "I completed a ML Internship at Google for 3 months where I worked on NLP algorithms"
Response:
{
  "section": "internships",
  "data": { "company": "Google", "role": "ML Intern", "duration": "3 Months", "description": "Worked on NLP algorithms." },
  "explanation": "Added your ML Intern position at Google with a duration of 3 Months."
}

Ensure your response is valid JSON and contains only these fields. Do not include markdown codeblocks or extra text.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" }
    });

    let cleanedContent = completion.choices[0].message.content.trim();
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    }

    const result = JSON.parse(cleanedContent);
    const { section, data, explanation } = result;

    if (!section || !data) {
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
