"""
Mercedes-Benz Car Parts Price Collector
=======================================
Safely collects real-world auto parts pricing data across the top 10 most
common maintenance and replacement categories for Mercedes-Benz vehicles.

Features:
- Safe Web Scraping: Uses TLS fingerprint impersonation (Chrome 124) via curl_cffi.
- Polite crawling: Randomized delay intervals to avoid rate limits or IP bans.
- Fault tolerant: Progress is flushed directly to CSV on every batch.
- Outputs rich schema ready for price comparison dashboards and analytics.
"""

import os
import re
import csv
import time
import random
import argparse
from datetime import datetime
import urllib.parse
from bs4 import BeautifulSoup
from curl_cffi import requests

# Top 10 Most Common Car Maintenance & Wear Parts
TOP_10_PARTS = [
    {
        "category": "Brake Pads",
        "query": "Brake Pads",
        "description": "Front/Rear brake friction pads, high wear replacement every 30k-50k mi"
    },
    {
        "category": "Brake Rotors",
        "query": "Brake Rotors",
        "description": "Disc brake rotors, replaced every 50k-70k mi alongside pads"
    },
    {
        "category": "Oil Filter",
        "query": "Oil Filter",
        "description": "Engine oil filter element/housing, replaced at every oil service (5k-10k mi)"
    },
    {
        "category": "Air Filter",
        "query": "Air Filter",
        "description": "Engine combustion intake air filter, replaced every 15k-30k mi"
    },
    {
        "category": "Cabin Air Filter",
        "query": "Cabin Air Filter",
        "description": "Interior HVAC pollen/charcoal filter, replaced every 15k-20k mi"
    },
    {
        "category": "Spark Plugs",
        "query": "Spark Plug",
        "description": "Ignition spark plugs, replaced every 50k-100k mi"
    },
    {
        "category": "Battery",
        "query": "Battery",
        "description": "12V AGM main/auxiliary starting battery, replaced every 3-5 years"
    },
    {
        "category": "Alternator",
        "query": "Alternator",
        "description": "Charging system generator, critical electrical wear component"
    },
    {
        "category": "Serpentine Belt",
        "query": "Serpentine Belt",
        "description": "Accessory drive belt powering alternator, AC, and water pump"
    },
    {
        "category": "Shock Absorbers",
        "query": "Shock Absorber",
        "description": "Suspension struts and dampers, replaced every 60k-80k mi"
    }
]

DEFAULT_MODELS = ["C300", "E350", "GLC300"]
DEFAULT_YEARS = ["2018", "2020"]
BASE_URL = "https://www.fcpeuro.com"
SEARCH_URL = f"{BASE_URL}/Mercedes-Benz-parts/"

CSV_COLUMNS = [
    "make",
    "model",
    "year",
    "part_category",
    "part_name",
    "brand",
    "sku",
    "part_number",
    "price_usd",
    "product_url",
    "image_url",
    "source",
    "collected_at"
]


def extract_part_number(name: str, sku: str) -> str:
    """Extracts raw Mercedes or manufacturer part number from string."""
    # Often in format 10 digits (e.g. 0004209100) or preceded by brand name
    match = re.search(r'\b\d{10}\b', f"{name} {sku}")
    if match:
        return match.group(0)
    # Check for Mercedes style with hyphen (e.g., 000-420-91-00)
    match_hyphen = re.search(r'\b\d{3}-\d{3}-\d{2}-\d{2}\b', f"{name} {sku}")
    if match_hyphen:
        return match_hyphen.group(0)
    # Fallback to stripped SKU
    clean_sku = sku.replace("KIT-", "").replace("BRE-", "").replace("HEN-", "")
    return clean_sku


def fetch_category_parts(make: str, model: str, year: str, part_info: dict, max_items: int = 10):
    """
    Safely queries parts catalog using Chrome TLS fingerprint impersonation.
    """
    params = {
        "year": year,
        "model": model,
        "keywords": part_info["query"]
    }
    qs = urllib.parse.urlencode(params)
    target_url = f"{SEARCH_URL}?{qs}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.fcpeuro.com/",
    }

    try:
        response = requests.get(
            target_url,
            headers=headers,
            impersonate="chrome124",
            timeout=20
        )
        if response.status_code != 200:
            print(f"  [!] HTTP {response.status_code} for {part_info['category']} ({year} {model})")
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        part_cards = soup.find_all(attrs={"data-product-id": True})
        
        results = []
        now_iso = datetime.now().isoformat()

        for card in part_cards[:max_items]:
            raw_brand = card.get("data-brand", "").strip() or "Unknown"
            raw_name = card.get("data-name", "").strip() or "Unnamed Part"
            raw_price = card.get("data-price", "0.00").strip()
            raw_sku = card.get("data-sku", "").strip()
            
            try:
                price_float = round(float(raw_price), 2)
            except ValueError:
                price_float = 0.0

            # Product link
            link_tag = card.select_one("a.hit__name")
            product_path = link_tag.get("href", "") if link_tag else ""
            product_url = f"{BASE_URL}{product_path}" if product_path.startswith("/") else product_path

            # Image
            img_tag = card.select_one("img")
            img_url = img_tag.get("src", "") if img_tag else ""

            part_num = extract_part_number(raw_name, raw_sku)

            results.append({
                "make": make,
                "model": model,
                "year": year,
                "part_category": part_info["category"],
                "part_name": raw_name,
                "brand": raw_brand,
                "sku": raw_sku,
                "part_number": part_num,
                "price_usd": price_float,
                "product_url": product_url,
                "image_url": img_url,
                "source": "FCP Euro",
                "collected_at": now_iso
            })

        return results

    except Exception as exc:
        print(f"  [X] Error scraping {part_info['category']} ({year} {model}): {exc}")
        return []


