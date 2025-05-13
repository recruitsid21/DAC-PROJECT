const jwt = require("jsonwebtoken");

const roles = {
  user: "user",
  organizer: "organizer",
  admin: "admin",
};

// Verify JWT token
const authenticate = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Check for token in cookies
  else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const [users] = await req.db.query(
      "SELECT user_id, role, is_active FROM users WHERE user_id = ?",
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res
        .status(401)
        .json({ message: "User no longer exists or is inactive" });
    }

    // Attach user to request
    req.user = {
      id: users[0].user_id,
      role: users[0].role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Role-based authorization
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden - insufficient permissions" });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  roles,
};
