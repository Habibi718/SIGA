const mongoose = require("mongoose");
const User = require("./models/User");
const Portfolio = require("./models/Portfolio");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/siga_db";

const usersData = [
  { username: "hod", password: "hodpassword", role: "hod", fullName: "Dr. Anil Sharma", department: "AI & ML" },
  { username: "faculty", password: "facultypassword", role: "faculty", fullName: "Prof. Sunita Deshmukh", department: "AI & ML" },
  { username: "241001", password: "studentpassword", role: "student", fullName: "Rahul Patil", department: "AI & ML", semester: "Sem 4" },
  { username: "241002", password: "studentpassword", role: "student", fullName: "Priya Nair", department: "AI & ML", semester: "Sem 4" },
  { username: "241003", password: "studentpassword", role: "student", fullName: "Amit Desai", department: "AI & ML", semester: "Sem 4" },
  { username: "241004", password: "studentpassword", role: "student", fullName: "Sneha Joshi", department: "AI & ML", semester: "Sem 4" },
  { username: "241005", password: "studentpassword", role: "student", fullName: "Rohan Kulkarni", department: "AI & ML", semester: "Sem 4" }
];

const portfoliosData = [
  {
    prn: "241001",
    fullName: "Rahul Patil",
    personalInfo: {
      email: "rahul.patil@jspm.edu.in",
      phone: "+91 9876543210",
      division: "AI & ML - Div A",
      dob: new Date("2004-05-15"),
      gender: "Male",
      linkedIn: "linkedin.com/in/rahulpatil",
      gitHub: "github.com/rahulpatil",
      portfolioWebsite: "rahulpatil.dev"
    },
    academics: {
      sgpa: 9.1,
      cgpa: 8.8,
      attendance: 88,
      backlogs: 0,
      creditsEarned: 96,
      creditsRemaining: 44,
      year: "Third Year",
      semester: "Sem 4"
    },
    projects: [
      { title: "AI Face Recognition System", techStack: "Python, OpenCV, TensorFlow", description: "Real-time face detection and matching with 98% accuracy.", githubLink: "github.com/rahul/face-rec", liveUrl: "face-rec.demo" },
      { title: "IoT Smart Dustbin", techStack: "Arduino, Firebase, C++", description: "Automatically detects waste level and notifies municipal server.", githubLink: "github.com/rahul/smart-bin", liveUrl: "" }
    ],
    hackathons: [
      { name: "Smart India Hackathon 2025", role: "Team Leader", achievement: "First Runner-up", projectTitle: "Disaster Alert System" }
    ],
    research: [
      { title: "Deep Learning in Smart Agriculture", journal: "IEEE Access", status: "Published", link: "doi.org/10.1109/agriculture" }
    ],
    internships: [
      { company: "TCS Research", role: "ML Intern", duration: "2 Months", description: "Worked on time-series anomaly detection algorithms." }
    ],
    certificates: [
      { title: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", credentialId: "AWS-CCP-1234", credentialUrl: "aws.verify/1234" },
      { title: "TensorFlow Developer Certificate", issuer: "Google", credentialId: "TF-GOOG-8890", credentialUrl: "google.verify/tf" }
    ],
    innovationScore: 92,
    radarMetrics: { research: 74, technical: 85, entrepreneurship: 67, leadership: 79, collaboration: 91, creativity: 82 },
    semesterScores: { s1: 38, s2: 52, s3: 64, s4: 82, s5: 89, s6: 96 }
  },
  {
    prn: "241002",
    fullName: "Priya Nair",
    personalInfo: { email: "priya.nair@jspm.edu.in", division: "AI & ML - Div A" },
    academics: { sgpa: 9.4, cgpa: 9.2, attendance: 92, backlogs: 0, creditsEarned: 96, creditsRemaining: 44, year: "Third Year", semester: "Sem 4" },
    projects: [
      { title: "E-Commerce Recommendation Engine", techStack: "Python, Pandas, FastAPI", description: "Graph database recommendation backend scaling up to 10k items.", githubLink: "github.com/priya/rec-engine" }
    ],
    hackathons: [
      { name: "National Level Hackfest 2025", role: "ML Engineer", achievement: "Winner", projectTitle: "Medical Imaging Diagnostic Tool" }
    ],
    research: [
      { title: "Saliency Mapping in Brain MRI", journal: "Springer BioMed", status: "Published", link: "doi.org/10.1007/brain-mri" }
    ],
    internships: [],
    certificates: [
      { title: "Google Professional Data Engineer", issuer: "Google Cloud", credentialId: "GCP-PDE-990" }
    ],
    innovationScore: 91,
    radarMetrics: { research: 82, technical: 92, entrepreneurship: 55, leadership: 85, collaboration: 88, creativity: 80 },
    semesterScores: { s1: 45, s2: 60, s3: 75, s4: 88, s5: 92, s6: 95 }
  },
  {
    prn: "241003",
    fullName: "Amit Desai",
    personalInfo: { email: "amit.desai@jspm.edu.in", division: "AI & ML - Div B" },
    academics: { sgpa: 8.6, cgpa: 8.5, attendance: 82, backlogs: 0, creditsEarned: 96, creditsRemaining: 44, year: "Third Year", semester: "Sem 4" },
    projects: [
      { title: "Autonomous Indoor Robot Navigation", techStack: "ROS, Python, LiDAR", description: "SLAM based localization and mapping package for low-cost bots." }
    ],
    hackathons: [],
    research: [],
    internships: [],
    certificates: [],
    innovationScore: 89,
    radarMetrics: { research: 40, technical: 88, entrepreneurship: 60, leadership: 75, collaboration: 88, creativity: 70 },
    semesterScores: { s1: 30, s2: 40, s3: 65, s4: 80, s5: 85, s6: 90 }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("📥 Connected to DB for seeding...");

    // Clear collections
    await User.deleteMany({});
    await Portfolio.deleteMany({});
    console.log("🧹 Existing database items cleared");

    // Save users (runs Mongoose pre-save password hash)
    const savedUsers = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      savedUsers.push(user);
      console.log(`👤 User created: ${u.username} (${u.role})`);
    }

    // Create Portfolios for seeded student users
    for (const p of portfoliosData) {
      const associatedUser = savedUsers.find(u => u.username === p.prn);
      if (associatedUser) {
        const portfolio = new Portfolio({
          ...p,
          studentId: associatedUser.id
        });
        await portfolio.save();
        console.log(`💼 Portfolio created for student: ${p.fullName}`);
      }
    }

    console.log("✅ Database seeding completed successfully!");
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
