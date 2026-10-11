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
|   Responsive UI: Angular 22 | Standalone Components & Signals | Digital Cockpit   |
|   3D Interactive WebGL Studio (Three.js) | Dark & Studio Light Mode               |
+-----------------------------------------------------------------------------------+
                                         │
                         HTTPS / REST / WebSocket
                                         ▼
+-----------------------------------------------------------------------------------+
|                                APPLICATION SERVER                                 |
|  - REST API Endpoints: /api/decode-vin, /api/hunt-prices, /api/history           |
|  - Multi-Retailer Scraping Engine: RockAuto, AutoZone, FCP Euro, OEM Dealerships  |
|  - In-Memory Analytics: DuckDB / SQLite / JSON Datastore                          |
|  - Outbound Link Handler & Deep Retailer Navigation                               |
+-----------------------------------------------------------------------------------+
                                         ▲
                                         │ Incremental Sync (Cron)
+-----------------------------------------------------------------------------------+
|                              DATA PIPELINE / STORAGE                              |
|  - Ingestion Engine: `collect_mercedes_parts.py` & `enrich_historical_data.py`    |
|  - Flat Storage: `mercedes_parts_data.json` / `mercedes_parts_data.csv`           |
|  - Guaranteed Fitment & NHTSA VPIC Vehicle Specs Engine                           |
+-----------------------------------------------------------------------------------+
```

### 2.1 Technology Stack

| Component | Pure Angular Production Architecture |
| :--- | :--- |
| **Frontend** | Angular 22 (Standalone Components + Signals + Reactive State) |
| **3D Vehicle Studio** | Three.js (WebGL Hardware Accelerated Interactive Car Visualizer) |
| **Charts & Analytics** | Chart.js 4 (Cross-Vehicle Price Trends & Cross-Store Price Spread) |
| **Backend API** | Python Flask + Flask-CORS (`api_server.py`) |
| **State / Cache** | Angular Signals (`signal`, `computed`, `effect`) & LocalStorage |
| **Data Feed** | Real-time Multi-Retailer Web Scraper (`api_server.py`) |

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

## 6. Implementation Architecture: Angular 22 Dashboard & 3D WebGL Studio

The frontend is built as a pure, standalone Angular 22 Single Page Application located in `car-parts-dashboard/`:

### 6.1 Component Hierarchy & Modules
* **`app.ts`**: Standalone Angular component implementing reactive state management via Signals:
  - **Universal VIN Decoder**: Decodes any 17-character VIN (Toyota, Honda, Ford, BMW, Mercedes, etc.) via NHTSA VPIC API.
  - **Multi-Store Price Hunter**: Queries RockAuto, AutoZone, FCP Euro, and OEM Dealerships dynamically.
  - **KPI Telemetry Engine**: Computes OEM Benchmark, lowest aftermarket quote, arbitrage spread, and network availability.
  - **Interactive Watchlist**: Bookmarks parts with local persistence and triggers price-drop sentry alerts.
  - **Dual Chart.js Engines**: Renders Cross-Vehicle Price Trends and Cross-Store Price Spread bar charts.
* **`app.html`**: Automotive Digital Cockpit telemetry interface featuring:
  - **Precision Blueprint SVGs (`#partIcon`)**: 11 mechanical subsystem vector icons (brakes, powertrain, electrical, fluid, suspension).
  - **Radar Scope Scanner**: Animated 360° radar sweep beam with live retailer ping blips.
  - **3D Studio Canvas**: OrbitControls viewport with turntable rotation, light/dark studio background toggle, chassis X-Ray aperture, and exploded assembly view.
  - **Component Information Hub**: Deep engineering specifications, wear intervals, failure symptoms, and procurement advice.
* **`car-3d-scene.ts`**: Three.js WebGL scene engine with procedural chassis geometry, component raycasting, and studio lighting.
* **`api_server.py`**: Python Flask REST API server providing on-demand VIN decoding and multi-retailer scraping.

### 6.2 Running the Application
```bash
# 1. Start the Background Price Hunter API Server (Port 5000)
python api_server.py

# 2. Launch the Angular Web Dashboard (Port 4200)
cd car-parts-dashboard
npm start
```

---

## 7. Production Deployment & Operationalization

### 7.1 Automated Data Ingestion (Cron / GitHub Actions)
To keep the dataset constantly fresh in production:
* Schedule `collect_mercedes_parts.py` to run weekly (e.g., Sundays at 02:00 UTC).
* Run with the `--overwrite` flag or allow deduplicated appends to track historical prices.

### 7.2 Hosting & CDN Deployment
1. **Frontend / Web App**: Deploy the compiled Angular application (`dist/car-parts-dashboard`) to **Vercel**, **Cloudflare Pages**, or **AWS S3 + CloudFront CDN**.
2. **API Server**: Containerize `api_server.py` via **Docker** on AWS ECS / DigitalOcean App Platform.
3. **Reverse Proxy & SSL**: Nginx with Let's Encrypt SSL and Cloudflare CDN caching for static image assets.
4. **Database Migration**:
   * Migrate JSON / CSV flat files to **PostgreSQL** or **DuckDB** once volume exceeds 50,000 parts.

---

## 8. Real-Time Automation & Vehicle Intelligence Enhancements

### 8.1 Guaranteed Fitment VIN Decoder
* **NHTSA VPIC API Integration**: Translates 17-character VIN strings into exact chassis, trim, engine configuration (displacement, cylinder count), and drivetrain specs.
* **Fitment Verification Guardrails**: Automatically filters catalog parts to ensure compatibility and highlights verified fitment badges.

### 8.2 Historical Price Tracking & Watchlist ("Best Time to Buy")
* **Time-Series Tracking**: Maintains temporal snapshots across 30-day, 90-day, and 1-year intervals.
* **All-Time Low Flags**: Automatically highlights parts trading within 1.5% of their recorded 1-year low.
* **User Watchlist**: Users bookmark specific parts (`localStorage` persistence) and configure target price drop triggers.

### 8.3 On-Demand Price Hunter & Auto-Compiler
* **Auto-Trigger Mechanism**: When a decoded VIN or user query encounters zero catalog matches, the system triggers the live web crawler via `POST /api/hunt-prices`.
* **Dynamic Catalog Ingestion**: FCP Euro and Tier-1 distributor listings are queried in real time, classified into OEM vs. Aftermarket tiers, enriched with historical price trajectories, and seamlessly appended to the catalog.
