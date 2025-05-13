USE event_booking_db;


-- Set higher recursion limit for generating seats
SET SESSION cte_max_recursion_depth = 100000;

-- Insert admin and test users (passwords are bcrypt hashed versions of 'password123')
INSERT INTO users (name, email, password, phone, role) VALUES
('Admin User', 'admin@eventbook.com', '$2a$12$zX7T6Gx7bUvJ/dQ5V1zZ.eq9XJ9nN7k8TjKd6Y5W3bLdK1V2Z3X4Y', '9876543210', 'admin'),
('Event Organizer 1', 'organizer1@eventbook.com', '$2a$12$zX7T6Gx7bUvJ/dQ5V1zZ.eq9XJ9nN7k8TjKd6Y5W3bLdK1V2Z3X4Y', '9876543211', 'organizer'),
('Event Organizer 2', 'organizer2@eventbook.com', '$2a$12$zX7T6Gx7bUvJ/dQ5V1zZ.eq9XJ9nN7k8TjKd6Y5W3bLdK1V2Z3X4Y', '9876543212', 'organizer'),
('Test User 1', 'user1@eventbook.com', '$2a$12$zX7T6Gx7bUvJ/dQ5V1zZ.eq9XJ9nN7k8TjKd6Y5W3bLdK1V2Z3X4Y', '9876543213', 'user'),
('Test User 2', 'user2@eventbook.com', '$2a$12$zX7T6Gx7bUvJ/dQ5V1zZ.eq9XJ9nN7k8TjKd6Y5W3bLdK1V2Z3X4Y', '9876543214', 'user');

-- Insert event categories
INSERT INTO categories (name, description, image_url) VALUES
('Music Concerts', 'Live music performances of all genres', 'https://example.com/images/music.jpg'),
('Sports Events', 'Professional and amateur sports competitions', 'https://example.com/images/sports.jpg'),
('Theater & Arts', 'Plays, musicals, and art exhibitions', 'https://example.com/images/theater.jpg'),
('Conferences', 'Business and technology conferences', 'https://example.com/images/conference.jpg'),
('Workshops', 'Educational and skill-building workshops', 'https://example.com/images/workshop.jpg');

-- Insert sample events
INSERT INTO events (
  title, description, short_description, location, venue_details, 
  date, time, end_date, end_time, category_id, 
  total_seats, available_seats, price, created_by, image_url
) VALUES
('Annual Music Festival', '3-day music festival featuring top artists', 'Weekend music extravaganza', 'Mumbai Grounds', 'Gate 3, Near Parking Lot', 
 '2023-12-15', '18:00:00', '2023-12-17', '23:00:00', 1, 
 5000, 5000, 2500.00, 2, 'https://example.com/images/music-fest.jpg'),

('IPL Cricket Match', 'Mumbai Indians vs Chennai Super Kings', 'T20 Championship match', 'Wankhede Stadium', 'North Stand', 
 '2023-11-20', '15:30:00', '2023-11-20', '23:00:00', 2, 
 35000, 35000, 3500.00, 2, 'https://example.com/images/ipl-match.jpg'),

('Broadway Musical', 'The Lion King musical performance', 'Direct from Broadway', 'Delhi Auditorium', 'Balcony seats available', 
 '2023-12-05', '19:00:00', '2023-12-05', '22:30:00', 3, 
 500, 500, 4500.00, 3, 'https://example.com/images/lion-king.jpg');

-- Generate seats for events with optimized seat_number lengths

-- Music Festival (5000 seats)
INSERT INTO seats (event_id, seat_number, seat_type, price_multiplier)
WITH RECURSIVE seat_numbers AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seat_numbers WHERE n < 5000
)
SELECT 
  1 AS event_id,
  CONCAT(
    CASE 
      WHEN n <= 1000 THEN 'V-'
      WHEN n <= 3000 THEN 'P-'
      ELSE 'G-'
    END, 
    LPAD(n, 4, '0')
  ) AS seat_number,
  CASE 
    WHEN n <= 1000 THEN 'vip'
    WHEN n <= 3000 THEN 'premium'
    ELSE 'regular'
  END AS seat_type,
  CASE 
    WHEN n <= 1000 THEN 2.0
    WHEN n <= 3000 THEN 1.5
    ELSE 1.0
  END AS price_multiplier
FROM seat_numbers;

-- Cricket Match (35000 seats) - using batch insert approach
CREATE TEMPORARY TABLE IF NOT EXISTS temp_seats (
  event_id INT,
  seat_number VARCHAR(10),
  seat_type VARCHAR(10),
  price_multiplier DECIMAL(3,1)
);

