CREATE INDEX idx_events_starttime ON Events(EventStartTime);

-- Not strictly needed since we made it UNIQUE, but good practice
CREATE INDEX idx_users_email ON Users(Email);

CREATE INDEX idx_bookings_customerid ON Bookings(CustomerID);

