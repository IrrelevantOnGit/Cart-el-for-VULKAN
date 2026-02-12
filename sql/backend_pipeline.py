import duckdb
import pandas as pd
import random
from datetime import datetime, timedelta
from pathlib import Path

# --- Configuration ---
DB_PATH = "retail_hub.duckdb"
BASE_DIR = Path(__file__).parent.parent
SQL_DIR = BASE_DIR / "sql"
DATA_DIR = BASE_DIR / "data"

def init_db(con):
    """Initialize the database schema from SQL files."""
    print("Initializing Schema...")
    schema_sql = (SQL_DIR / "01_create_star_schema.sql").read_text()
    con.execute(schema_sql)
    
    # Load initial mock data for dimensions
    mock_data_sql = (SQL_DIR / "02_insert_mock_data.sql").read_text()
    con.execute(mock_data_sql)

def populate_date_dimension(con):
    """Ensure dim_date covers the simulation period (Jan 2024)."""
    print("Populating Date Dimension...")
    dates = []
    start_date = datetime(2024, 1, 1)
    # Generate 32 days to cover the random range
    for i in range(32):
        curr = start_date + timedelta(days=i)
        dates.append({
            'date_id': curr.date(),
            'day_of_week': curr.strftime('%A'),
            'month_name': curr.strftime('%B'),
            'quarter': (curr.month - 1) // 3 + 1,
            'year': curr.year,
            'is_weekend': curr.weekday() >= 5
        })
    
    df_dates = pd.DataFrame(dates)
    con.register('df_dates_staging', df_dates)
    # INSERT OR IGNORE skips dates that already exist (like the ones from mock_data.sql)
    con.execute("INSERT OR IGNORE INTO dim_date SELECT * FROM df_dates_staging")
    con.unregister('df_dates_staging')

def generate_raw_pos_data(num_rows=5000):
    """Simulate raw data ingestion from a POS system."""
    print(f"Simulating ingestion of {num_rows} POS records...")
    
    # Product Price Mapping (matches SQL data)
    product_prices = {
        1: 120000.00, 2: 80000.00, 3: 25000.00, 4: 99000.00, 5: 79000.00,
        6: 55000.00, 7: 60000.00, 8: 4000.00, 9: 14000.00, 10: 45000.00
    }
    
    data = []
    for i in range(num_rows):
        # Simulate some dirty data
        qty = random.randint(1, 5)
        if random.random() < 0.05: qty = -1 # Dirty data: negative quantity
        
        pid = random.randint(1, 10)
        data.append({
            'transaction_id': f'TXN-{random.randint(2000, 9000)}',
            'product_id': pid,
            'customer_id': random.randint(1, 10),
            'store_id': random.randint(1, 5),
            'date_id': (datetime(2024, 1, 1) + timedelta(days=random.randint(0, 30))).date(),
            'quantity_sold': qty,
            'unit_price': product_prices[pid]
        })
    return pd.DataFrame(data)

def generate_shipment_data(num_rows=200):
    """Simulate logistics/shipment data."""
    print(f"Simulating ingestion of {num_rows} Shipment records...")
    data = []
    statuses = ['Delivered', 'In-Transit', 'Delayed', 'Shipped']
    
    for i in range(num_rows):
        shipped_dt = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 25))
        status = random.choices(statuses, weights=[60, 20, 10, 10])[0]
        delivery_dt = shipped_dt + timedelta(days=random.randint(1, 7)) if status == 'Delivered' else None
        
        data.append({
            'shipment_id': 100 + i, # Start after mock data
            'order_id': f'ORD-{random.randint(5000, 9999)}',
            'origin_store_id': random.randint(1, 5),
            'destination_store_id': random.randint(1, 5),
            'shipped_date': shipped_dt.date(),
            'delivery_date': delivery_dt.date() if delivery_dt else None,
            'status': status
        })
    return pd.DataFrame(data)

def transform_data(df):
    """Clean and transform raw data."""
    print("Cleaning data...")
    
    # 1. Remove invalid quantities
    initial_count = len(df)
    df = df[df['quantity_sold'] > 0].copy()
    print(f"  - Removed {initial_count - len(df)} invalid records (negative qty).")
    
    # 2. Calculate total amount
    df['total_amount'] = df['quantity_sold'] * df['unit_price']
    
    # 3. Generate sales_id (simulating surrogate key generation)
    df['sales_id'] = range(1000, 1000 + len(df))
    
    return df

def load_to_warehouse(con, df):
    """Load processed data into the Data Warehouse."""
    print("Loading data into Fact Table...")
    
    # Use DuckDB's appender for efficiency
    con.register('df_staging', df)
    con.execute("""
        INSERT INTO fact_sales (sales_id, transaction_id, product_id, customer_id, store_id, date_id, quantity_sold, total_amount)
        SELECT sales_id, transaction_id, product_id, customer_id, store_id, date_id, quantity_sold, total_amount
        FROM df_staging
    """)
    con.unregister('df_staging')

