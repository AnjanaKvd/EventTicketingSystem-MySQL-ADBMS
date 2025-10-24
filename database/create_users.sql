-- 1. Create the user (replace 'your_password' with a strong password)
CREATE USER 'app_backend'@'localhost' IDENTIFIED BY 'BackEND12@';

-- 2. Grant permissions. Notice we do NOT grant SELECT/INSERT/UPDATE on tables.
-- We only grant permission to run the procedures and select from views.
GRANT EXECUTE ON PROCEDURE EventBooking.sp_CreateBooking TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking.v_UpcomingEvents TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking.v_EventSalesReport TO 'app_backend'@'localhost';

-- We must also grant permissions for the underlying tables used in the views
GRANT SELECT ON EventBooking.Events TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking.Venues TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking.Users TO 'app_backend'@'localhost';
-- (etc. for all tables used in your views)


CREATE USER 'app_admin'@'localhost' IDENTIFIED BY 'AdMin@341';

-- Grant broad permissions, but still not total root access
GRANT ALL PRIVILEGES ON EventBooking.* TO 'app_admin'@'localhost' WITH GRANT OPTION;


flush privileges;