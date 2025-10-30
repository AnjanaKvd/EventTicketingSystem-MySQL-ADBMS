DELIMITER $$
DROP PROCEDURE IF EXISTS sp_CreateBooking;
CREATE PROCEDURE sp_CreateBooking(
    IN p_CustomerID INT,
    IN p_TicketTypeID INT,
    IN p_Quantity INT,
    OUT p_NewBookingID INT,
    OUT p_Message VARCHAR(255)
)
BEGIN
    DECLARE v_TicketPrice DECIMAL(10, 2);
    DECLARE v_EventStock INT;     
    DECLARE v_TicketTypeStock INT; 
    DECLARE v_TotalAmount DECIMAL(10, 2);
    DECLARE v_BookingID INT;
    DECLARE v_EventID INT;
    DECLARE v_CustomerExists INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_NewBookingID = NULL;
        SET p_Message = 'Error: Booking failed. Transaction rolled back (SQLEXCEPTION).';
    END;

    START TRANSACTION;

    SELECT COUNT(*) INTO v_CustomerExists FROM Users WHERE UserID = p_CustomerID;
    IF v_CustomerExists = 0 THEN
        ROLLBACK;
        SET p_NewBookingID = NULL;
        SET p_Message = 'Error: CustomerID does not exist.';
    ELSE
        SELECT
            e.EventID, e.AvailableTickets, 
            tt.Price, tt.Quantity    
        INTO
            v_EventID, v_EventStock,   
            v_TicketPrice, v_TicketTypeStock 
        FROM Events e
        JOIN TicketTypes tt ON e.EventID = tt.EventID
        WHERE tt.TicketTypeID = p_TicketTypeID
        FOR UPDATE; 

        IF v_EventID IS NULL THEN
            ROLLBACK;
            SET p_NewBookingID = NULL;
            SET p_Message = 'Error: TicketTypeID does not exist.';
        ELSEIF v_EventStock < p_Quantity THEN
            ROLLBACK;
            SET p_NewBookingID = NULL;
            SET p_Message = 'Error: Not enough tickets left for this event (overall).';

        ELSEIF v_TicketTypeStock < p_Quantity THEN
            ROLLBACK;
            SET p_NewBookingID = NULL;
            SET p_Message = CONCAT('Error: Not enough tickets available for this specific type. Only ', v_TicketTypeStock, ' left.');
        ELSE
            SET v_TotalAmount = v_TicketPrice * p_Quantity;

            INSERT INTO Bookings (CustomerID, TotalAmount, Status)
            VALUES (p_CustomerID, v_TotalAmount, 'Confirmed');

            SET v_BookingID = LAST_INSERT_ID();

            INSERT INTO BookingDetails (BookingID, TicketTypeID, Quantity, PricePerTicket)
            VALUES (v_BookingID, p_TicketTypeID, p_Quantity, v_TicketPrice);

            COMMIT;

            SET p_NewBookingID = v_BookingID;
            SET p_Message = CONCAT('Booking successful! Your Booking ID is ', v_BookingID);
        END IF; 
    END IF; 
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE sp_CancelBooking(
    IN p_BookingID INT,
    IN p_CustomerID INT,
    OUT p_Message VARCHAR(255)
)
BEGIN
    DECLARE v_CurrentStatus ENUM('Pending', 'Confirmed', 'Cancelled');
    DECLARE v_OwnerID INT;

    START TRANSACTION;

    SELECT Status, CustomerID INTO v_CurrentStatus, v_OwnerID
    FROM Bookings
    WHERE BookingID = p_BookingID
    FOR UPDATE; -- Lock the row

    IF v_OwnerID IS NULL THEN
        SET p_Message = 'Error: Booking not found.';
        ROLLBACK;
    ELSEIF v_OwnerID != p_CustomerID THEN
        SET p_Message = 'Error: You do not have permission to cancel this booking.';
        ROLLBACK;
    ELSEIF v_CurrentStatus = 'Cancelled' THEN
        SET p_Message = 'Info: This booking is already cancelled.';
        ROLLBACK;
    ELSE
        UPDATE Bookings
        SET Status = 'Cancelled'
        WHERE BookingID = p_BookingID;
        
        COMMIT;
        SET p_Message = 'Booking successfully cancelled.';
    END IF;

END$$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE sp_UpdateEventDetails(
    IN p_EventID INT,
    IN p_EventManagerID INT,
    IN p_NewTitle VARCHAR(255),
    IN p_NewDescription TEXT,
    OUT p_Message VARCHAR(255)
)
BEGIN
    DECLARE v_OwnerID INT;

    SELECT EventManagerID INTO v_OwnerID
    FROM Events
    WHERE EventID = p_EventID;

    IF v_OwnerID IS NULL THEN
        SET p_Message = 'Error: Event not found.';
    ELSEIF v_OwnerID != p_EventManagerID THEN
        SET p_Message = 'Error: You do not have permission to edit this event.';
    ELSE
        UPDATE Events
        SET 
            Title = p_NewTitle,
            Description = p_NewDescription
        WHERE 
            EventID = p_EventID;
            
        SET p_Message = 'Event updated successfully.';
    END IF;

