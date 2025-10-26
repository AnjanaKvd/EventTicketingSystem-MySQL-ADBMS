DELIMITER $$

CREATE TRIGGER trg_AfterBookingDetailInsert
AFTER INSERT ON BookingDetails
FOR EACH ROW
BEGIN
    DECLARE v_EventID INT;
    DECLARE v_BookingStatus ENUM('Pending', 'Confirmed', 'Cancelled');

    SELECT Status INTO v_BookingStatus
    FROM Bookings
    WHERE BookingID = NEW.BookingID;

    IF v_BookingStatus = 'Confirmed' THEN
    
        SELECT EventID INTO v_EventID
        FROM TicketTypes
        WHERE TicketTypeID = NEW.TicketTypeID;
        
        UPDATE Events
        SET AvailableTickets = AvailableTickets - NEW.Quantity
        WHERE EventID = v_EventID;
        
    END IF;
END$$

DELIMITER ;



DELIMITER $$

CREATE TRIGGER trg_AfterBookingUpdate
AFTER UPDATE ON Bookings
FOR EACH ROW
BEGIN

    IF OLD.Status = 'Confirmed' AND NEW.Status = 'Cancelled' THEN
    
        UPDATE Events e
        JOIN TicketTypes tt ON e.EventID = tt.EventID
        JOIN BookingDetails bd ON tt.TicketTypeID = bd.TicketTypeID
        SET e.AvailableTickets = e.AvailableTickets + bd.Quantity
        WHERE bd.BookingID = NEW.BookingID; 
    ELSEIF OLD.Status = 'Pending' AND NEW.Status = 'Confirmed' THEN
    
        UPDATE Events e
        JOIN TicketTypes tt ON e.EventID = tt.EventID
        JOIN BookingDetails bd ON tt.TicketTypeID = bd.TicketTypeID
        SET e.AvailableTickets = e.AvailableTickets - bd.Quantity
        WHERE bd.BookingID = NEW.BookingID;
        
    END IF;
END$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER trg_BeforeEventInsert_Validate
BEFORE INSERT ON Events
FOR EACH ROW
BEGIN
    DECLARE v_VenueCapacity INT;
    DECLARE v_ErrorMessage VARCHAR(255);

    SELECT TotalCapacity INTO v_VenueCapacity
    FROM Venues
    WHERE VenueID = NEW.VenueID;

    IF NEW.EventStartTime <= NOW() THEN
        SET v_ErrorMessage = 'Error: Cannot create an event in the past.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_ErrorMessage;
    END IF;

    IF NEW.EventEndTime <= NEW.EventStartTime THEN
        SET v_ErrorMessage = 'Error: Event end time must be after the start time.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_ErrorMessage;
    END IF;

    IF NEW.TotalTickets > v_VenueCapacity THEN
        SET v_ErrorMessage = CONCAT('Error: Total tickets (', NEW.TotalTickets, ') exceeds venue capacity (', v_VenueCapacity, ').');
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_ErrorMessage;
    END IF;
END$$

DELIMITER ;