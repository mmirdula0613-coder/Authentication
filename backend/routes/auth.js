const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");

const router = express.Router();


// =====================================================
// CREATE RANDOM SESSION TOKEN
// =====================================================

const generateSessionToken = () => {
  return crypto.randomBytes(32).toString("hex");
};


// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const authenticateUser = async (req, res, next) => {
  try {

    // Get authentication cookie
    const sessionToken = req.cookies.authToken;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }


    // Find user using session token
    const user = await User.findOne({
      sessionToken: sessionToken
    }).select("-password");


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication"
      });
    }


    // Attach user to request
    req.user = user;

    next();

  } catch (error) {

    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};


// =====================================================
// SIGNUP
// =====================================================

router.post("/signup", async (req, res) => {

  try {

    const { name, email, password } = req.body;


    // Validate fields
    if (!name || !email || !password) {

      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });

    }


    // Validate password
    if (password.length < 6) {

      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters"
      });

    }


    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });


    if (existingUser) {

      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });

    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);


    // Generate session token
    const sessionToken = generateSessionToken();


    // Create user
    const user = await User.create({

      name: name.trim(),

      email: email.toLowerCase().trim(),

      password: hashedPassword,

      sessionToken: sessionToken

    });


    // Create HTTP-only cookie
    res.cookie("authToken", sessionToken, {

      httpOnly: true,

      secure: false,

      sameSite: "lax",

      maxAge: 24 * 60 * 60 * 1000

    });


    return res.status(201).json({

      success: true,

      message: "Account created successfully",

      user: {

        id: user._id,

        name: user.name,

        email: user.email

      }

    });


  } catch (error) {

    console.error("Signup error:", error);

    return res.status(500).json({

      success: false,

      message: "Server error during signup"

    });

  }

});


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;


    if (!email || !password) {

      return res.status(400).json({

        success: false,

        message: "Email and password are required"

      });

    }


    // Find user
    const user = await User.findOne({

      email: email.toLowerCase().trim()

    });


    if (!user) {

      return res.status(401).json({

        success: false,

        message: "Invalid email or password"

      });

    }


    // Check password
    const passwordMatch = await bcrypt.compare(

      password,

      user.password

    );


    if (!passwordMatch) {

      return res.status(401).json({

        success: false,

        message: "Invalid email or password"

      });

    }


    // Generate new session token
    const sessionToken = generateSessionToken();


    // Save session token
    user.sessionToken = sessionToken;

    await user.save();


    // Create HTTP-only cookie
    res.cookie("authToken", sessionToken, {

      httpOnly: true,

      secure: false,

      sameSite: "lax",

      maxAge: 24 * 60 * 60 * 1000

    });


    return res.json({

      success: true,

      message: "Login successful",

      user: {

        id: user._id,

        name: user.name,

        email: user.email

      }

    });


  } catch (error) {

    console.error("Login error:", error);

    return res.status(500).json({

      success: false,

      message: "Server error during login"

    });

  }

});


// =====================================================
// CHECK CURRENT USER
// =====================================================

router.get("/me", authenticateUser, async (req, res) => {

  return res.json({

    success: true,

    user: {

      id: req.user._id,

      name: req.user.name,

      email: req.user.email

    }

  });

});


// =====================================================
// LOGOUT
// =====================================================

router.post("/logout", async (req, res) => {

  try {

    const sessionToken = req.cookies.authToken;


    if (sessionToken) {

      // Remove token from database
      await User.findOneAndUpdate(

        { sessionToken: sessionToken },

        { sessionToken: null }

      );

    }


    // Remove cookie
    res.clearCookie("authToken", {

      httpOnly: true,

      secure: false,

      sameSite: "lax"

    });


    return res.json({

      success: true,

      message: "Logged out successfully"

    });


  } catch (error) {

    console.error("Logout error:", error);

    return res.status(500).json({

      success: false,

      message: "Logout failed"

    });

  }

});


module.exports = router;