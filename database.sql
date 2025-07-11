-- Smart Recycle Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS smart_recycle;
USE smart_recycle;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    points INT DEFAULT 0,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Pickup requests table
CREATE TABLE pickup_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(100),
    user_email VARCHAR(100),
    pickup_date DATE,
    pickup_time VARCHAR(20),
    waste_types JSON,
    status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Offline entries table
CREATE TABLE offline_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    collector_name VARCHAR(100),
    waste_weight DECIMAL(5,2),
    waste_types JSON,
    food_provided VARCHAR(50),
    entry_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rewards table
CREATE TABLE rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    points_required INT,
    image_url VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- User rewards/claims table
CREATE TABLE user_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    reward_id INT,
    claimed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reward_id) REFERENCES rewards(id)
);

-- Collection centers table
CREATE TABLE collection_centers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    address TEXT,
    phone VARCHAR(15),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Insert sample rewards
INSERT INTO rewards (name, description, points_required, image_url) VALUES
('Sustainable Pencil Set', 'Made from recycled materials', 400, 'https://via.placeholder.com/200x150/4CAF50/white?text=Eco+Pencil'),
('Eco Water Bottle', 'BPA-free reusable bottle', 1000, 'https://via.placeholder.com/200x150/2196F3/white?text=Water+Bottle'),
('Organic Cotton Bag', 'Reusable shopping bag', 1500, 'https://via.placeholder.com/200x150/FF9800/white?text=Shopping+Bag'),
('Bamboo Cutlery Set', 'Portable eco-friendly utensils', 2000, 'https://via.placeholder.com/200x150/9C27B0/white?text=Bamboo+Set'),
('Solar LED Light', 'Renewable energy lighting', 5000, 'https://via.placeholder.com/200x150/4CAF50/white?text=Solar+Light'),
('Plant a Tree', 'We will plant a tree in your name', 10000, 'https://via.placeholder.com/200x150/FF5722/white?text=Tree+Plant');

-- Insert sample collection centers
INSERT INTO collection_centers (name, address, phone, latitude, longitude) VALUES
('Green Waste Solutions', 'Koramangala, Bangalore', '+91 80 1234 5678', 12.9352, 77.6245),
('EcoClean Services', 'Indiranagar, Bangalore', '+91 80 2345 6789', 12.9719, 77.6412),
('Sustainable Waste Management', 'Whitefield, Bangalore', '+91 80 3456 7890', 12.9698, 77.7499),
('Clean City Initiative', 'Jayanagar, Bangalore', '+91 80 4567 8901', 12.9279, 77.5619),
('Recycle Right', 'HSR Layout, Bangalore', '+91 80 5678 9012', 12.9081, 77.6476);

-- Insert admin user (password: Admin)
INSERT INTO users (name, email, password, phone, address, points) VALUES
('System Admin', 'admin@gmail.com', 'e3afed0047b08059d0fada10f400c1e5', '+91 80 0000 0000', 'Smart Recycle HQ, Bangalore', 0);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_pickup_requests_user_id ON pickup_requests(user_id);
CREATE INDEX idx_pickup_requests_status ON pickup_requests(status);
CREATE INDEX idx_pickup_requests_date ON pickup_requests(pickup_date);
CREATE INDEX idx_offline_entries_date ON offline_entries(entry_date);
CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
