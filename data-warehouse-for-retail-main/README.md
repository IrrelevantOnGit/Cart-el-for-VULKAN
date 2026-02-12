# Data Warehouse for Retail (DuckDB)

This project simulates a star-schema data warehouse for a retail business.
It includes one fact table (`fact_sales`) and four dimensions (`dim_product`,
`dim_customer`, `dim_store`, `dim_date`) for analytics and KPI reporting.

## Tech and SQL dialect

- Database: DuckDB (serverless, local file or in-memory)
- SQL dialect: DuckDB SQL

## Project structure

```text
data-warehouse-for-retail-main/
|-- sql/
|   |-- 01_create_star_schema.sql
|   |-- 02_insert_mock_data.sql
|   `-- 03_kpi_queries.sql
|-- data/
|   |-- fact_sales.csv
|   |-- dim_customer.csv
|   |-- dim_date.csv
|   |-- dim_product.csv
|   `-- dim_store.csv
`-- images/
```

## What was fixed

- Aligned `dim_date` schema with insert/query columns.
- Switched `is_weekend` to `BOOLEAN` for DuckDB.
- Replaced `TOP 3` with `LIMIT 3` in KPI query.
- Kept optional columns in `dim_customer` and `dim_store` nullable so current
  inserts work without extra values.

## How to run

### Option A: Run with Python DuckDB package

1. Install:

```powershell
python -m pip install duckdb
```

2. Execute all SQL files:

```powershell
python - <<'PY'
import duckdb
from pathlib import Path

base = Path("data-warehouse-for-retail-main")
con = duckdb.connect()

for f in ["sql/01_create_star_schema.sql", "sql/02_insert_mock_data.sql"]:
    con.execute((base / f).read_text())

queries = (base / "sql/03_kpi_queries.sql").read_text().split(";")
for i, q in enumerate([x.strip() for x in queries if x.strip()], start=1):
    print(f"\n--- Query {i} ---")
    print(con.execute(q).fetchdf())
PY
```

### Option B: DuckDB CLI (if installed)

```powershell
duckdb retail.duckdb
```

Then inside DuckDB:

```sql
.read sql/01_create_star_schema.sql
.read sql/02_insert_mock_data.sql
.read sql/03_kpi_queries.sql
```

## Current KPIs included

- Top products by revenue
- Sales by region
- Weekday vs weekend sales
- Monthly sales trend
- Revenue by store
- Customer lifetime value

## Suggested next improvements

1. Add realistic data volumes:
   - Generate 100k+ `fact_sales` rows and richer dimension values.
2. Add production-style constraints:
   - Add `NOT NULL` and `CHECK` constraints.
3. Add indexes for performance:
   - Add indexes on fact foreign keys and date.
4. Add cost and margin modeling:
   - Add `unit_cost` and gross margin KPIs.
5. Add ETL/ELT flow:
   - Load CSV files into staging tables, then merge into dimensions/facts.
6. Add dbt models and tests:
   - Source freshness, uniqueness, relationship, and accepted-values tests.
7. Add BI layer:
   - Build a Power BI or Streamlit dashboard over KPI outputs.