def load_shipments(con, df):
    """Load shipment data into Fact Table."""
    print("Loading data into Shipments Fact Table...")
    con.register('df_ship_staging', df)
    con.execute("""
        INSERT INTO fact_shipments (shipment_id, order_id, origin_store_id, destination_store_id, shipped_date, delivery_date, status)
        SELECT shipment_id, order_id, origin_store_id, destination_store_id, shipped_date, delivery_date, status
        FROM df_ship_staging
    """)
    con.unregister('df_ship_staging')

def optimize_storage(con):
    """Demonstrate Partitioning Strategy (Parquet)."""
    print("Optimizing storage: Exporting to Partitioned Parquet...")
    output_path = DATA_DIR / "parquet_archive"
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Partition by Year/Month (derived from date_id) for faster time-based queries
    con.execute(f"""
        COPY (
            SELECT *, YEAR(date_id) as year, MONTH(date_id) as month 
            FROM fact_sales
        ) TO '{output_path}' 
        (FORMAT PARQUET, PARTITION_BY (year, month), OVERWRITE_OR_IGNORE)
    """)
    print(f"  - Data partitioned and stored in {output_path}")

def run_pipeline():
    con = duckdb.connect(DB_PATH)
    
    try:
        init_db(con)
        populate_date_dimension(con) # Ensure dates exist before loading facts
        
        raw_df = generate_raw_pos_data()
        clean_df = transform_data(raw_df)
        load_to_warehouse(con, clean_df)
        
        ship_df = generate_shipment_data()
        load_shipments(con, ship_df)
        
        optimize_storage(con)
        
        print("\nPipeline completed successfully.")
        
        # Verification Query
        print("\n--- Product Performance Report (All Products) ---")
        print(con.execute("""
            SELECT dp.product_name, SUM(fs.total_amount) as revenue, SUM(fs.quantity_sold) as units_sold
            FROM fact_sales fs
            JOIN dim_product dp ON fs.product_id = dp.product_id
            GROUP BY dp.product_name
            ORDER BY revenue DESC
        """).fetchdf())
        
        print("\n--- Regional Insights: Best & Worst Selling Items ---")
        # Using a CTE to calculate sales per region/product, then finding min/max
        print(con.execute("""
            WITH RegionalSales AS (
                SELECT 
                    ds.region,
                    dp.product_name,
                    SUM(fs.quantity_sold) as total_qty
                FROM fact_sales fs
                JOIN dim_store ds ON fs.store_id = ds.store_id
                JOIN dim_product dp ON fs.product_id = dp.product_id
                GROUP BY ds.region, dp.product_name
            )
            SELECT region, product_name, total_qty, 'Most Sold' as type
            FROM RegionalSales rs1
            WHERE total_qty = (SELECT MAX(total_qty) FROM RegionalSales rs2 WHERE rs1.region = rs2.region)
            UNION ALL
            SELECT region, product_name, total_qty, 'Least Sold' as type
            FROM RegionalSales rs1
            WHERE total_qty = (SELECT MIN(total_qty) FROM RegionalSales rs2 WHERE rs1.region = rs2.region)
            ORDER BY region, type DESC
        """).fetchdf())

        print("\n--- Market Basket Analysis (Items Bought Together) ---")
        print(con.execute("""
            SELECT 
                p1.product_name AS product_a,
                p2.product_name AS product_b,
                COUNT(*) AS times_bought_together
            FROM fact_sales f1
            JOIN fact_sales f2 ON f1.transaction_id = f2.transaction_id AND f1.product_id < f2.product_id
            JOIN dim_product p1 ON f1.product_id = p1.product_id
            JOIN dim_product p2 ON f2.product_id = p2.product_id
            GROUP BY p1.product_name, p2.product_name
            ORDER BY times_bought_together DESC
            LIMIT 5
        """).fetchdf())

        print("\n--- Logistics: Shipment Status Breakdown ---")
        print(con.execute("""
            SELECT status, COUNT(*) as count
            FROM fact_shipments
            GROUP BY status
            ORDER BY count DESC
        """).fetchdf())

        print("\n--- Logistics: Route Efficiency (Avg Days to Deliver) ---")
        print(con.execute("""
            SELECT 
                s1.city as origin,
                s2.city as destination,
                CAST(AVG(fs.delivery_date - fs.shipped_date) AS INT) as avg_days
            FROM fact_shipments fs
            JOIN dim_store s1 ON fs.origin_store_id = s1.store_id
            JOIN dim_store s2 ON fs.destination_store_id = s2.store_id
            WHERE fs.status = 'Delivered'
            GROUP BY s1.city, s2.city
            ORDER BY avg_days ASC
            LIMIT 5
        """).fetchdf())

    finally:
        con.close()

if __name__ == "__main__":
    run_pipeline()