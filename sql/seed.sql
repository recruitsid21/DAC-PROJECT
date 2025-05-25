USE event_booking_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
TRUNCATE TABLE event_images;
TRUNCATE TABLE payments;
TRUNCATE TABLE booked_seats;
TRUNCATE TABLE seats;
TRUNCATE TABLE bookings;
TRUNCATE TABLE events;
TRUNCATE TABLE categories;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert users with proper bcrypt hashes for password 'password123'
-- Note: All users have the same password for testing purposes
INSERT INTO users (name, email, password, role, is_active) VALUES
('Admin User', 'admin@eventbook.com', '$2b$12$/RywEYZAu0etnlhcv58tk.lGAEJmPzHqsYpLfmuuDo/LLt.YnQEQa', 'admin', true),
('Event Organizer 1', 'organizer1@eventbook.com', '$2b$12$/RywEYZAu0etnlhcv58tk.lGAEJmPzHqsYpLfmuuDo/LLt.YnQEQa', 'organizer', true),
('Event Organizer 2', 'organizer2@eventbook.com', '$2b$12$/RywEYZAu0etnlhcv58tk.lGAEJmPzHqsYpLfmuuDo/LLt.YnQEQa', 'organizer', true),
('Regular User 1', 'user1@eventbook.com', '$2b$12$/RywEYZAu0etnlhcv58tk.lGAEJmPzHqsYpLfmuuDo/LLt.YnQEQa', 'user', true),
('Regular User 2', 'user2@eventbook.com', '$2b$12$/RywEYZAu0etnlhcv58tk.lGAEJmPzHqsYpLfmuuDo/LLt.YnQEQa', 'user', true);

-- Insert event categories
INSERT INTO categories (name, description, image_url, is_active) VALUES
('Music Concerts', 'Live music performances of all genres', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500', TRUE),
('Sports Events', 'Professional and amateur sports competitions', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500', TRUE),
('Theater & Arts', 'Plays, musicals, and art exhibitions', 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=500', TRUE),
('Conferences', 'Business and technology conferences', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500', TRUE),
('Workshops', 'Educational and skill-building workshops', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500', TRUE);

-- Insert events
-- Insert sample events (MAX SEATS: 100)
INSERT INTO events (title, description, short_description, date, time, end_date, end_time, location, venue_details, capacity, total_seats, available_seats, price, category_id, organizer_id, is_active, image_url)
VALUES
('Rock Music Fest', 'An electrifying rock concert', 'Rock concert with popular bands', '2025-06-15', '19:00:00', '2025-06-15', '22:00:00', 'Mumbai Arena', 'Gate 3, Sector 5', 100, 100, 100, 500.00, 1, 2, TRUE, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500'),
('Techno Beats Night', 'Dance the night away with techno vibes', 'Techno music with top DJs', '2025-07-10', '20:00:00', '2025-07-10', '23:30:00', 'Bangalore Club', 'Hall A, 2nd Floor', 80, 80, 80, 600.00, 1, 2, TRUE, 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=500'),
('Jazz & Blues Evening', 'Smooth jazz and blues session', 'Evening of live jazz music', '2025-06-22', '18:00:00', '2025-06-22', '21:00:00', 'Kolkata Auditorium', 'Main Hall', 50, 50, 50, 450.00, 1, 3, TRUE, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=500'),
('Hip Hop Live', 'Live hip hop performances', 'Hip hop concert', '2025-08-05', '19:30:00', '2025-08-05', '22:30:00', 'Delhi Grounds', 'Open Stage Area', 90, 90, 90, 700.00, 1, 3, TRUE, 'https://images.unsplash.com/photo-1440660405495-b26acc5309a2?q=80&w=2070&auto=format&fit=crop&w=500'),
('Indie Vibes Festival', 'Celebrate Indie music', 'Indie bands and artists', '2025-07-25', '17:00:00', '2025-07-25', '21:00:00', 'Hyderabad Arena', 'South Wing', 100, 100, 100, 400.00, 1, 2, TRUE, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500');


-- Insert seats for events
-- Automatically generate seats per event (based on total_seats for each event)

-- Seats for Rock Music Fest (100 seats)
INSERT INTO seats (event_id, seat_number, is_booked)
SELECT 1, CONCAT('A', LPAD(n, 3, '0')), FALSE
FROM (SELECT ROW_NUMBER() OVER () as n FROM information_schema.tables LIMIT 100) AS seatgen;

-- Seats for Techno Beats Night (80 seats)
INSERT INTO seats (event_id, seat_number, is_booked)
SELECT 2, CONCAT('B', LPAD(n, 3, '0')), FALSE
FROM (SELECT ROW_NUMBER() OVER () as n FROM information_schema.tables LIMIT 80) AS seatgen;

-- Seats for Jazz & Blues Evening (50 seats)
INSERT INTO seats (event_id, seat_number, is_booked)
SELECT 3, CONCAT('C', LPAD(n, 3, '0')), FALSE
FROM (SELECT ROW_NUMBER() OVER () as n FROM information_schema.tables LIMIT 50) AS seatgen;

-- Seats for Hip Hop Live (90 seats)
INSERT INTO seats (event_id, seat_number, is_booked)
SELECT 4, CONCAT('D', LPAD(n, 3, '0')), FALSE
FROM (SELECT ROW_NUMBER() OVER () as n FROM information_schema.tables LIMIT 90) AS seatgen;

-- Seats for Indie Vibes Festival (100 seats)
INSERT INTO seats (event_id, seat_number, is_booked)
SELECT 5, CONCAT('E', LPAD(n, 3, '0')), FALSE
FROM (SELECT ROW_NUMBER() OVER () as n FROM information_schema.tables LIMIT 100) AS seatgen;



-- Insert event images with fixed Unsplash URLs
INSERT INTO event_images (event_id, image_url, is_primary, display_order) VALUES
-- Rock Music Fest (event_id = 1)
(1, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500', TRUE, 1),
(1, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=500', FALSE, 2),

-- Techno Beats Night (event_id = 2)
(2, 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=500', TRUE, 1),
(2, 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=500', FALSE, 2),

-- Jazz & Blues Evening (event_id = 3)
(3, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=500', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=500', FALSE, 2),

-- Hip Hop Live (event_id = 4)
(4, 'https://images.unsplash.com/photo-1440660405495-b26acc5309a2?q=80&w=2070&auto=format&fit=crop&w=500', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=500', FALSE, 2),

-- Indie Vibes Festival (event_id = 5)
(5, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500', TRUE, 1),
(5, 'https://images.unsplash.com/photo-1515165562835-cb274f35b7b1?auto=format&fit=crop&w=500', FALSE, 2);






