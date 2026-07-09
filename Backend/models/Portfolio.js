const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    prn: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    personalInfo: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      division: { type: String, default: "" },
      dob: { type: Date },
      gender: { type: String, default: "" },
      linkedIn: { type: String, default: "" },
      gitHub: { type: String, default: "" },
      portfolioWebsite: { type: String, default: "" },
      profilePhoto: { type: String, default: "" },
    },
    academics: {
      sgpa: { type: Number, default: 0 },
      cgpa: { type: Number, default: 0 },
      attendance: { type: Number, default: 0 },
      backlogs: { type: Number, default: 0 },
      creditsEarned: { type: Number, default: 0 },
      creditsRemaining: { type: Number, default: 0 },
      year: { type: String, default: "" },
      semester: { type: String, default: "" },
    },
    projects: [
      {
        title: { type: String, default: "" },
        techStack: { type: String, default: "" },
        description: { type: String, default: "" },
        githubLink: { type: String, default: "" },
        liveUrl: { type: String, default: "" },
        verificationStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      },
    ],
    hackathons: [
      {
        name: { type: String, default: "" },
        role: { type: String, default: "" },
        achievement: { type: String, default: "" },
        projectTitle: { type: String, default: "" },
        verificationStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      },
    ],
    research: [
      {
        title: { type: String, default: "" },
        journal: { type: String, default: "" },
        status: { type: String, default: "" }, // e.g. Published, Under Review
        link: { type: String, default: "" },
        verificationStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      },
    ],
    internships: [
      {
        company: { type: String, default: "" },
        role: { type: String, default: "" },
        duration: { type: String, default: "" },
        description: { type: String, default: "" },
        verificationStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      },
    ],
    certificates: [
      {
        title: { type: String, default: "" },
        issuer: { type: String, default: "" },
        credentialId: { type: String, default: "" },
        credentialUrl: { type: String, default: "" },
        verificationStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      },
    ],
    achievements: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        date: { type: Date },
        verificationStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      },
    ],
    innovationScore: { type: Number, default: 0 },
    radarMetrics: {
      research: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      entrepreneurship: { type: Number, default: 0 },
      leadership: { type: Number, default: 0 },
      collaboration: { type: Number, default: 0 },
      creativity: { type: Number, default: 0 },
    },
    semesterScores: {
      s1: { type: Number, default: 30 },
      s2: { type: Number, default: 45 },
      s3: { type: Number, default: 60 },
      s4: { type: Number, default: 75 },
      s5: { type: Number, default: 85 },
      s6: { type: Number, default: 90 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", PortfolioSchema);
