CREATE VIEW v_UpcomingEvents AS
SELECT
    e.EventID,
    e.Title,
    e.Description,
    e.EventStartTime,
    e.EventEndTime,
    v.Name AS VenueName,
    v.City AS VenueCity,
    e.AvailableTickets
FROM
    Events AS e
JOIN
    Venues AS v ON e.VenueID = v.VenueID
WHERE
    e.EventStartTime > NOW() -- Only show events that haven't happened yet
ORDER BY
    e.EventStartTime ASC;
    
    
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