-- Insert in batches of 5000 to avoid timeouts
INSERT INTO temp_seats
SELECT 
  2 AS event_id, 
  CONCAT('ST-', LPAD(n, 5, '0')) AS seat_number,
  'regular' AS seat_type,
  1.0 AS price_multiplier
FROM (
  SELECT a.N + b.N*10 + c.N*100 + d.N*1000 + e.N*10000 AS n
  FROM 
    (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
    (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
    (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c,
    (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) d,
    (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) e
  WHERE a.N + b.N*10 + c.N*100 + d.N*1000 + e.N*10000 BETWEEN 1 AND 35000
) numbers;

INSERT INTO seats (event_id, seat_number, seat_type, price_multiplier)
SELECT event_id, seat_number, seat_type, price_multiplier FROM temp_seats;

DROP TEMPORARY TABLE temp_seats;

-- Broadway Musical (500 seats)
INSERT INTO seats (event_id, seat_number, seat_type, price_multiplier)
WITH RECURSIVE seat_numbers AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seat_numbers WHERE n < 500
)
SELECT 
  3 AS event_id,
  CONCAT(
    CASE 
      WHEN n <= 50 THEN 'B-'
      WHEN n <= 200 THEN 'BC-'
      ELSE 'S-'
    END, 
    LPAD(n, 3, '0')
  ) AS seat_number,
  CASE 
    WHEN n <= 50 THEN 'vip'
    WHEN n <= 200 THEN 'premium'
    ELSE 'regular'
  END AS seat_type,
  CASE 
    WHEN n <= 50 THEN 3.0
    WHEN n <= 200 THEN 1.8
    ELSE 1.0
  END AS price_multiplier
FROM seat_numbers;

-- Create sample bookings
INSERT INTO bookings (user_id, event_id, status, total_amount) VALUES
(4, 1, 'confirmed', 5000.00), -- User1 booked 2 VIP seats for music festival
(5, 3, 'confirmed', 9000.00); -- User2 booked 2 Box seats for musical

-- Book seats for these bookings
INSERT INTO booked_seats (booking_id, seat_id, price_paid) VALUES
-- User1's booking (2 VIP seats)
(1, 1, 5000.00), -- V-0001
(1, 2, 5000.00), -- V-0002

-- User2's booking (2 Box seats)
(2, 451, 13500.00), -- B-051 (4500 * 3.0)
(2, 452, 13500.00); -- B-052

-- Create payment records
INSERT INTO payments (
  booking_id, amount, currency, payment_method, 
  payment_status, payment_date, transaction_id, receipt_url
) VALUES
(1, 5000.00, 'INR', 'razorpay', 'captured', NOW(), CONCAT('pay_', UUID()), CONCAT('https://example.com/receipts/', UUID())),
(2, 9000.00, 'INR', 'stripe', 'captured', NOW(), CONCAT('ch_', UUID()), CONCAT('https://example.com/receipts/', UUID()));

-- Update seat and event availability based on bookings
UPDATE seats SET is_booked = TRUE WHERE seat_id IN (1, 2, 451, 452);

-- Update event 1
UPDATE events 
SET available_seats = total_seats - (
  SELECT COUNT(*) FROM booked_seats 
  JOIN seats ON booked_seats.seat_id = seats.seat_id 
  WHERE seats.event_id = 1
)
WHERE event_id = 1;

-- Update event 2
UPDATE events 
SET available_seats = total_seats - (
  SELECT COUNT(*) FROM booked_seats 
  JOIN seats ON booked_seats.seat_id = seats.seat_id 
  WHERE seats.event_id = 2
)
WHERE event_id = 2;

-- Update event 3
UPDATE events 
SET available_seats = total_seats - (
  SELECT COUNT(*) FROM booked_seats 
  JOIN seats ON booked_seats.seat_id = seats.seat_id 
  WHERE seats.event_id = 3
)
WHERE event_id = 3;

-- Insert event images
INSERT INTO event_images (event_id, image_url, is_primary, display_order) VALUES
(1, 'https://example.com/images/music-fest-1.jpg', TRUE, 1),
(1, 'https://example.com/images/music-fest-2.jpg', FALSE, 2),
(2, 'https://example.com/images/ipl-1.jpg', TRUE, 1),
(3, 'https://example.com/images/lion-king-1.jpg', TRUE, 1),
(3, 'https://example.com/images/lion-king-2.jpg', FALSE, 2);