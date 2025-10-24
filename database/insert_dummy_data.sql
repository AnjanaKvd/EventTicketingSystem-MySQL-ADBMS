-- 1. Insert Users (Roles: Admin, EventManager, Customer)
-- Note: Passwords should be hashed. Using placeholders.
INSERT INTO Users (Username, PasswordHash, Email, Role)
VALUES
('AdminUser', 'BCRYPT_HASH_PLACEHOLDER_1', 'admin@events.com', 'Admin'),
('EventManager1', 'BCRYPT_HASH_PLACEHOLDER_2', 'manager1@events.com', 'EventManager'),
('CustomerAlice', 'BCRYPT_HASH_PLACEHOLDER_3', 'alice@gmail.com', 'Customer'),
('CustomerBob', 'BCRYPT_HASH_PLACEHOLDER_4', 'bob@yahoo.com', 'Customer');

-- 2. Insert Venues
INSERT INTO Venues (Name, Address, City, TotalCapacity)
VALUES
('Galle Face Green', 'Galle Main Rd', 'Colombo', 10000),
('Nelum Pokuna Theatre', 'Green Path', 'Colombo', 1288),
('Pallakele Stadium', 'Kandy-Mahiyangana Rd', 'Kandy', 35000);

-- 3. Insert Events
-- EventManagerID = 2 (for 'EventManager1')
-- Note: AvailableTickets = TotalTickets on initial insertion.
-- *We will manually adjust this later to simulate bookings*
INSERT INTO Events (VenueID, EventManagerID, Title, Description, EventStartTime, EventEndTime, TotalTickets, AvailableTickets)
VALUES
(1, 2, 'Colombo Music Festival 2025', 'Annual open-air music festival.', '2025-12-15 18:00:00', '2025-12-15 23:59:00', 10000, 10000),
(2, 2, 'The Symphony Orchestra', 'A night with the National Symphony Orchestra.', '2025-11-20 19:00:00', '2025-11-20 21:30:00', 1288, 1288),
(3, 2, 'Lanka Premier League Final', 'The T20 cricket final.', '2025-12-28 19:00:00', '2025-12-28 23:00:00', 35000, 35000);

-- 4. Insert TicketTypes for each Event
-- EventID = 1 (Colombo Music Festival)
INSERT INTO TicketTypes (EventID, TypeName, Price, Quantity)
VALUES
(1, 'General Admission', 50.00, 9000),
(1, 'VIP Pass', 200.00, 1000);

-- EventID = 2 (The