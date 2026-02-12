INSERT INTO dim_product (product_id, product_name, category, subcategory, brand, unit_price) VALUES
(1, 'Laptop', 'Electronics', 'Computers', 'Dell', 900.00),
(2, 'Smartphone', 'Electronics', 'Phones', 'Samsung', 700.00),
(3, 'Headphones', 'Electronics', 'Audio', 'Sony', 150.00);


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


INSERT INTO fact_sales (sales_id, product_id, customer_id, store_id, date_id, quantity_sold, total_amount) VALUES
(1, 1, 1, 1, '2024-01-05', 1, 900.00),
(2, 2, 2, 2, '2024-01-06', 2, 1400.00),
(3, 3, 3, 1, '2024-01-06', 1, 150.00);
