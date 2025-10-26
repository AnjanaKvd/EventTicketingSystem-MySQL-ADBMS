DELIMITER $$

CREATE PROCEDURE sp_CreateBooking(
    IN p_CustomerID INT,
    IN p_TicketTypeID INT,
    IN p_Quantity INT,
    OUT p_NewBookingID INT,
    OUT p_Message VARCHAR(255)
)
BEGIN
    DECLARE v_TicketPrice DECIMAL(10, 2);
    DECLARE v_AvailableStock INT;
    DECLARE v_TotalAmount DECIMAL(10, 2);
    DECLARE v_BookingID INT;
    DECLARE v_EventID INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_NewBookingID = NULL;
        SET p_Message = 'Error: Booking failed. Transaction rolled back.';
    END;

    START TRANSACTION;
    SELECT 
        e.EventID, e.AvailableTickets, tt.Price 
    INTO 
        v_EventID, v_AvailableStock, v_TicketPrice
    FROM Events e
    JOIN TicketTypes tt ON e.EventID = tt.EventID
    WHERE tt.TicketTypeID = p_TicketTypeID
    FOR UPDATE;
    IF v_AvailableStock >= p_Quantity THEN

        SET v_TotalAmount = v_TicketPrice * p_Quantity;
        INSERT INTO Bookings (CustomerID, TotalAmount, Status)
        VALUES (p_CustomerID, v_TotalAmount, 'Confirmed');
        SET v_BookingID = LAST_INSERT_ID();
        INSERT INTO BookingDetails (BookingID, TicketTypeID, Quantity, PricePerTicket)
        VALUES (v_BookingID, p_TicketTypeID, p_Quantity, v_TicketPrice);
        COMMIT;
        
        SET p_NewBookingID = v_BookingID;
        SET p_Message = 'Booking successful! Your Booking ID is ' + CAST(v_BookingID AS CHAR);

    ELSE
        ROLLBACK;
        SET p_NewBookingID = NULL;
        SET p_Message = 'Error: Not enough tickets available. Transaction rolled back.';
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


