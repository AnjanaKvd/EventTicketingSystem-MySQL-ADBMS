-- Creates the Users table to store all system actors
-- This table has no foreign keys and can be created first.
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Role ENUM('Admin', 'EventManager', 'Customer') NOT NULL DEFAULT 'Customer',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Creates the Venues table to store event locations
-- This table also has no foreign keys.
CREATE TABLE Venues (
    VenueID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Address VARCHAR(255),
    City VARCHAR(100),
    TotalCapacity INT NOT NULL
) ENGINE=InnoDB;

-- Creates the Events table, linking Users (as EventManagers) and Venues
-- This table depends on Users and Venues.
CREATE TABLE Events (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    VenueID INT NOT NULL,
    EventManagerID INT, -- Can be NULL if the event manager's account is deleted
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    EventStartTime DATETIME NOT NULL,
    EventEndTime DATETIME NOT NULL,
    TotalTickets INT NOT NULL,
    AvailableTickets INT NOT NULL,
    
    -- Foreign key to Venues. An event cannot exist without a venue.
    FOREIGN KEY (VenueID) REFERENCES Venues(VenueID) 
        ON DELETE RESTRICT, -- Prevents deleting a venue that has events
    
    -- Foreign key to Users. An event is managed by a user.
    FOREIGN KEY (EventManagerID) REFERENCES Users(UserID) 
        ON DELETE SET NULL -- If manager is deleted, set their ID to NULL
) ENGINE=InnoDB;

-- Creates TicketTypes, defining price tiers for each event
-- This table depends on Events.
CREATE TABLE TicketTypes (
    TicketTypeID INT AUTO_INCREMENT PRIMARY KEY,
    EventID INT NOT NULL,
    TypeName VARCHAR(100) NOT NULL, -- e.g., 'VIP', 'General Admission'
    Price DECIMAL(10, 2) NOT NULL,
    Quantity INT NOT NULL, -- Total quantity available for this type
    
    -- Foreign key to Events. Ticket types are deleted if the parent event is.
    FOREIGN KEY (EventID) REFERENCES Events(EventID) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Creates the Bookings table, representing a single customer transaction
-- This table depends on Users (as Customers).
CREATE TABLE Bookings (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    BookingTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    Status ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    
    -- Foreign key to Users. A booking is made by a customer.
    FOREIGN KEY (CustomerID) REFERENCES Users(UserID) 
        ON DELETE RESTRICT -- Prevents deleting a customer with booking history
) ENGINE=InnoDB;

-- Creates the BookingDetails junction table
-- This links a Booking to the specific TicketTypes that were bought.
-- This table depends on Bookings and TicketTypes.
CREATE TABLE BookingDetails (
    BookingDetailID INT AUTO_INCREMENT PRIMARY KEY,
    BookingID INT NOT NULL,
    TicketTypeID INT NOT NULL,
    Quantity INT NOT NULL,
    PricePerTicket DECIMAL(10, 2) NOT NULL, -- Price at the time of purchase
    
    -- Foreign key to Bookings. Details are deleted if the parent booking is.
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID) 
        ON DELETE CASCADE,
        
    -- Foreign key to TicketTypes.
    FOREIGN KEY (TicketTypeID) REFERENCES TicketTypes(TicketTypeID) 
        ON DELETE RESTRICT -- Prevents deleting a ticket type that has been sold
) ENGINE=InnoDB;