def run_collection(models, years, output_csv, max_items_per_cat=8, delay_range=(1.5, 3.0), overwrite=False):
    """Main collection pipeline with polite delays, deduplication, and incremental CSV persistence."""
    print("=" * 70)
    print("  MERCEDES-BENZ PARTS PRICE DATA COLLECTOR")
    print("=" * 70)
    print(f"  Target Make       : Mercedes-Benz")
    print(f"  Target Models     : {', '.join(models)}")
    print(f"  Target Years      : {', '.join(years)}")
    print(f"  Part Categories   : {len(TOP_10_PARTS)} common parts")
    print(f"  Output CSV File   : {output_csv}")
    print(f"  Max Items/Category: {max_items_per_cat}")
    print("=" * 70)

    seen_keys = set()
    file_exists = os.path.exists(output_csv) and not overwrite

    if file_exists:
        try:
            with open(output_csv, mode="r", encoding="utf-8") as rf:
                reader = csv.DictReader(rf)
                for r in reader:
                    seen_keys.add((r.get("sku"), r.get("model"), r.get("year")))
            print(f"[*] Found existing CSV with {len(seen_keys)} entries. Resuming without duplicates.")
        except Exception:
            pass

    total_new_records = 0
    mode = "w" if overwrite or not file_exists else "a"

    with open(output_csv, mode=mode, newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        if mode == "w":
            writer.writeheader()
            f.flush()

        for model in models:
            for year in years:
                print(f"\n>>> Collecting for {year} Mercedes-Benz {model}...")
                for part_info in TOP_10_PARTS:
                    category = part_info["category"]
                    print(f"    Fetching {category:<18} ... ", end="", flush=True)

                    items = fetch_category_parts(
                        make="Mercedes-Benz",
                        model=model,
                        year=year,
                        part_info=part_info,
                        max_items=max_items_per_cat
                    )

                    new_items = []
                    for item in items:
                        key = (item["sku"], item["model"], item["year"])
                        if key not in seen_keys:
                            seen_keys.add(key)
                            new_items.append(item)

                    if new_items:
                        for item in new_items:
                            writer.writerow(item)
                        f.flush()
                        total_new_records += len(new_items)
                        min_p = min(i['price_usd'] for i in new_items)
                        max_p = max(i['price_usd'] for i in new_items)
                        print(f"Done (+{len(new_items)} new parts, ${min_p:.2f} - ${max_p:.2f})")
                    else:
                        print("Done (all items already up to date).")

                    # Polite jitter delay between requests
                    sleep_time = random.uniform(*delay_range)
                    time.sleep(sleep_time)

    print("\n" + "=" * 70)
    print(f"  COLLECTION COMPLETE!")
    print(f"  Total new records added: {total_new_records}")
    print(f"  Total records in dataset: {len(seen_keys)}")
    print(f"  Saved to file: {os.path.abspath(output_csv)}")
    print("=" * 70)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Collect Mercedes-Benz parts price data safely into CSV.")
    parser.add_argument("--models", nargs="+", default=DEFAULT_MODELS, help="List of Mercedes models (e.g. C300 E350 GLC300)")
    parser.add_argument("--years", nargs="+", default=DEFAULT_YEARS, help="List of model years (e.g. 2018 2020)")
    parser.add_argument("--output", default="mercedes_parts_data.csv", help="Path to destination CSV file")
    parser.add_argument("--max-items", type=int, default=8, help="Maximum parts per category")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing CSV rather than appending")
    parser.add_argument("--quick-demo", action="store_true", help="Run a quick 1-model, 1-year collection run")

    args = parser.parse_args()

    target_models = ["C300"] if args.quick_demo else args.models
    target_years = ["2018"] if args.quick_demo else args.years
    items_limit = 5 if args.quick_demo else args.max_items

    run_collection(
        models=target_models,
        years=target_years,
        output_csv=args.output,
        max_items_per_cat=items_limit,
        overwrite=args.overwrite
    )
