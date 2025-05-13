-- Database setup
DROP DATABASE IF EXISTS event_booking_db;
CREATE DATABASE event_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE event_booking_db;

-- Users table with enhanced security
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed',
  phone VARCHAR(15),
  role ENUM('user', 'organizer', 'admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  failed_login_attempts INT DEFAULT 0,
  lockout_time DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- Refresh tokens for JWT rotation
CREATE TABLE refresh_tokens (
  token_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  refresh_token VARCHAR(255) NOT NULL,
  device_info TEXT,
  ip_address VARCHAR(45),
  expiry DATETIME NOT NULL,
  is_blacklisted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_token (refresh_token(64))
) ENGINE=InnoDB;

-- Event categories
CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Events with organizer relationship
CREATE TABLE events (
  event_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  short_description VARCHAR(255),
  location VARCHAR(100) NOT NULL,
  venue_details TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  end_date DATE,
  end_time TIME,
  category_id INT,
  total_seats INT NOT NULL CHECK (total_seats > 0),
  available_seats INT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_by INT NOT NULL,
  image_url VARCHAR(255),
  is_cancelled BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_events_date (date),
  INDEX idx_events_category (category_id),
  INDEX idx_events_organizer (created_by),
  FULLTEXT INDEX ft_events_search (title, description, location)
) ENGINE=InnoDB;

-- Seats with booking status
CREATE TABLE seats (
  seat_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  seat_type ENUM('regular', 'vip', 'premium') DEFAULT 'regular',
  price_multiplier DECIMAL(3,2) DEFAULT 1.00,
  is_booked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  UNIQUE KEY uk_seat_event (event_id, seat_number),
  INDEX idx_seats_event (event_id),
  INDEX idx_seats_booked (is_booked)
) ENGINE=InnoDB;

-- Bookings with status tracking
CREATE TABLE bookings (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'confirmed', 'cancelled', 'refunded') DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  cancellation_date TIMESTAMP NULL,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  INDEX idx_bookings_user (user_id),
  INDEX idx_bookings_event (event_id),
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_date (booking_date)
) ENGINE=InnoDB;

-- Booked seats junction table
CREATE TABLE booked_seats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  seat_id INT NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(seat_id) ON DELETE CASCADE,
  UNIQUE KEY uk_booking_seat (booking_id, seat_id),
  INDEX idx_bookedseats_booking (booking_id),
  INDEX idx_bookedseats_seat (seat_id)
) ENGINE=InnoDB;

-- Payments with transaction tracking
CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method ENUM('stripe', 'razorpay', 'paypal', 'bank_transfer') NOT NULL,
  payment_status ENUM('created', 'authorized', 'captured', 'failed', 'refunded') DEFAULT 'created',
  payment_date TIMESTAMP NULL,
  transaction_id VARCHAR(100),
  receipt_url VARCHAR(255),
  refund_id VARCHAR(100),
  metadata JSON,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  UNIQUE KEY uk_payment_transaction (transaction_id),
  INDEX idx_payments_booking (booking_id),
  INDEX idx_payments_status (payment_status),
  INDEX idx_payments_transaction (transaction_id)
) ENGINE=InnoDB;

-- Event images gallery
CREATE TABLE event_images (
  image_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  INDEX idx_eventimages_event (event_id)
) ENGINE=InnoDB;

-- Triggers for seat management
DELIMITER //
CREATE TRIGGER after_seat_booking
AFTER INSERT ON booked_seats
FOR EACH ROW
BEGIN
  UPDATE seats SET is_booked = TRUE WHERE seat_id = NEW.seat_id;
  UPDATE events 
  SET available_seats = available_seats - 1 
  WHERE event_id = (SELECT event_id FROM seats WHERE seat_id = NEW.seat_id);
END//

CREATE TRIGGER after_seat_cancellation
AFTER DELETE ON booked_seats
FOR EACH ROW
BEGIN
  UPDATE seats SET is_booked = FALSE WHERE seat_id = OLD.seat_id;
  UPDATE events 
  SET available_seats = available_seats + 1 
  WHERE event_id = (SELECT event_id FROM seats WHERE seat_id = OLD.seat_id);
END//
DELIMITER ;