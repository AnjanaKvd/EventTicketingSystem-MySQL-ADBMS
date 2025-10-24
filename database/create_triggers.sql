DELIMITER $$

CREATE TRIGGER trg_AfterBookingDetailInsert
AFTER INSERT ON BookingDetails
FOR EACH ROW
BEGIN
    DECLARE v_EventID INT;
    DECLARE v_BookingStatus ENUM('Pending', 'Confirmed', 'Cancelled');

    -- 1. Get the status of the parent Booking
    SELECT Status INTO v_BookingStatus
    FROM Bookings
    WHERE BookingID = NEW.BookingID;

    -- 2. Only run the update if the booking is 'Confirmed'
    IF v_BookingStatus = 'Confirmed' THEN
    
        -- 3. Find the EventID this ticket type belongs to
        SELECT EventID INTO v_EventID
        FROM TicketTypes
        WHERE TicketTypeID = NEW.TicketTypeID;
        
        -- 4. Update the AvailableTickets count for that event
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

    -- Scenario 1: Booking was 'Confirmed' and is NOW 'Cancelled'
    -- Action: Add tickets back to the event.
    IF OLD.Status = 'Confirmed' AND NEW.Status = 'Cancelled' THEN
    
        UPDATE Events e
        JOIN TicketTypes tt ON e.EventID = tt.EventID
        JOIN BookingDetails bd ON tt.TicketTypeID = bd.TicketTypeID
        SET e.AvailableTickets = e.AvailableTickets + bd.Quantity
        WHERE bd.BookingID = NEW.BookingID; -- NEW.BookingID is the ID of the Booking that was just updated
        
    -- Scenario 2: Booking was 'Pending' and is NOW 'Confirmed'
    -- Action: Subtract tickets from the event.
    ELSEIF OLD.Status = 'Pending' AND NEW.Status = 'Confirmed' THEN
    
        UPDATE Events e
        JOIN TicketTypes tt ON e.EventID = tt.EventID
        JOIN BookingDetails bd ON tt.TicketTypeID = bd.TicketTypeID
        SET e.AvailableTickets = e.AvailableTickets - bd.Quantity
        WHERE bd.BookingID = NEW.BookingID;
        
    END IF;
END$$

DELIMITER ;