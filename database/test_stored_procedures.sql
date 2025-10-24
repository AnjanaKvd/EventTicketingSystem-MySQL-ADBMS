-- Test 1: Successful Booking
-- Check available tickets for Event 2 BEFORE
SELECT AvailableTickets FROM Events WHERE EventID = 2;
-- (From our dummy data, this is 1284)

-- Call the procedure
CALL sp_CreateBooking(3, 3, 2, @msg, @id);

-- See the output message and new ID
SELECT @msg, @id;

-- Check available tickets AFTER
-- (Note: This will still be 1284 until we create the trigger!)

-- Verify the new records were created
SELECT * FROM Bookings WHERE BookingID = @id;
SELECT * FROM BookingDetails WHERE BookingID = @id;

-- Test 2: Failed Booking (Not enough tickets)

CALL sp_CreateBooking(3, 3, 2000, @msg, @id);

-- See the error message
SELECT @msg, @id;
-- This will return "Error: Not enough tickets available..." and a NULL ID.