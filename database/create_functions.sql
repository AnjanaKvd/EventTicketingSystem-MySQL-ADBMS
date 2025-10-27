DELIMITER $$

CREATE FUNCTION fn_GetEventTotalRevenue(
    p_EventID INT
)
RETURNS DECIMAL(10, 2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_TotalRevenue DECIMAL(10, 2);
    SELECT COALESCE(SUM(bd.Quantity * bd.PricePerTicket), 0)
    INTO v_TotalRevenue
    FROM BookingDetails bd
    JOIN Bookings b ON bd.BookingID = b.BookingID
    JOIN TicketTypes tt ON bd.TicketTypeID = tt.TicketTypeID
    WHERE
        tt.EventID = p_EventID
        AND b.Status = 'Confirmed';

    RETURN v_TotalRevenue;
END$$

DELIMITER ;




DELIMITER $$

CREATE FUNCTION fn_GetDaysUntilEvent(
    p_EventID INT
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_EventDate DATETIME;
    DECLARE v_DaysLeft INT;

    SELECT EventStartTime INTO v_EventDate
    FROM Events
    WHERE EventID = p_EventID;
    SET v_DaysLeft = DATEDIFF(v_EventDate, CURDATE());
    IF v_DaysLeft < 0 THEN
        SET v_DaysLeft = 0;
    END IF;

    RETURN v_DaysLeft;
END$$

DELIMITER ;


DELIMITER $$

CREATE FUNCTION fn_CheckStockAvailability(
    p_TicketTypeID INT,
    p_RequestedQuantity INT
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_AvailableStock INT;
    SELECT e.AvailableTickets INTO v_AvailableStock
    FROM Events e
    JOIN TicketTypes tt ON e.EventID = tt.EventID
    WHERE tt.TicketTypeID = p_TicketTypeID;
    IF v_AvailableStock IS NOT NULL AND v_AvailableStock >= p_RequestedQuantity THEN
        RETURN 1; -- TRUE
    ELSE
        RETURN 0; -- FALSE
    END IF;

END$$

DELIMITER ;




DELIMITER $$

CREATE FUNCTION fn_GetUserTotalSpent(
    p_CustomerID INT
)
RETURNS DECIMAL(10, 2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_TotalSpent DECIMAL(10, 2);
    SELECT COALESCE(SUM(TotalAmount), 0.00)
    INTO v_TotalSpent
    FROM Bookings
    WHERE 
        CustomerID = p_CustomerID
        AND Status = 'Confirmed';

    RETURN v_TotalSpent;
END$$

DELIMITER ;