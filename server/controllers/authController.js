const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../config/db");
const { roles } = require("../middlewares/authMiddleware");

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = crypto.randomBytes(40).toString("hex");

  return { accessToken, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role = "user" } = req.body;

    // Validate role
    if (role && !Object.values(roles).includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Check if user exists
    const [existingUser] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await db.query(
      `INSERT INTO users 
       (name, email, password, phone, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, role]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(result.insertId);

    // Store refresh token
    await db.query(
      `INSERT INTO refresh_tokens 
       (user_id, refresh_token, expiry) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [result.insertId, refreshToken]
    );

    // Set secure httpOnly cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      userId: result.insertId,
      accessToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await db.query(
      `SELECT user_id, name, email, password, role, is_active, 
       failed_login_attempts, lockout_time 
       FROM users WHERE email = ?`,
      [email]
    );

    const user = users[0];

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.lockout_time && new Date(user.lockout_time) > new Date()) {
      return res.status(403).json({
        message: "Account temporarily locked due to too many failed attempts",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Increment failed attempts
      await db.query(
        `UPDATE users 
         SET failed_login_attempts = failed_login_attempts + 1,
             lockout_time = IF(failed_login_attempts >= 5, 
                              DATE_ADD(NOW(), INTERVAL 30 MINUTE), 
                              NULL)
         WHERE user_id = ?`,
        [user.user_id]
      );

      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // Reset failed attempts on successful login
    await db.query(
      `UPDATE users 
       SET failed_login_attempts = 0, 
           lockout_time = NULL,
           last_login = NOW()
       WHERE user_id = ?`,
      [user.user_id]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.user_id);

    // Store refresh token
    await db.query(
      `INSERT INTO refresh_tokens 
       (user_id, refresh_token, expiry) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user.user_id, refreshToken]
    );

    // Set secure httpOnly cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      userId: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires refresh token)
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    // Verify refresh token
    const [tokens] = await db.query(
      `SELECT user_id, expiry, is_blacklisted 
       FROM refresh_tokens 
       WHERE refresh_token = ?`,
      [refreshToken]
    );

    const tokenData = tokens[0];

    if (
      !tokenData ||
      tokenData.is_blacklisted ||
      new Date(tokenData.expiry) < new Date()
    ) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: tokenData.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      accessToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Blacklist refresh token
      await db.query(
        `UPDATE refresh_tokens 
         SET is_blacklisted = TRUE 
         WHERE refresh_token = ?`,
        [refreshToken]
      );

      // Clear cookie
      res.clearCookie("refreshToken");
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const [users] = await db.query(
      `SELECT user_id, name, email, phone, role, created_at 
       FROM users 
       WHERE user_id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - initiate reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const [users] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "If this email exists, a reset link has been sent" });
    }

    // Create reset token (in a real app, send email with this token)
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await db.query(
      `UPDATE users 
       SET reset_token = ?, 
           reset_token_expiry = ?
       WHERE user_id = ?`,
      [resetToken, new Date(resetTokenExpiry), users[0].user_id]
    );

    // In production, send email with reset link
    // sendResetEmail(email, resetToken);

    res.json({
      message: "If this email exists, a reset link has been sent",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by reset token
    const [users] = await db.query(
      `SELECT user_id, reset_token_expiry 
       FROM users 
       WHERE reset_token = ?`,
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = users[0];

    // Check if token is expired
    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ message: "Token has expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await db.query(
      `UPDATE users 
       SET password = ?, 
           reset_token = NULL, 
           reset_token_expiry = NULL,
           failed_login_attempts = 0,
           lockout_time = NULL
       WHERE user_id = ?`,
      [hashedPassword, user.user_id]
    );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
