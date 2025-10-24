-- Test Trigger 1
-- Check ticket count BEFORE
SELECT AvailableTickets FROM Events WHERE EventID = 2; -- (Should be 1288)

-- Call the SP to book 2 'Balcony' tickets (TypeID 3) for Alice (UserID 3)
CALL sp_CreateBooking(3, 3, 2, @msg, @id);

-- Check ticket count AFTER
SELECT AvailableTickets FROM Events WHERE EventID = 2; -- (Should now be 1286)


-- Test Trigger 2 (Cancellation)
-- Update the booking you just made (let's assume its @id was 5)
UPDATE Bookings SET Status = 'Cancelled' WHERE BookingID = 5;

-- Check ticket count AFTER CANCELLATION
SELECT AvailableTickets FROM Events WHERE EventID = 2; -- (Should go back to 1288)