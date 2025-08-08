const User = require("../models/userModel");
const { JWT_SECRET } = process.env;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const AppError = require("../utils/appError");

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return next(new AppError("Email already in use", 400));
      }

      // Create new user
      const userId = await User.create({ name, email, password, phone });

      // Get the user data
      const user = await User.findById(userId);

      // Generate tokens
      const { token, refreshToken } = await User.generateAuthToken(user);

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Remove password from response
      delete user.password;

      res.status(201).json({
        status: "success",
        data: {
          user,
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1) Check if email and password exist
      if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
      }

      // 2) Check if user exists and password is correct
      const user = await User.findByEmail(email);
      console.log("User data from database:", {
        ...user,
        password: "[REDACTED]",
      });

      // Block login for deactivated users
      if (user && user.is_active === false) {
        return next(
          new AppError(
            "Your account is deactivated. Please contact support.",
            403
          )
        );
      }

      if (!user || !(await User.comparePassword(password, user.password))) {
        // Increment failed login attempts
        await User.incrementFailedLoginAttempts(email);

        // Check if account should be locked
        const updatedUser = await User.findByEmail(email);
        if (updatedUser && updatedUser.failed_login_attempts >= 5) {
          await User.lockAccount(email);
          return next(
            new AppError(
              "Account locked due to too many failed attempts. Try again later.",
              401
            )
          );
        }

        return next(new AppError("Incorrect email or password", 401));
      }

      // 3) Check if account is locked
      if (user.lockout_time && new Date(user.lockout_time) > new Date()) {
        return next(
          new AppError("Account is temporarily locked. Try again later.", 401)
        );
      }

      // 4) If everything ok, reset failed attempts and send token
      await User.resetFailedLoginAttempts(email);

      const { token, refreshToken } = await User.generateAuthToken(user);

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Remove sensitive data from response
      const userData = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      console.log("Sending user data to client:", userData);

      res.status(200).json({
        status: "success",
        data: {
          user: userData,
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        // Invalidate the refresh token
        await User.invalidateRefreshToken(refreshToken);
      }

      // Clear the cookie
      res.clearCookie("refreshToken");

      res.status(200).json({
        status: "success",
        message: "Logged out successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return next(new AppError("No refresh token provided", 401));
      }

      // Verify the refresh token
      const decoded = await User.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return next(new AppError("Invalid or expired refresh token", 401));
      }

      // Get the user
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      // Block refresh for deactivated users
      if (user.is_active === false) {
        return next(
          new AppError(
            "Your account is deactivated. Please contact support.",
            403
          )
        );
      }

      // Generate new access token
      const token = jwt.sign(
        { id: user.user_id, role: user.role },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
      );

      res.status(200).json({
        status: "success",
        data: {
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await User.findById(req.user.user_id);

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      // Remove password from response
      delete user.password;

      res.status(200).json({
        status: "success",
        data: {
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateMe(req, res, next) {
    try {
      const { name, phone } = req.body;

      // Filter out fields that shouldn't be updated
      const filteredBody = { name, phone };

      // Update user
      await User.update(req.user.id, filteredBody);

      // Get updated user
      const updatedUser = await User.findById(req.user.id);

      // Remove password from response
      delete updatedUser.password;

      res.status(200).json({
        status: "success",
        data: {
          user: updatedUser,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      // 1) Get user from collection
      const user = await User.findById(req.user.id);

      // 2) Check if current password is correct
      if (!(await User.comparePassword(currentPassword, user.password))) {
        return next(new AppError("Your current password is wrong", 401));
      }

      // 3) Update password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await User.update(req.user.id, { password: hashedPassword });

      // 4) Log user in, send JWT
      const { token, refreshToken } = await User.generateAuthToken(user);

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: "success",
        data: {
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      console.log("Forgot password request received:", req.body);
      const { email } = req.body;

      // 1) Get user based on email
      const user = await User.findByEmail(email);
      console.log("User found:", user ? "Yes" : "No");

      if (!user) {
        return next(
          new AppError("There is no user with this email address", 404)
        );
      }

      // 2) Generate random reset token
      const resetToken = await User.createPasswordResetToken();
      console.log("Reset token generated:", resetToken ? "Yes" : "No");
      await User.savePasswordResetToken(user.user_id, resetToken);
      console.log("Reset token saved to database");

      // 3) Send it to user's email
      const resetURL = `${req.protocol}://localhost:5173/reset-password/${resetToken}`;

      try {
        // For development, just log the reset URL instead of sending email
        console.log("Password reset URL:", resetURL);

        // Uncomment the line below when email is properly configured
        // await require("../utils/email").sendPasswordResetEmail(user, resetURL);

        res.status(200).json({
          status: "success",
          message: "Password reset token sent to email",
          // For development, include the reset URL in response
          resetURL: resetURL,
        });
      } catch (err) {
        console.error("Email sending error:", err);
        await User.savePasswordResetToken(user.user_id, null);
        return next(
          new AppError(
            "There was an error sending the email. Try again later!",
            500
          )
        );
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      next(err);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      // 1) Get user based on the token
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await User.findByPasswordResetToken(hashedToken);

      // 2) If token has not expired, and there is user, set the new password
      if (!user) {
        return next(new AppError("Token is invalid or has expired", 400));
      }

      // 3) Update changedPasswordAt property for the user
      const { newPassword } = req.body;
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await User.updatePassword(user.user_id, hashedPassword);

      // 4) Log the user in, send JWT
      const { token, refreshToken } = await User.generateAuthToken(user);

      // Set refresh token as HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: "success",
        data: {
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Separate method for sending email (for later use)
  static async sendResetEmail(req, res, next) {
    try {
      const { email } = req.body;

      // 1) Get user based on email
      const user = await User.findByEmail(email);
      if (!user) {
        return next(
          new AppError("There is no user with this email address", 404)
        );
      }

      // 2) Generate random reset token
      const resetToken = await User.createPasswordResetToken();
      await User.savePasswordResetToken(user.user_id, resetToken);

      // 3) Send it to user's email
      const resetURL = `${req.protocol}://localhost:5173/reset-password/${resetToken}`;

      try {
        await require("../utils/email").sendPasswordResetEmail(user, resetURL);
        res.status(200).json({
          status: "success",
          message: "Password reset email sent successfully",
        });
      } catch (err) {
        console.error("Email sending error:", err);
        await User.savePasswordResetToken(user.user_id, null);
        return next(
          new AppError(
            "There was an error sending the email. Try again later!",
            500
          )
        );
      }
    } catch (err) {
      console.error("Send reset email error:", err);
      next(err);
    }
  }
}

module.exports = AuthController;
