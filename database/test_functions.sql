-- Get a list of all events and their total revenue
SELECT
    EventID,
    Title,
    AvailableTickets,
    fn_GetEventTotalRevenue(EventID) AS CalculatedRevenue
FROM
    Events;