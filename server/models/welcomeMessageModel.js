const db = require("../config/db");

class WelcomeMessage {
  static async create({ userId, message, type = "welcome" }) {
    const [result] = await db.query(
      "INSERT INTO welcome_messages (user_id, message, type, created_at) VALUES (?, ?, ?, NOW())",
      [userId, message, type]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await db.query(
      "SELECT * FROM welcome_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );
    return rows[0];
  }

  static async findAllByUserId(userId) {
    const [rows] = await db.query(
      "SELECT * FROM welcome_messages WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  }

  static async update(id, { message, type }) {
    const [result] = await db.query(
      "UPDATE welcome_messages SET message = ?, type = ? WHERE id = ?",
      [message, type, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query(
      "DELETE FROM welcome_messages WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getDefaultWelcomeMessage() {
    return {
      title: "Welcome to Event Booking System!",
      message:
        "Thank you for joining our platform. Explore amazing events and book your tickets easily.",
      featuredEvents: [],
    };
  }

  static async getWelcomeMessageWithEvents(userId) {
    const [featuredEvents] = await db.query(`
      SELECT 
        e.event_id, 
        e.title, 
        e.description, 
        e.date, 
        e.time, 
        e.price, 
        e.location,
        e.image_url,
        c.name as category_name
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.category_id
      WHERE e.is_active = 1 AND e.date > NOW()
      ORDER BY e.date ASC 
      LIMIT 3
    `);

    const welcomeMessage = await this.getDefaultWelcomeMessage();
    welcomeMessage.featuredEvents = featuredEvents;

    // Store welcome message for user
    await this.create({
      userId,
      message: JSON.stringify(welcomeMessage),
      type: "welcome",
    });

    return welcomeMessage;
  }
}

module.exports = WelcomeMessage;
