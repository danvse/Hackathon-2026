# Production Specification & Implementation Guide
## Automotive Parts Price Comparison Dashboard

**Document Version:** 1.0.0  
**Target Environment:** Production  
**Last Updated:** October 2026  
**Scope:** Mercedes-Benz & Multi-Make Aftermarket/OEM Parts Comparison  

---

## 1. Executive Summary & Product Vision

### 1.1 Problem Statement
Vehicle owners, independent repair shops, and enthusiasts frequently overpay for replacement car parts due to the lack of transparent price comparison between **Original Equipment Manufacturer (OEM / Genuine)** parts and **Tier-1 Aftermarket** equivalents (Brembo, Bosch, Bilstein, Continental, Mahle). Furthermore, parts fitment is complex and confusing across model years.

### 1.2 Objective
Build an intuitive, fast, production-grade Web Dashboard that ingests multi-vendor automotive parts data, allows multi-vehicle price comparison, visualizes price differences/trends across vehicle trims and years, and drives conversions with one-click direct retailer navigation.

---

## 2. Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                 USER CLIENT (Web)                                 |
|   Responsive UI: Next.js 14 / Streamlit | Dark & Light Mode | Mobile-Friendly     |
+-----------------------------------------------------------------------------------+
                                         │
                         HTTPS / REST / WebSocket
                                         ▼
+-----------------------------------------------------------------------------------+
|                                APPLICATION SERVER                                 |
|  - Fast API Endpoints: /api/parts, /api/trends, /api/brands                       |
|  - In-Memory Analytics: DuckDB / SQLite (WAL) / PostgreSQL                        |
|  - Outbound Link Handler & UTM Tracker (Link Forwarding)                         |
+-----------------------------------------------------------------------------------+
                                         ▲
                                         │ Incremental Sync (Cron)
+-----------------------------------------------------------------------------------+
|                              DATA PIPELINE / STORAGE                              |
|  - Ingestion Engine: `collect_mercedes_parts.py` (curl_cffi Stealth Scraping)     |
|  - Flat Storage: `mercedes_parts_data.csv` -> Parquet / Database Cache           |
|  - Automatic deduplication & schema validation                                    |
+-----------------------------------------------------------------------------------+
```

### 2.1 Technology Options

| Component | Enterprise Angular Stack (Production) | Fast Prototyping Stack |
| :--- | :--- | :--- |
| **Frontend** | Angular 22 (Standalone Components + Signals) | Streamlit / Dash with Custom CSS |
| **Charts** | Chart.js / Canvas Interactive Visuals | Plotly Python Visuals |
| **Data Engine** | In-Memory JSON Cache / DuckDB / REST API | Pandas / DuckDB |
| **State / Cache** | Angular Signals (`computed`, `effect`) | `@st.cache_data` / LocalStorage |
| **Data Feed** | Scheduled Python Worker (`collect_mercedes_parts.py`) | Local Cron / Systemd Timer |

---

## 3. Data Schema & Model Specification

The dashboard ingests the normalized schema output by `collect_mercedes_parts.py`:

```sql
CREATE TABLE parts_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make VARCHAR(50) NOT NULL,              -- e.g. "Mercedes-Benz"
    model VARCHAR(50) NOT NULL,             -- e.g. "C300", "E350", "GLC300"
    year INT NOT NULL,                      -- e.g. 2018, 2020
    part_category VARCHAR(100) NOT NULL,    -- e.g. "Brake Pads", "Alternator"
    part_name TEXT NOT NULL,                -- e.g. "Mercedes Brake Pad Kit - Genuine"
    brand VARCHAR(100) NOT NULL,            -- e.g. "Genuine Mercedes", "Brembo", "Bosch"
    brand_tier VARCHAR(20),                 -- "OEM", "Tier-1 Premium", "Standard"
    sku VARCHAR(100) NOT NULL,              -- Vendor internal SKU
    part_number VARCHAR(100),               -- Standard 10-digit OEM interchange #
    price_usd NUMERIC(10, 2) NOT NULL,      -- Normalized price in USD
    product_url TEXT NOT NULL,              -- Canonical outbound product link
    image_url TEXT,                         -- Part photo asset
    source VARCHAR(50) NOT NULL,            -- e.g. "FCP Euro", "RockAuto", "AutoZone"
    collected_at TIMESTAMP WITH TIME ZONE   -- Freshness tracking
);

