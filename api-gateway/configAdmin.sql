-- Tạo user
CREATE USER 'admin'@'%' IDENTIFIED BY 'haidang';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Tạo database
-- CREATE DATABASE admin_db;
CREATE DATABASE auth_db;
