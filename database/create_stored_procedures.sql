-- Set the delimiter to $$ to allow for semicolons inside the procedure
DELIMITER $$

CREATE PROCEDURE sp_CreateBooking(
    IN p_CustomerID INT,
    IN p_TicketTypeID INT,
    IN p_Quantity INT,
    OUT p_NewBookingID INT,
    OUT p_Message VARCHAR(255)
)
BEGIN
    -- == 1. DECLARE VARIABLES ==
    DECLARE v_TicketPrice DECIMAL(10, 2);
    DECLARE v_AvailableStock INT;
    DECLARE v_TotalAmount DECIMAL(10, 2);
    DECLARE v_BookingID INT;
    DECLARE v_EventID INT;

    -- == 2. SET UP ERROR HANDLING ==
    -- If any SQL error occurs, roll back the transaction and set the error message.
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_NewBookingID = NULL;
        SET p_Message = 'Error: Booking failed. Transaction rolled back.';
    END;

    -- == 3. START THE TRANSACTION ==
    START TRANSACTION;

    -- == 4. GET DATA & LOCK ROWS FOR UPDATE ==
    -- Get the EventID and its current available tickets
    -- FOR UPDATE locks this row to prevent race conditions (concurrency)
    SELECT 
        e.EventID, e.AvailableTickets, tt.Price 
    INTO 
        v_EventID, v_AvailableStock, v_TicketPrice
    FROM Events e
    JOIN TicketTypes tt ON e.EventID = tt.EventID
    WHERE tt.TicketTypeID = p_TicketTypeID
    FOR UPDATE;

    -- == 5. CHECK BUSINESS LOGIC (ARE TICKETS AVAILABLE?) ==
    IF v_AvailableStock >= p_Quantity THEN
        
        -- 5a. Calculate total cost
        SET v_TotalAmount = v_TicketPrice * p_Quantity;
        
        -- 5b. Create the parent Booking record
        INSERT INTO Bookings (CustomerID, TotalAmount, Status)
        VALUES (p_CustomerID, v_TotalAmount, 'Confirmed');
        
        -- 5c. Get the new BookingID that was just created
        SET v_BookingID = LAST_INSERT_ID();
        
        -- 5d. Create the child BookingDetails record
        INSERT INTO BookingDetails (BookingID, TicketTypeID, Quantity, PricePerTicket)
        VALUES (v_BookingID, p_TicketTypeID, p_Quantity, v_TicketPrice);
        
        -- 5e. Commit the transaction (this is the success point)
        COMMIT;
        
        SET p_NewBookingID = v_BookingID;
        SET p_Message = 'Booking successful! Your Booking ID is ' + CAST(v_BookingID AS CHAR);

    ELSE
        -- == 6. FAILED BUSINESS LOGIC (NOT ENOUGH TICKETS) ==
        -- Not an SQL error, but a business rule failure.
        ROLLBACK;
        SET p_NewBookingID = NULL;
        SET p_Message = 'Error: Not enough tickets available. Transaction rolled back.';
    END IF;

END$$

-- Reset the delimiter back to ;
DELIMITER ;