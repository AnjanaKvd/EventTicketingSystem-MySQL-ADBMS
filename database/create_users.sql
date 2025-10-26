
CREATE USER 'app_backend'@'localhost' IDENTIFIED BY 'BackEND12@';

GRANT EXECUTE ON PROCEDURE EventBooking.sp_CreateBooking TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking.v_UpcomingEvents TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking.v_EventSalesReport TO 'app_backend'@'localhost';


GRANT SELECT ON EventBooking.Events TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking.Venues TO 'app_backend'@'localhost';
GRANT SELECT ON EventBooking.Users TO 'app_backend'@'localhost';



CREATE USER 'app_admin'@'localhost' IDENTIFIED BY 'AdMin@341';

GRANT ALL PRIVILEGES ON EventBooking.* TO 'app_admin'@'localhost' WITH GRANT OPTION;


flush privileges;