-- Drop tables if they already exist
DROP TABLE IF EXISTS fact_sales;
DROP TABLE IF EXISTS dim_product;
DROP TABLE IF EXISTS dim_customer;
DROP TABLE IF EXISTS dim_store;
DROP TABLE IF EXISTS dim_date;

-- Create dimension: Product
CREATE TABLE dim_product (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50),
    subcategory VARCHAR(50),
    brand VARCHAR(50),
    unit_price DECIMAL(10, 2)
);

-- Create dimension: Customer
CREATE TABLE dim_customer (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    gender CHAR(1),
    age INT,
    email VARCHAR(100),
    city VARCHAR(50),
    country VARCHAR(50)
);

-- Create dimension: Store
CREATE TABLE dim_store (
    store_id INT PRIMARY KEY,
    store_name VARCHAR(100),
    city VARCHAR(50),
    region VARCHAR(50),
    country VARCHAR(50)
);

-- Create dimension: Date
CREATE TABLE dim_date (
    date_id DATE PRIMARY KEY,
    day INT,
    month INT,
    quarter INT,
    year INT,
    weekday_name VARCHAR(10),
    is_weekend BOOLEAN
);

-- Create fact table: Sales
CREATE TABLE fact_sales (
    sales_id INT PRIMARY KEY,
    product_id INT,
    customer_id INT,
    store_id INT,
    date_id DATE,
    quantity_sold INT,
    total_amount DECIMAL(12, 2),

    FOREIGN KEY (product_id) REFERENCES dim_product(product_id),
    FOREIGN KEY (customer_id) REFERENCES dim_customer(customer_id),
    FOREIGN KEY (store_id) REFERENCES dim_store(store_id),
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id)
);
