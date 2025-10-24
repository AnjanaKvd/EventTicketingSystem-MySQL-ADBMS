DELIMITER $$

CREATE FUNCTION fn_GetEventTotalRevenue(
    p_EventID INT
)
RETURNS DECIMAL(10, 2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_TotalRevenue DECIMAL(10, 2);

    -- Use the COALESCE function to return 0 instead of NULL if no sales exist
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