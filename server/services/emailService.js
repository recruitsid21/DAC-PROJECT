const nodemailer = require("nodemailer");
const AppError = require("../utils/appError");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Verify email configuration
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("Email server connection verified");
      return true;
    } catch (error) {
      console.error("Email server connection failed:", error);
      return false;
    }
  }

  // Send email with template
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `"Event Booking System" <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments || [],
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new AppError("Failed to send email", 500);
    }
  }

  // Enhanced welcome email with event recommendations
  async sendEnhancedWelcomeEmail(user, events = []) {
    const eventList = events
      .map(
        (event) => `
      <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        <h4>${event.title}</h4>
        <p>Date: ${event.date}</p>
        <p>Price: ₹${event.price}</p>
        <a href="${process.env.CLIENT_URL}/events/${event.event_id}" style="color: #007bff;">View Event</a>
      </div>
    `
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Welcome to Event Booking System!</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        
        ${
          events.length > 0
            ? `
        <h3>Featured Events for You:</h3>
        ${eventList}
        `
            : ""
        }
        
        <p>Get started by exploring our events or creating your own!</p>
        
        <div style="margin-top: 20px;">
          <a href="${
            process.env.CLIENT_URL
          }/events" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Browse Events</a>
        </div>
        
        <p style="margin-top: 20px; color: #666;">Best regards,<br>Event Booking Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject: "Welcome to Event Booking System!",
      text: `Hi ${user.name}, welcome to Event Booking System!`,
      html,
    });
  }

  // Booking confirmation email
  async sendBookingConfirmation(user, booking, event, seats) {
    const seatsList = seats.map((seat) => `${seat.seat_number}`).join(", ");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Booking Confirmation</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for your booking! Here are your booking details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>${event.title}</h3>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Time:</strong> ${event.time}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Seats:</strong> ${seatsList}</p>
          <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
          <p><strong>Total Amount:</strong> ₹${booking.total_amount}</p>
        </div>
        
        <p>We look forward to seeing you at the event!</p>
        
        <a href="${process.env.CLIENT_URL}/bookings/${booking.booking_id}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Booking</a>
        
        <p style="color: #666;">Best regards,<br>Event Booking Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `Booking Confirmation - ${event.title}`,
      text: `Booking confirmed for ${event.title}`,
      html,
    });
  }

  // Event reminder email
  async sendEventReminder(user, booking, event) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Event Reminder</h2>
        <p>Hi ${user.name},</p>
        <p>This is a reminder for your upcoming event:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>${event.title}</h3>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Time:</strong> ${event.time}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
          <p><strong>Total Amount:</strong> ₹${booking.total_amount}</p>
        </div>
        
        <p>We look forward to seeing you there!</p>
        
        <p style="color: #666;">Best regards,<br>Event Booking Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `Reminder: ${event.title} - ${event.date}`,
      text: `Reminder for ${event.title} on ${event.date}`,
      html,
    });
  }

  // Booking cancellation email
  async sendBookingCancellation(user, booking, event) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Booking Cancellation</h2>
        <p>Hi ${user.name},</p>
        <p>Your booking has been successfully cancelled. Here are the details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>${event.title}</h3>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
          <p><strong>Refund Amount:</strong> ₹${booking.total_amount}</p>
        </div>
        
        <p>Your refund will be processed within 5-7 business days.</p>
        
        <p style="color: #666;">Best regards,<br>Event Booking Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject: `Booking Cancellation - ${event.title}`,
      text: `Booking cancelled for ${event.title}`,
      html,
    });
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>You have requested to reset your password. Click the button below to reset it:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" 
             style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This link will expire in 10 minutes. If you didn't request this, please ignore this email.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetURL}" style="color: #007bff;">${resetURL}</a>
        </p>
        
        <p style="color: #666;">Best regards,<br>Event Booking Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Click this link to reset your password: ${resetURL}`,
      html,
    });
  }

  // Password reset confirmation email
  async sendPasswordResetConfirmation(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Password Reset Successful</h2>
        <p>Hi ${user.name},</p>
        <p>Your password has been successfully reset. You can now log in with your new password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/login" 
             style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Login Now
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          If you didn't make this change, please contact our support team immediately.
        </p>
        
        <p style="color: #666;">Best regards,<br>Event Booking Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      text: "Your password has been successfully reset.",
      html,
    });
  }
}

module.exports = EmailService;
