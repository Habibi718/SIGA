const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const auth = require("../middleware/auth");

// Middleware to verify admin role
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Access denied. Admin only." });
  }
};

// Apply auth and adminOnly to all routes in this file
router.use(auth);
router.use(adminOnly);

// @route   GET api/admin/users
// @desc    Get all users in the system
// @access  Private (Admin only)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/admin/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post("/users", async (req, res) => {
  const { username, password, role, fullName, department, semester } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      username,
      password,
      role,
      fullName,
      department,
      semester
    });

    await user.save();
    
    // Note: Portfolio is created dynamically on first student login, 
    // so we do not need to create it here.
    
    res.status(201).json({
      msg: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        department: user.department,
        semester: user.semester
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/admin/users/:id
// @desc    Update a user
// @access  Private (Admin only)
router.put("/users/:id", async (req, res) => {
  const { username, password, role, fullName, department, semester } = req.body;

  try {
    let user = await User.findById(req.id || req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if new username is already taken by someone else
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ msg: "Username is already taken" });
      }
      user.username = username;
    }

    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (department) user.department = department;
    if (semester) user.semester = semester;
    
    if (password) {
      user.password = password; // mongoose pre-save will automatically hash it
    }

    await user.save();

    // If student details changed, sync portfolio full name if it exists
    if (user.role === "student") {
      const portfolio = await Portfolio.findOne({ studentId: user.id });
      if (portfolio) {
        portfolio.fullName = user.fullName;
        portfolio.prn = user.username;
        if (user.semester) {
          portfolio.academics.semester = user.semester;
        }
        await portfolio.save();
      }
    }

    res.json({
      msg: "User updated successfully",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        department: user.department,
        semester: user.semester
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user and cascade delete portfolio if student
// @access  Private (Admin only)
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Don't allow admin to delete themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ msg: "Admin cannot delete their own account" });
    }

    const role = user.role;
    await User.findByIdAndDelete(req.params.id);

    // Cascade delete portfolio if the deleted user is a student
    if (role === "student") {
      await Portfolio.deleteOne({ studentId: req.params.id });
      console.log(`🧹 Cascade deleted portfolio for student: ${user.fullName}`);
    }

    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
