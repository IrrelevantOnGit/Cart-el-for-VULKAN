INSERT INTO dim_product (product_id, product_name, category, subcategory, brand, unit_price, unit_cost) VALUES
(1, 'Laptop', 'Electronics', 'Computers', 'Dell', 900.00, 600.00),
(2, 'Smartphone', 'Electronics', 'Phones', 'Samsung', 700.00, 450.00),
(3, 'Headphones', 'Electronics', 'Audio', 'Sony', 150.00, 80.00);


INSERT INTO dim_customer (customer_id, first_name, last_name, gender) VALUES
(1, 'Alice', 'Smith', 'F'),
(2, 'Bob', 'Johnson', 'M'),
(3, 'Carol', 'Lee', 'F');


INSERT INTO dim_store (store_id, store_name, region, city) VALUES
(1, 'MegaTech NYC', 'Northeast', 'New York'),
(2, 'GadgetZone LA', 'West', 'Los Angeles');


INSERT INTO dim_date (date_id, day_of_week, month_name, quarter, year, is_weekend) VALUES
('2024-01-05', 'Friday', 'January', 1, 2024, false),
('2024-01-06', 'Saturday', 'January', 1, 2024, true);

INSERT INTO fact_sales (sales_id, transaction_id, product_id, customer_id, store_id, date_id, quantity_sold, total_amount) VALUES
(1, 'TXN-1001', 1, 1, 1, '2024-01-05', 1, 900.00),
(2, 'TXN-1002', 2, 2, 2, '2024-01-06', 2, 1400.00),
(3, 'TXN-1003', 3, 3, 1, '2024-01-06', 1, 150.00),
(4, 'TXN-1003', 2, 3, 1, '2024-01-06', 1, 700.00); -- Added item to TXN-1003 for Market Basket

INSERT INTO fact_inventory (inventory_id, product_id, store_id, date_id, quantity_on_hand, reorder_level) VALUES
(1, 1, 1, '2024-01-06', 5, 10), -- Low stock alert
(2, 2, 2, '2024-01-06', 50, 20);

INSERT INTO fact_shipments (shipment_id, order_id, origin_store_id, destination_store_id, shipped_date, delivery_date, status) VALUES
(1, 'ORD-500', 2, 1, '2024-01-01', '2024-01-03', 'Delivered'),
(2, 'ORD-501', 2, 1, '2024-01-05', NULL, 'In-Transit');
