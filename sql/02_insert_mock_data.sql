INSERT INTO dim_product (product_id, product_name, category, subcategory, brand, unit_price, unit_cost) VALUES
(1, 'XPS 15 Laptop', 'Electronics', 'Computers', 'Dell', 120000.00, 90000.00),
(2, 'Galaxy S24', 'Electronics', 'Phones', 'Samsung', 80000.00, 60000.00),
(3, 'WH-1000XM5', 'Electronics', 'Audio', 'Sony', 25000.00, 18000.00),
(4, 'MacBook Air', 'Electronics', 'Computers', 'Apple', 99000.00, 75000.00),
(5, 'iPhone 15', 'Electronics', 'Phones', 'Apple', 79000.00, 60000.00),
(6, 'PlayStation 5', 'Electronics', 'Gaming', 'Sony', 55000.00, 45000.00),
(7, 'iPad Air', 'Electronics', 'Tablets', 'Apple', 60000.00, 45000.00),
(8, 'Echo Dot', 'Electronics', 'Smart Home', 'Amazon', 4000.00, 2500.00),
(9, 'Kindle Paperwhite', 'Electronics', 'Readers', 'Amazon', 14000.00, 10000.00),
(10, 'GoPro Hero 12', 'Electronics', 'Cameras', 'GoPro', 45000.00, 35000.00);

INSERT INTO dim_customer (customer_id, first_name, last_name, gender, city, country) VALUES
(1, 'Aarav', 'Sharma', 'M', 'Mumbai', 'India'),
(2, 'Diya', 'Patel', 'F', 'Ahmedabad', 'India'),
(3, 'Vihaan', 'Reddy', 'M', 'Bangalore', 'India'),
(4, 'Ananya', 'Singh', 'F', 'Delhi', 'India'),
(5, 'Aditya', 'Verma', 'M', 'Pune', 'India'),
(6, 'Kavya', 'Iyer', 'F', 'Chennai', 'India'),
(7, 'Ishaan', 'Gupta', 'M', 'Kolkata', 'India'),
(8, 'Saanvi', 'Malhotra', 'F', 'Chandigarh', 'India'),
(9, 'Rohan', 'Mehta', 'M', 'Jaipur', 'India'),
(10, 'Meera', 'Joshi', 'F', 'Lucknow', 'India');

INSERT INTO dim_store (store_id, store_name, region, city, country) VALUES
(1, 'Croma Mumbai', 'West', 'Mumbai', 'India'),
(2, 'Reliance Digital Delhi', 'North', 'Delhi', 'India'),
(3, 'Vijay Sales Bangalore', 'South', 'Bangalore', 'India'),
(4, 'Sangeetha Mobiles Chennai', 'South', 'Chennai', 'India'),
(5, 'Great Eastern Kolkata', 'East', 'Kolkata', 'India');


INSERT INTO dim_date (date_id, day_of_week, month_name, quarter, year, is_weekend) VALUES
('2024-01-05', 'Friday', 'January', 1, 2024, false),
('2024-01-06', 'Saturday', 'January', 1, 2024, true);

INSERT INTO fact_sales (sales_id, transaction_id, product_id, customer_id, store_id, date_id, quantity_sold, total_amount) VALUES
(1, 'TXN-1001', 1, 1, 1, '2024-01-05', 1, 120000.00),
(2, 'TXN-1002', 2, 2, 2, '2024-01-06', 2, 160000.00),
(3, 'TXN-1003', 3, 3, 1, '2024-01-06', 1, 25000.00),
(4, 'TXN-1003', 2, 3, 1, '2024-01-06', 1, 80000.00);

INSERT INTO fact_inventory (inventory_id, product_id, store_id, date_id, quantity_on_hand, reorder_level) VALUES
(1, 1, 1, '2024-01-06', 5, 10), -- Low stock alert
(2, 2, 2, '2024-01-06', 50, 20),
(3, 5, 3, '2024-01-06', 2, 15); -- Low stock iPhone in Bangalore

INSERT INTO fact_shipments (shipment_id, order_id, origin_store_id, destination_store_id, shipped_date, delivery_date, status) VALUES
(1, 'ORD-500', 2, 1, '2024-01-01', '2024-01-03', 'Delivered'),
(2, 'ORD-501', 3, 4, '2024-01-05', NULL, 'In-Transit');
