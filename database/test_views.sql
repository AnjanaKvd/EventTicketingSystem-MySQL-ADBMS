-- This query is simple, but behind the scenes it's running the complex JOIN.
SELECT * FROM v_UpcomingEvents;


-- Get the sales report for the 'Colombo Music Festival' (EventID 1)
SELECT * FROM v_EventSalesReport WHERE EventID = 1;