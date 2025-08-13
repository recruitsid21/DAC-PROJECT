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
INSERT INTO events (title, description, short_description, date, time, end_date, end_time, location, venue_details, capacity, total_seats, available_seats, price, category_id, organizer_id, is_active, image_url)
VALUES
-- Music Concerts
('Rock Music Fest', 'An electrifying rock concert', 'Rock concert with popular bands', '2025-10-23', '08:15:30', '2025-10-23', '11:15:30', 'Mumbai Arena', 'Gate 3, Sector 5', 100, 100, 100, 500.00, 1, 2, TRUE, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500'),
('Techno Beats Night', 'Dance the night away with techno vibes', 'Techno music with top DJs', '2025-11-01', '08:15:30', '2025-11-01', '11:15:30', 'Bangalore Club', 'Hall A, 2nd Floor', 80, 80, 80, 600.00, 1, 2, TRUE, 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=500'),
('Jazz & Blues Evening', 'Smooth jazz and blues session', 'Evening of live jazz music', '2025-09-19', '08:15:30', '2025-09-19', '11:15:30', 'Kolkata Auditorium', 'Main Hall', 50, 50, 50, 450.00, 1, 3, TRUE, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=500'),
('Hip Hop Live', 'Live hip hop performances', 'Hip hop concert', '2025-09-26', '08:15:30', '2025-09-26', '11:15:30', 'Delhi Grounds', 'Open Stage Area', 90, 90, 90, 700.00, 1, 3, TRUE, 'https://images.unsplash.com/photo-1440660405495-b26acc5309a2?q=80&w=2070&auto=format&fit=crop&w=500'),
('Indie Vibes Festival', 'Celebrate Indie music', 'Indie bands and artists', '2025-10-06', '08:15:30', '2025-10-06', '11:15:30', 'Hyderabad Arena', 'South Wing', 100, 100, 100, 400.00, 1, 2, TRUE, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500'),

-- Sports Events
('National Football Championship', 'Top teams compete for the national title', 'Exciting football finale', '2025-09-12', '18:00:00', '2025-09-12', '21:00:00', 'Delhi Stadium', 'Main Field', 120, 120, 120, 750.00, 2, 2, TRUE, 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500'),
('Marathon Challenge 2025', 'City-wide marathon for all age groups', 'Run for a cause', '2025-10-05', '06:00:00', '2025-10-05', '12:00:00', 'Mumbai Central', 'Start Line: Marine Drive', 300, 300, 300, 200.00, 2, 3, TRUE, 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=500'),

-- Theater & Arts
('Shakespeare in the Park', 'Open-air performance of classic Shakespeare plays', 'Drama under the stars', '2025-09-20', '19:30:00', '2025-09-20', '22:00:00', 'Bangalore Park Theatre', 'Lawn Seating', 80, 80, 80, 350.00, 3, 2, TRUE, 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500'),
('Modern Art Expo', 'Exhibition of contemporary artworks by emerging artists', 'Art gallery event', '2025-11-15', '10:00:00', '2025-11-15', '18:00:00', 'Kolkata Art Hall', 'Exhibit Rooms 1-3', 150, 150, 150, 150.00, 3, 3, TRUE, 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500'),

-- Conferences
('Global Tech Summit 2025', 'Conference on AI, blockchain, and emerging tech trends', 'International tech event', '2025-12-01', '09:00:00', '2025-12-03', '17:00:00', 'Hyderabad Convention Center', 'Hall A & B', 500, 500, 500, 1200.00, 4, 2, TRUE, 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500'),
('Startup Pitch Day', 'Pitch your startup to investors and VCs', 'Entrepreneurship event', '2025-09-28', '10:00:00', '2025-09-28', '16:00:00', 'Delhi Tech Hub', 'Auditorium', 200, 200, 200, 300.00, 4, 3, TRUE, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500'),

-- Workshops
('Photography Masterclass', 'Hands-on workshop on photography techniques', 'Learn from professionals', '2025-08-25', '14:00:00', '2025-08-25', '18:00:00', 'Pune Studio', 'Studio 1', 40, 40, 40, 500.00, 5, 2, TRUE, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=500'),
('Culinary Skills Workshop', 'Cooking class with top chefs', 'Master the art of cooking', '2025-09-18', '11:00:00', '2025-09-18', '15:00:00', 'Chennai Culinary School', 'Kitchen Lab', 30, 30, 30, 450.00, 5, 3, TRUE, 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=500');

-- Insert seats for all events
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 1, CONCAT('A', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 100) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 2, CONCAT('B', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 80) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 3, CONCAT('C', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 50) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 4, CONCAT('D', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 90) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 5, CONCAT('E', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 100) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 6, CONCAT('F', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 120) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 7, CONCAT('G', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 300) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 8, CONCAT('H', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 80) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 9, CONCAT('I', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 150) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 10, CONCAT('J', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 500) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 11, CONCAT('K', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 200) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 12, CONCAT('L', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 40) AS seatgen;
INSERT INTO seats (event_id, seat_number, is_booked) SELECT 13, CONCAT('M', LPAD(n, 3, '0')), FALSE FROM (SELECT ROW_NUMBER() OVER () AS n FROM information_schema.tables LIMIT 30) AS seatgen;

-- Insert event images
INSERT INTO event_images (event_id, image_url, is_primary, display_order) VALUES
-- Rock Music Fest
(1, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500', TRUE, 1),
(1, 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=500', FALSE, 2),

-- Techno Beats Night
(2, 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=500', TRUE, 1),
(2, 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=500', FALSE, 2),

-- Jazz & Blues Evening
(3, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=500', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=500', FALSE, 2),

-- Hip Hop Live
(4, 'https://images.unsplash.com/photo-1440660405495-b26acc5309a2?q=80&w=2070&auto=format&fit=crop&w=500', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=500', FALSE, 2),

-- Indie Vibes Festival
(5, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500', TRUE, 1),
(5, 'https://images.unsplash.com/photo-1515165562835-cb274f35b7b1?auto=format&fit=crop&w=500', FALSE, 2),

-- Sports Events
(6, 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500', TRUE, 1),
(6, 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=500', FALSE, 2),
(7, 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=500', TRUE, 1),
(7, 'https://images.unsplash.com/photo-1520975918318-3f722a538afc?w=500', FALSE, 2),

-- Theater & Arts
(8, 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500', TRUE, 1),
(8, 'https://images.unsplash.com/photo-1487139975590-b4f1dce9b035?w=500', FALSE, 2),
(9, 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500', TRUE, 1),
(9, 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=500', FALSE, 2),

-- Conferences
(10, 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500', TRUE, 1),
(10, 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500', FALSE, 2),
(11, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500', TRUE, 1),
(11, 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=500', FALSE, 2),

-- Workshops
(12, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=500', TRUE, 1),
(12, 'https://images.unsplash.com/photo-1502786129293-79981df4e689?w=500', FALSE, 2),
(13, 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=500', TRUE, 1),
(13, 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=500', FALSE, 2);
