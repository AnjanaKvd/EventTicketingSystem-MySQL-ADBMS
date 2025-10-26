CREATE VIEW v_UpcomingEvents AS
SELECT 
    EventID,
    Title,
    EventStartTime,
    fn_GetDaysUntilEvent(EventID) AS DaysRemaining
FROM 
    Events
WHERE 
    EventStartTime > NOW();
    
    
CREATE VIEW v_EventSalesReport AS
SELECT
    e.EventID,
    e.Title AS EventTitle,
    tt.TypeName AS TicketType,
    SUM(bd.Quantity) AS TicketsSold,
    SUM(bd.Quantity * bd.PricePerTicket) AS TotalRevenue
FROM
    BookingDetails AS bd
JOIN
    Bookings AS b ON bd.BookingID = b.BookingID
JOIN
    TicketTypes AS tt ON bd.TicketTypeID = tt.TicketTypeID
JOIN
    Events AS e ON tt.EventID = e.EventID
WHERE
    b.Status = 'Confirmed' -- Only count confirmed sales
GROUP BY
    e.EventID,
    tt.TypeName;
    
    

    
    