END$$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE sp_GetUserBookingHistory(
    IN p_CustomerID INT
)
BEGIN
    SELECT 
        b.BookingID,
        b.BookingTime,
        b.Status,
        b.TotalAmount,
        e.Title AS EventTitle,
        tt.TypeName AS TicketType,
        bd.Quantity,
        bd.PricePerTicket
    FROM Bookings AS b
    JOIN BookingDetails AS bd ON b.BookingID = bd.BookingID
    JOIN TicketTypes AS tt ON bd.TicketTypeID = tt.TicketTypeID
    JOIN Events AS e ON tt.EventID = e.EventID
    WHERE
        b.CustomerID = p_CustomerID
    ORDER BY
        b.BookingTime DESC;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE sp_RegisterUser(
    IN p_Username VARCHAR(100),
    IN p_Email VARCHAR(255),
    IN p_PasswordHash VARCHAR(255),
    OUT p_NewUserID INT,
    OUT p_Message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR 1062 
    BEGIN
        SET p_NewUserID = NULL;
        SET p_Message = 'Error: Email or username already exists.';
        ROLLBACK;
    END;

    START TRANSACTION;
    
    INSERT INTO Users (Username, Email, PasswordHash, Role)
    VALUES (p_Username, p_Email, p_PasswordHash, 'Customer');
    
    SET p_NewUserID = LAST_INSERT_ID();
    SET p_Message = 'User registered successfully.';
    
    COMMIT;

END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE sp_CreateEvent(
    IN p_ManagerID INT,
    IN p_VenueID INT,
    IN p_Title VARCHAR(255),
    IN p_Description TEXT,
    IN p_EventStartTime DATETIME,
    IN p_DurationHours INT,
    OUT p_NewEventID INT,
    OUT p_Message VARCHAR(255)
)
BEGIN
    DECLARE v_VenueCapacity INT;
    DECLARE v_EventEndTime DATETIME;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_NewEventID = NULL;
        SET p_Message = 'Error: Could not create event. Check constraints.';
        ROLLBACK;
    END;

    IF p_EventStartTime <= NOW() THEN
        SET p_NewEventID = NULL;
        SET p_Message = 'Error: Cannot create an event in the past.';
        
    ELSEIF p_DurationHours <= 0 THEN 
        SET p_NewEventID = NULL;
        SET p_Message = 'Error: Event duration must be at least 1 hour.';

    ELSE
        SELECT TotalCapacity INTO v_VenueCapacity
        FROM Venues
        WHERE VenueID = p_VenueID;

        IF v_VenueCapacity IS NULL THEN
            SET p_NewEventID = NULL;
            SET p_Message = 'Error: Invalid VenueID.';
        ELSE
            SET v_EventEndTime = DATE_ADD(p_EventStartTime, INTERVAL p_DurationHours HOUR);
            
            START TRANSACTION;
            
            INSERT INTO Events (
                VenueID, 
                EventManagerID, 
                Title, 
                Description, 
                EventStartTime, 
                EventEndTime, 
                TotalTickets, 
                AvailableTickets
            )
            VALUES (
                p_VenueID, 
                p_ManagerID, 
                p_Title, 
                p_Description, 
                p_EventStartTime, 
                v_EventEndTime, 
                v_VenueCapacity, 
                v_VenueCapacity
            );
            
            SET p_NewEventID = LAST_INSERT_ID();
            SET p_Message = 'Event created successfully.';
            
            COMMIT;
        END IF;
    END IF;

END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE sp_CancelEvent(
    IN p_EventID INT,
    IN p_ManagerID INT,
    OUT p_Message VARCHAR(255)
)
BEGIN
    DECLARE v_OwnerID INT;
    DECLARE EXIT HANDLER FOR 1451
    BEGIN
        SET p_Message = 'Error: Cannot cancel event. Tickets have already been sold.';
        ROLLBACK;
    END;
    
    START TRANSACTION;

    SELECT EventManagerID INTO v_OwnerID
    FROM Events
    WHERE EventID = p_EventID
    FOR UPDATE; 

    IF v_OwnerID IS NULL THEN
        SET p_Message = 'Error: Event not found.';
        ROLLBACK;
    ELSEIF v_OwnerID != p_ManagerID THEN
        SET p_Message = 'Error: You do not have permission to cancel this event.';
        ROLLBACK;
    ELSE
        DELETE FROM Events
        WHERE EventID = p_EventID;
        
        SET p_Message = 'Event cancelled successfully.';
        COMMIT;
    END IF;

END$$

DELIMITER ;


