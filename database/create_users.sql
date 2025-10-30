
CREATE USER 'app_backend'@'localhost' IDENTIFIED BY 'BackEND12@';

GRANT EXECUTE ON PROCEDURE EventBooking2.sp_CreateBooking TO 'app_backend'@'localhost';
GRANT EXECUTE ON PROCEDURE EventBooking2.sp_RegisterUser TO 'app_backend'@'localhost';
GRANT EXECUTE ON PROCEDURE EventBooking2.sp_GetUserBookingHistory TO 'app_backend'@'localhost';
GRANT EXECUTE ON PROCEDURE EventBooking2.sp_UpdateEventDetails TO 'app_backend'@'localhost';
GRANT EXECUTE ON PROCEDURE EventBooking2.sp_CancelBooking TO 'app_backend'@'localhost';
GRANT EXECUTE ON PROCEDURE EventBooking2.sp_CreateEvent TO 'app_backend'@'localhost';
GRANT EXECUTE ON PROCEDURE EventBooking2.sp_CancelEvent TO 'app_backend'@'localhost';

GRANT EXECUTE ON FUNCTION EventBooking2.fn_GetDaysUntilEvent TO 'app_backend'@'localhost';
GRANT EXECUTE ON FUNCTION EventBooking2.fn_GetEventTotalRevenue TO 'app_backend'@'localhost';
GRANT EXECUTE ON FUNCTION EventBooking2.fn_GetUserTotalSpent TO 'app_backend'@'localhost';

GRANT SELECT ON EventBooking2.v_UpcomingEvents TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking2.v_EventSalesReport TO 'app_backend'@'localhost';


GRANT SELECT ON EventBooking2.Events TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking2.Venues TO 'app_backend'@'localhost';
GRANT INSERT ON EventBooking2.Venues TO 'app_backend'@'localhost';
GRANT UPDATE ON EventBooking2.Venues TO 'app_backend'@'localhost';
GRANT DELETE ON EventBooking2.Venues TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking2.Users TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking2.TicketTypes TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking2.Bookings TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking2.BookingDetails TO 'app_backend'@'localhost';



CREATE USER 'app_admin'@'localhost' IDENTIFIED BY 'AdMin@341';

GRANT ALL PRIVILEGES ON EventBooking2.* TO 'app_admin'@'localhost' WITH GRANT OPTION;


flush privileges;