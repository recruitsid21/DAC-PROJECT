const db = require("../config/db");
const bcrypt = require("bcryptjs");

const createUser = async (name, email, password, role = "user") => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role]
  );

  return result.insertId;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
};

const updateUser = async (id, updates) => {
  // Implementation for updating user details
};

module.exports = {
  createUser,
  findUserByEmail,
  updateUser,
};
