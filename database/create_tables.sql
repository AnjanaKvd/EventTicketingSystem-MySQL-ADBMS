
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Role ENUM('Admin', 'EventManager', 'Customer') NOT NULL DEFAULT 'Customer',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE Venues (
    VenueID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Address VARCHAR(255),
    City VARCHAR(100),
    TotalCapacity INT NOT NULL
) ENGINE=InnoDB;


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

    FOREIGN KEY (VenueID) REFERENCES Venues(VenueID) 
        ON DELETE RESTRICT, 
    

    FOREIGN KEY (EventManagerID) REFERENCES Users(UserID) 
        ON DELETE SET NULL 
) ENGINE=InnoDB;


CREATE TABLE TicketTypes (
    TicketTypeID INT AUTO_INCREMENT PRIMARY KEY,
    EventID INT NOT NULL,
    TypeName VARCHAR(100) NOT NULL, 
    Price DECIMAL(10, 2) NOT NULL,
    Quantity INT NOT NULL, 
    
    FOREIGN KEY (EventID) REFERENCES Events(EventID) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Bookings (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    BookingTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    Status ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    
    FOREIGN KEY (CustomerID) REFERENCES Users(UserID) 
        ON DELETE RESTRICT
) ENGINE=InnoDB;


CREATE TABLE BookingDetails (
    BookingDetailID INT AUTO_INCREMENT PRIMARY KEY,
    BookingID INT NOT NULL,
    TicketTypeID INT NOT NULL,
    Quantity INT NOT NULL,
    PricePerTicket DECIMAL(10, 2) NOT NULL,
    
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID) 
        ON DELETE CASCADE,
        
    FOREIGN KEY (TicketTypeID) REFERENCES TicketTypes(TicketTypeID) 
        ON DELETE RESTRICT
) ENGINE=InnoDB;