CREATE INDEX idx_fitment ON parts_inventory(make, model, year, part_category);
CREATE INDEX idx_part_num ON parts_inventory(part_number);
```

---

## 4. Key Functional Features & Specifications

### 4.1 Comparison Table with Direct Outbound Navigation
* **Actionable Retailer Links**: Every part listing card or row includes a distinct **"Buy at Retailer"** or **"View Part"** action button.
* **Link Safety & Security**: Outbound links open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
* **Deep Linking**: Directs users directly to the checkout or product SKU page, not generic landing pages.
* **Affiliate / Analytics Tracking**: Wrap product links with an internal redirect (e.g., `/redirect?vendor=fcpeuro&sku=KIT-0004209100`) for tracking outbound clicks and analytics.

### 4.2 Interactive Line Graph: Price Trends & Model Differences
* **Trend & Spread Plotting**:
  * **X-Axis**: Models / Generations / Years (e.g., `2018 C300` $\rightarrow$ `2020 C300` $\rightarrow$ `2018 E350` $\rightarrow$ `2020 E350`).
  * **Y-Axis**: Price in USD (\$).
  * **Series / Legend**:
    * Solid Line: **OEM Benchmark (Genuine Mercedes)**.
    * Dashed Line: **Average Aftermarket Price**.
    * Shaded Area: **Minimum to Maximum Market Price Spread**.
* **Tooltip Data**: Hovering over points reveals:
  * Brand Name
  * Specific Part #
  * Price difference vs OEM (\$ and %)

### 4.3 High-Value Quality of Life (QoL) Features
1. **OEM vs. Aftermarket Savings Calculator**:
   * Prominently displays the dollar amount saved by choosing high-tier aftermarket brands (e.g., *“Save \$396.15 (81%) choosing Akebono over Genuine Mercedes”*).
2. **Multi-Model Side-by-Side Comparison**:
   * Users can select two models simultaneously (e.g., `C300` vs `E350`) to evaluate maintenance cost differences before buying a vehicle.
3. **Smart Search & Autocomplete**:
   * Search by Part Name, Brand, or 10-digit Mercedes OEM part number (e.g. `0004209100`).
4. **Export to CSV / Mechanic Quote PDF**:
   * Generates a printable parts list with part numbers, quantities, estimated prices, and vendor links to bring to an independent mechanic.
5. **Client-Side Saved Parts / Watchlist**:
   * Users can click a "Save / Bookmark" icon to build their shopping list stored in `localStorage`.
6. **Responsive Thumbnail Image Preview**:
   * Mouse-over zoom or modal popup showing exact part images to verify electrical connectors, bolt patterns, and brackets.

---

## 5. UI/UX Wireframe & Layout

```
+----------------------------------------------------------------------------------------------------+
|  [LOGO] AutopartsPulse | Mercedes-Benz Price Comparison                   [Theme] [Saved (3)]     |
+----------------------------------------------------------------------------------------------------+
|  FILTERS:                                                                                          |
|  [ Model: C300 v ]  [ Year: 2018 v ]  [ Category: Brake Pads v ]  [ Tier: All v ]  [ Search: ____ ]|
+----------------------------------------------------------------------------------------------------+
|  METRIC CARDS:                                                                                     |
|  +--------------------+  +--------------------+  +--------------------+  +-----------------------+ |
|  |  OEM Genuine Price |  | Avg Aftermarket    |  | Max Potential Save |  | Available Options     | |
|  |      $486.14       |  |      $89.99        |  |  $396.15 (-81.5%)  |  |   8 Brands In Stock   | |
|  +--------------------+  +--------------------+  +--------------------+  +-----------------------+ |
+----------------------------------------------------------------------------------------------------+
|  PRICE TRENDS & SPREAD (Line & Area Chart)                                                         |
|   Price ($)                                                                                        |
|   $500 ┼─────────● (OEM Genuine: $486)                                                             |
|   $300 ┼               ▲                                                                           |
|   $100 ┼───────■───▲───┼───■ (Aftermarket Average: $89.99)                                         |
|     $0 ┼───────┴───┴───┴───┴───────                                                                |
|       C300 (2018)    C300 (2020)    E350 (2018)    E350 (2020)                                    |
+----------------------------------------------------------------------------------------------------+
|  COMPARISON TABLE:                                                                                 |
|  | Img | Brand        | Part Name & SKU              | Tier   | Price   | Savings | Action       | |
|  |-----+--------------+------------------------------+--------+---------+---------+--------------| |
|  | [x] | Genuine MB   | Brake Pad Kit (0004209100)   | OEM    | $486.14 |   ---   | [Visit Store]| |
|  | [x] | Akebono      | Ceramic Pad Set (EUR986)     | Tier-1 |  $89.99 | -$396.15| [Visit Store]| |
|  | [x] | Pagid        | Brake Pad Set (0074205820)   | Tier-1 |  $80.99 | -$405.15| [Visit Store]| |
+----------------------------------------------------------------------------------------------------+
```

---

## 6. Implementation Reference: Streamlit Dashboard Code

Below is the turnkey, production-ready implementation that directly consumes `mercedes_parts_data.csv`:

```python
# app.py - Production-Ready Auto Parts Comparison Dashboard
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os

