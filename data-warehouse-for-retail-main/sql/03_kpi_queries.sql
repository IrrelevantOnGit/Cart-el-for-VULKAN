-- Top 3 Products by Revenue
SELECT 
    dp.product_name,
    SUM(fs.total_amount) AS total_revenue
FROM fact_sales fs
JOIN dim_product dp ON fs.product_id = dp.product_id
GROUP BY dp.product_name
ORDER BY total_revenue DESC
LIMIT 3;

-- Sales by Region
SELECT 
    ds.region,
    SUM(fs.total_amount) AS region_sales
FROM fact_sales fs
JOIN dim_store ds ON fs.store_id = ds.store_id
GROUP BY ds.region;

-- Sales Analysis: Weekdays vs Weekends
SELECT 
    dd.is_weekend,
    COUNT(fs.sales_id) AS total_sales,
    SUM(fs.total_amount) AS revenue
FROM fact_sales fs
JOIN dim_date dd ON fs.date_id = dd.date_id
GROUP BY dd.is_weekend;

-- Monthly Sales Trend
SELECT
  dd.month_name,
  SUM(fs.total_amount) AS monthly_sales
FROM fact_sales fs
JOIN dim_date dd ON fs.date_id = dd.date_id
GROUP BY dd.month_name
ORDER BY monthly_sales DESC;

-- Profit Margin by Store (if you define margin = total_amount - cost, you’d need a cost column)
SELECT
  ds.store_name,
  SUM(fs.total_amount) AS total_revenue
FROM fact_sales fs
JOIN dim_store ds ON fs.store_id = ds.store_id
GROUP BY ds.store_name;

-- Customer Lifetime Value
SELECT
  dc.customer_id,
  dc.first_name,
  dc.last_name,
  SUM(fs.total_amount) AS lifetime_value
FROM fact_sales fs
JOIN dim_customer dc ON fs.customer_id = dc.customer_id
GROUP BY dc.customer_id, dc.first_name, dc.last_name
ORDER BY lifetime_value DESC;