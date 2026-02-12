# Cart-el a Smart Retail Supply Chain & Customer Intelligence Platform

## Overview
This project is a centralized "Data Hub" designed to break down data silos for mid-sized retailers. It integrates data from Point of Sale (POS) systems, inventory management, and logistics networks into a single, high-performance Data Warehouse.

By leveraging **DuckDB** for analytical processing and a **Star Schema** architecture, this platform enables real-time insights into revenue, inventory health, supply chain efficiency, and customer behavior.

## Key Features

###  Data Engineering & Architecture
- **Automated Pipelines**: Python-based ETL process (`backend_pipeline.py`) that ingests, cleans, and transforms raw data.
- **Star Schema Design**: Optimized data modeling with central Fact tables (Sales, Inventory, Shipments) and descriptive Dimension tables.
- **Scalable Storage**: Hybrid storage approach using DuckDB for active querying and Partitioned Parquet files for long-term archival.
- **Data Quality Checks**: Automated handling of schema evolution, missing values, and data anomalies (e.g., negative quantities).

### Advanced Analytics
- **Commercial KPIs**: Product revenue performance, regional sales breakdown.
- **Supply Chain Intelligence**: Inventory turnover, low-stock alerts, and delivery time tracking.
- **Customer Insights**: Market Basket Analysis (products bought together) and customer segmentation.

### Frontend Dashboard
- A lightweight HTML/JS dashboard to visualize system status and key metrics.

## Project Structure

```text
Cart-el-for-VULKAN/
├── index.html              # Dashboard entry point
├── app.js                  # Frontend logic
├── sql/
│   ├── 01_create_star_schema.sql  # Database schema definition
│   ├── 02_insert_mock_data.sql    # Initial seed data
│   ├── 03_kpi_queries.sql         # Analytical SQL queries
│   └── backend_pipeline.py        # Main ETL and Analytics script
├── data/                   # Generated data storage (Parquet/DuckDB)
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites
- **Python 3.8+**
- **Node.js** (optional, for future frontend tooling)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd Cart-el-for-VULKAN
    ```

2.  **Install Python dependencies**:
    ```bash
    pip install duckdb pandas
    ```

### Running the Backend Pipeline

The backend pipeline simulates data ingestion, processes it, and runs analytical queries.

```bash
python sql/backend_pipeline.py
```

**What happens:**
1.  Initializes the DuckDB database (`retail_hub.duckdb`).
2.  Creates the Star Schema.
3.  Simulates 5,000+ POS transactions and shipment records.
4.  Cleans and loads data into the warehouse.
5.  Exports partitioned data to `data/parquet_archive`.
6.  Prints key reports to the console (Revenue, Logistics, Market Basket Analysis).

## Technology Stack
- **Language**: Python, SQL, JavaScript
- **Database**: DuckDB (OLAP)
- **Data Format**: Parquet, CSV
- **Frontend**: HTML5, CSS3, Vanilla JS