st.set_page_config(
    page_title="Mercedes-Benz Parts Price Comparison",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 1. Load & Cache Data
@st.cache_data(ttl=600)
def load_data(csv_path="mercedes_parts_data.csv"):
    if not os.path.exists(csv_path):
        return pd.DataFrame()
    df = pd.read_csv(csv_path)
    # Categorize brand tier
    df["tier"] = df["brand"].apply(
        lambda b: "OEM (Genuine)" if "Genuine" in str(b) else "Aftermarket"
    )
    return df

df = load_data()

if df.empty:
    st.error("No data found! Run collect_mercedes_parts.py first.")
    st.stop()

# 2. Sidebar Filter Controls
st.sidebar.title("🔍 Fitment & Filters")
model_list = sorted(df["model"].unique().tolist())
selected_model = st.sidebar.selectbox("Select Model", model_list, index=0)

year_list = sorted(df[df["model"] == selected_model]["year"].unique().tolist())
selected_year = st.sidebar.selectbox("Select Year", year_list, index=0)

category_list = sorted(df["part_category"].unique().tolist())
selected_category = st.sidebar.selectbox("Part Category", category_list, index=0)

brand_options = ["All Brands"] + sorted(df["brand"].unique().tolist())
selected_brand = st.sidebar.selectbox("Filter Brand", brand_options)

search_term = st.sidebar.text_input("Search Part # or Keyword", "").strip().lower()

# 3. Filter Dataset
filtered = df[
    (df["model"] == selected_model) &
    (df["year"] == selected_year) &
    (df["part_category"] == selected_category)
]

if selected_brand != "All Brands":
    filtered = filtered[filtered["brand"] == selected_brand]

if search_term:
    filtered = filtered[
        filtered["part_name"].str.lower().str.contains(search_term) |
        filtered["part_number"].astype(str).str.contains(search_term) |
        filtered["brand"].str.lower().str.contains(search_term)
    ]

# 4. Header & Top Metrics
st.title(f"🚗 {selected_year} Mercedes-Benz {selected_model} — {selected_category}")
st.caption("Live comparison between OEM Genuine parts and Tier-1 aftermarket brands.")

col1, col2, col3, col4 = st.columns(4)

oem_parts = filtered[filtered["tier"] == "OEM (Genuine)"]
aftermarket_parts = filtered[filtered["tier"] == "Aftermarket"]

oem_price = oem_parts["price_usd"].min() if not oem_parts.empty else None
best_aftermarket_price = aftermarket_parts["price_usd"].min() if not aftermarket_parts.empty else None

with col1:
    st.metric("OEM Genuine Price", f"${oem_price:.2f}" if oem_price else "N/A")
with col2:
    st.metric("Best Aftermarket", f"${best_aftermarket_price:.2f}" if best_aftermarket_price else "N/A")
with col3:
    if oem_price and best_aftermarket_price:
        savings = oem_price - best_aftermarket_price
        pct = (savings / oem_price) * 100
        st.metric("Max Savings", f"${savings:.2f}", f"-{pct:.1f}%")
    else:
        st.metric("Max Savings", "N/A")
with col4:
    st.metric("Available Options", f"{len(filtered)} parts")

st.markdown("---")

# 5. Interactive Price Trend & Differences Graph
st.subheader("📈 Price Trends & Cross-Model Comparison")

trend_df = df[df["part_category"] == selected_category].copy()
trend_df["vehicle"] = trend_df["year"].astype(str) + " " + trend_df["model"]

trend_summary = trend_df.groupby(["vehicle", "tier"])["price_usd"].mean().reset_index()

fig = px.line(
    trend_summary,
    x="vehicle",
    y="price_usd",
    color="tier",
    markers=True,
    title=f"Average Price Trend for '{selected_category}' by Vehicle Platform",
    labels={"vehicle": "Vehicle Platform", "price_usd": "Average Price (USD)", "tier": "Part Tier"},
    color_discrete_map={"OEM (Genuine)": "#e63946", "Aftermarket": "#1d3557"}
)
fig.update_layout(template="plotly_white", hovermode="x unified", height=380)
st.plotly_chart(fig, use_container_width=True)

# 6. Detailed Comparison Table with Clickable Retailer Navigation
st.subheader("🛒 Part Listings & Direct Store Links")

if filtered.empty:
    st.info("No parts match the selected filters.")
else:
    # Format table for display
    display_df = filtered.sort_values(by="price_usd", ascending=True).copy()
    
    for idx, row in display_df.iterrows():
        with st.container():
            c_img, c_info, c_price, c_btn = st.columns([1, 4, 2, 2])
            
            with c_img:
                if pd.notna(row["image_url"]) and str(row["image_url"]).startswith("http"):
                    st.image(row["image_url"], width=80)
                else:
                    st.write("📦")
            
            with c_info:
                st.markdown(f"**{row['part_name']}**")
                st.caption(f"Brand: **{row['brand']}** | Part #: `{row['part_number']}` | SKU: `{row['sku']}`")
                if row["tier"] == "OEM (Genuine)":
                    st.markdown("⭐ *Genuine OEM Quality*")
                else:
                    st.markdown("🔧 *Certified Aftermarket*")

            with c_price:
                st.markdown(f"### ${row['price_usd']:.2f}")
                if oem_price and row["tier"] != "OEM (Genuine)":
                    diff = oem_price - row["price_usd"]
                    if diff > 0:
                        st.caption(f"🟢 Save ${diff:.2f} vs OEM")

            with c_btn:
                st.write("")
                st.link_button("View on Retailer ↗", row["product_url"], use_container_width=True)
            
            st.divider()
```

---

## 7. Production Deployment & Operationalization

### 7.1 Automated Data Ingestion (Cron / GitHub Actions)
To keep the dataset constantly fresh in production:
* Schedule `collect_mercedes_parts.py` to run weekly (e.g., Sundays at 02:00 UTC).
* Run with the `--overwrite` flag or allow deduplicated appends to track historical prices.

### 7.2 Hosting & CDN Deployment
1. **Frontend / App Server**: Deploy via **Docker** on AWS ECS / DigitalOcean App Platform or Streamlit Cloud.
2. **Reverse Proxy & SSL**: Nginx with Let's Encrypt SSL and Cloudflare CDN caching for static image assets.
3. **Database Migration**:
   * Migrate CSV storage to **PostgreSQL** or **DuckDB** once volume exceeds 50,000 parts.
