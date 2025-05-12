-- Use the database
CREATE DATABASE IF NOT EXISTS event_booking_db;
USE event_booking_db;

-- USERS TABLE (with login + security enhancements)
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Hashed password
  phone VARCHAR(15),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  failed_login_attempts INT DEFAULT 0,
  lockout_time DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REFRESH TOKENS TABLE (if using JWT auth)
CREATE TABLE refresh_tokens (
  token_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- CATEGORIES TABLE
CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

-- EVENTS TABLE
CREATE TABLE events (
  event_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(100),
  date DATE NOT NULL,
  time TIME NOT NULL,
  category_id INT,
  total_seats INT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_by INT,
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- SEATS TABLE
CREATE TABLE seats (
  seat_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (event_id) REFERENCES events(event_id),
  UNIQUE (event_id, seat_number)
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (event_id) REFERENCES events(event_id)
);

-- BOOKED SEATS TABLE
CREATE TABLE booked_seats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  seat_id INT NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  FOREIGN KEY (seat_id) REFERENCES seats(seat_id),
  UNIQUE (booking_id, seat_id)
);

-- PAYMENTS TABLE
CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  payment_method ENUM('stripe', 'razorpay', 'cod') NOT NULL,
  payment_status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_id VARCHAR(100),
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  UNIQUE (transaction_id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_events_category_id ON events(category_id);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_seats_event_id ON seats(event_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_booked_seats_booking_id ON booked_seats(booking_id);
CREATE INDEX idx_booked_seats_seat_id ON booked_seats(seat_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
