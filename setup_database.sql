-- Run this script in MySQL to create the database
-- mysql -u arshad -p < setup_database.sql

CREATE DATABASE IF NOT EXISTS smart_recycle;
USE smart_recycle;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    points INT DEFAULT 0,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pickup requests table
CREATE TABLE IF NOT EXISTS pickup_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(100),
    user_email VARCHAR(100),
    pickup_date DATE,
    pickup_time VARCHAR(20),
    waste_types TEXT,
    special_instructions TEXT,
    status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Offline entries table
CREATE TABLE IF NOT EXISTS offline_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collector_name VARCHAR(100),
    waste_weight DECIMAL(10,2),
    waste_types TEXT,
    food_provided ENUM('Yes', 'No'),
    entry_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user if it doesn't exist
INSERT IGNORE INTO users (name, email, password, phone, address, points) 
VALUES ('Admin', 'admin@gmail.com', SHA2('Admin', 256), '+91-9999999999', 'Admin Office', 0);

SHOW TABLES;
SELECT 'Database setup completed successfully!' as Status;
