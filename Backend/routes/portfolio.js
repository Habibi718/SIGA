const express = require("express");
const router = express.Router();
const Portfolio = require("../models/Portfolio");
const User = require("../models/User");
const auth = require("../middleware/auth");

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

// @route   GET api/portfolio/my
// @desc    Get active student's portfolio
// @access  Private
router.get("/my", auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ studentId: req.user.id });
    
    if (!portfolio) {
      // Find user details
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      // Create a fresh blank portfolio
      portfolio = new Portfolio({
        studentId: req.user.id,
        prn: user.username,
        fullName: user.fullName,
        academics: {
          semester: user.semester || "Sem 4"
        }
      });
      calculateMetrics(portfolio);
      await portfolio.save();
    }
    
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/portfolio/save
// @desc    Create or update student portfolio
// @access  Private
router.post("/save", auth, async (req, res) => {
  try {
    const updateData = req.body;
    let portfolio = await Portfolio.findOne({ studentId: req.user.id });

    if (!portfolio) {
      const user = await User.findById(req.user.id);
      portfolio = new Portfolio({
        studentId: req.user.id,
        prn: user.username,
        fullName: user.fullName
      });
    }

    // Merge changes
    if (updateData.personalInfo) portfolio.personalInfo = { ...portfolio.personalInfo, ...updateData.personalInfo };
    if (updateData.academics) portfolio.academics = { ...portfolio.academics, ...updateData.academics };
    if (updateData.projects) portfolio.projects = updateData.projects;
    if (updateData.hackathons) portfolio.hackathons = updateData.hackathons;
    if (updateData.research) portfolio.research = updateData.research;
    if (updateData.internships) portfolio.internships = updateData.internships;
    if (updateData.certificates) portfolio.certificates = updateData.certificates;
    if (updateData.achievements) portfolio.achievements = updateData.achievements;

    // Re-calculate scores
    calculateMetrics(portfolio);

    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/portfolio/students
// @desc    Get all students' portfolios (rankings table)
// @access  Private
router.get("/students", auth, async (req, res) => {
  try {
    // Return sorted portfolios by score descending
    const portfolios = await Portfolio.find().sort({ innovationScore: -1 });
    res.json(portfolios);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/portfolio/verify-item
// @desc    Approve/Reject achievement item
// @access  Private
router.post("/verify-item", auth, async (req, res) => {
  const { studentId, itemType, itemId, status } = req.body; // status: Approved or Rejected

  try {
    const portfolio = await Portfolio.findOne({ studentId });
    if (!portfolio) return res.status(404).json({ msg: "Portfolio not found" });

    // Locate the array of achievement items based on itemType
    if (portfolio[itemType]) {
      const item = portfolio[itemType].id(itemId);
      if (item) {
        item.verificationStatus = status;
        
        // Recalculate metrics based on new validation status
        calculateMetrics(portfolio);
        await portfolio.save();
        return res.json({ msg: `Item successfully marked as ${status}`, portfolio });
      }
    }

    res.status(404).json({ msg: "Item not found" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
