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

def generate_raw_pos_data(num_rows=100):
    """Simulate raw data ingestion from a POS system."""
    print(f"Simulating ingestion of {num_rows} POS records...")
    data = []
    for i in range(num_rows):
        # Simulate some dirty data
        qty = random.randint(1, 5)
        if random.random() < 0.05: qty = -1 # Dirty data: negative quantity
        
        data.append({
            'transaction_id': f'TXN-{random.randint(2000, 9000)}',
            'product_id': random.randint(1, 3),
            'customer_id': random.randint(1, 3),
            'store_id': random.randint(1, 2),
            'date_id': (datetime(2024, 1, 1) + timedelta(days=random.randint(0, 30))).date(),
            'quantity_sold': qty,
            'unit_price': random.choice([900.00, 700.00, 150.00]) # Simplified
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
        optimize_storage(con)
        
        print("\nPipeline completed successfully.")
        
        # Verification Query
        print("\n--- Verification: Top 3 Products by Revenue (Updated) ---")
        print(con.execute("""
            SELECT dp.product_name, SUM(fs.total_amount) as revenue
            FROM fact_sales fs
            JOIN dim_product dp ON fs.product_id = dp.product_id
            GROUP BY dp.product_name
            ORDER BY revenue DESC LIMIT 3
        """).fetchdf())
        
    finally:
        con.close()

if __name__ == "__main__":
    run_pipeline()