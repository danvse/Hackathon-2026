"""
Mercedes-Benz Car Parts Price Comparison Dashboard
==================================================
Production-ready interactive web dashboard to compare OEM vs Aftermarket
car part prices, visualize price differentials/trends, and deep link
directly to verified retailers.
"""

import os
import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="Mercedes-Benz Parts Price Comparison",
    page_icon="🚘",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for polished production feel
st.markdown("""
<style>
    .metric-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 15px;
        border-left: 5px solid #0066cc;
    }
    .badge-oem {
        background-color: #fee2e2;
        color: #991b1b;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    .badge-aftermarket {
        background-color: #e0f2fe;
        color: #0369a1;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_data(ttl=600)
def load_data(csv_file="mercedes_parts_data.csv"):
    if not os.path.exists(csv_file):
        return pd.DataFrame()
    df = pd.read_csv(csv_file)
    df["tier"] = df["brand"].apply(
        lambda b: "OEM (Genuine)" if "Genuine" in str(b) else "Aftermarket"
    )
    return df


df = load_data()

if df.empty:
    st.error("No parts data found! Please ensure `mercedes_parts_data.csv` is in the directory.")
    st.stop()

# -------------------------------------------------------------
# SIDEBAR FILTERS
# -------------------------------------------------------------
st.sidebar.image("https://img.icons8.com/color/96/mercedes-benz.png", width=64)
st.sidebar.title("Part Search & Filters")

# Vehicle Model & Year
models = sorted(df["model"].unique().tolist())
selected_model = st.sidebar.selectbox("Vehicle Model", models, index=0)

years = sorted(df[df["model"] == selected_model]["year"].unique().tolist())
selected_year = st.sidebar.selectbox("Model Year", years, index=0)

# Part Category
categories = sorted(df["part_category"].unique().tolist())
selected_category = st.sidebar.selectbox("Part Category", categories, index=0)

# Brand Filter
available_brands = ["All Brands"] + sorted(df[
    (df["model"] == selected_model) & 
    (df["year"] == selected_year) & 
    (df["part_category"] == selected_category)
]["brand"].unique().tolist())
selected_brand = st.sidebar.selectbox("Brand Filter", available_brands)

# Tier Filter
tier_filter = st.sidebar.radio("Part Tier", ["All", "OEM (Genuine) Only", "Aftermarket Only"], index=0)

# Keyword / Part Number Search
search_query = st.sidebar.text_input("Search Part # or Keyword", "").strip().lower()

st.sidebar.markdown("---")
st.sidebar.caption("Data source: FCP Euro / OEM Catalog  \nUpdated: October 2026")

# -------------------------------------------------------------
# FILTER LOGIC
# -------------------------------------------------------------
filtered = df[
    (df["model"] == selected_model) &
    (df["year"] == selected_year) &
    (df["part_category"] == selected_category)
].copy()

if selected_brand != "All Brands":
    filtered = filtered[filtered["brand"] == selected_brand]

if tier_filter == "OEM (Genuine) Only":
    filtered = filtered[filtered["tier"] == "OEM (Genuine)"]
elif tier_filter == "Aftermarket Only":
    filtered = filtered[filtered["tier"] == "Aftermarket"]

if search_query:
    filtered = filtered[
        filtered["part_name"].str.lower().str.contains(search_query) |
        filtered["part_number"].astype(str).str.contains(search_query) |
        filtered["sku"].str.lower().str.contains(search_query) |
        filtered["brand"].str.lower().str.contains(search_query)
    ]

# -------------------------------------------------------------
# HEADER & KPI METRICS
# -------------------------------------------------------------
st.title(f"🚘 {selected_year} Mercedes-Benz {selected_model}")
st.subheader(f"Price Comparison: {selected_category}")
st.caption("Side-by-side market pricing between OEM Genuine parts and certified aftermarket manufacturers.")

# Calculate Metrics
category_subset = df[
    (df["model"] == selected_model) &
    (df["year"] == selected_year) &
    (df["part_category"] == selected_category)
]
oem_subset = category_subset[category_subset["tier"] == "OEM (Genuine)"]
aftermarket_subset = category_subset[category_subset["tier"] == "Aftermarket"]

oem_min = oem_subset["price_usd"].min() if not oem_subset.empty else None
aftermarket_min = aftermarket_subset["price_usd"].min() if not aftermarket_subset.empty else None
aftermarket_avg = aftermarket_subset["price_usd"].mean() if not aftermarket_subset.empty else None

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        label="⭐ OEM Genuine Price",
        value=f"${oem_min:.2f}" if oem_min else "N/A",
        help="Price for original Mercedes-Benz branded factory replacement."
    )

with col2:
    st.metric(
        label="🔧 Best Aftermarket Price",
        value=f"${aftermarket_min:.2f}" if aftermarket_min else "N/A",
        help="Lowest price available from quality aftermarket tier."
    )

with col3:
    if oem_min and aftermarket_min:
        savings = oem_min - aftermarket_min
        savings_pct = (savings / oem_min) * 100
        st.metric(
            label="💰 Maximum Potential Savings",
            value=f"${savings:.2f}",
            delta=f"-{savings_pct:.1f}% vs OEM",
            delta_color="inverse"
        )
    else:
        st.metric(label="💰 Maximum Potential Savings", value="N/A")

with col4:
    st.metric(
        label="📦 Options Available",
        value=f"{len(filtered)} parts",
        help="Number of parts matching your current filters."
    )

st.markdown("---")

# -------------------------------------------------------------
# VISUALIZATIONS: TRENDS & PRICE DIFFERENTIALS
# -------------------------------------------------------------
col_chart1, col_chart2 = st.columns([3, 2])

with col_chart1:
    st.markdown("### 📈 Price Trend Across Vehicle Platforms")
    # Multi-vehicle trend comparison for selected category
    cat_all_models = df[df["part_category"] == selected_category].copy()
    cat_all_models["platform"] = cat_all_models["year"].astype(str) + " " + cat_all_models["model"]

    trend_agg = cat_all_models.groupby(["platform", "tier"])["price_usd"].mean().reset_index()

    fig_line = px.line(
        trend_agg,
        x="platform",
        y="price_usd",
        color="tier",
        markers=True,
        title=f"Average Price by Vehicle Platform ({selected_category})",
        labels={"platform": "Vehicle", "price_usd": "Average Price ($ USD)", "tier": "Category"},
        color_discrete_map={"OEM (Genuine)": "#e11d48", "Aftermarket": "#0284c7"}
    )
    fig_line.update_traces(line=dict(width=3), marker=dict(size=8))
    fig_line.update_layout(
        template="plotly_white",
        hovermode="x unified",
        margin=dict(l=20, r=20, t=40, b=20),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    st.plotly_chart(fig_line, use_container_width=True)

with col_chart2:
    st.markdown("### 📊 Brand Price Spread")
    if not filtered.empty:
        fig_bar = px.bar(
            filtered.sort_values("price_usd", ascending=True),
            x="price_usd",
            y="brand",
            color="tier",
            orientation="h",
            title=f"Price by Brand ({selected_model})",
            labels={"price_usd": "Price ($ USD)", "brand": "Brand"},
            color_discrete_map={"OEM (Genuine)": "#e11d48", "Aftermarket": "#0284c7"}
        )
        fig_bar.update_layout(
            template="plotly_white",
            margin=dict(l=20, r=20, t=40, b=20),
            showlegend=False
        )
        st.plotly_chart(fig_bar, use_container_width=True)
    else:
        st.info("No parts available to plot.")

st.markdown("---")

# -------------------------------------------------------------
# COMPARISON TABLE & DIRECT RETAILER LINKS
# -------------------------------------------------------------
st.markdown("### 🛒 Part Comparison & Direct Store Links")
st.caption("Click 'View on Retailer ↗' to jump directly to the verified product page with full fitment guarantee.")

if filtered.empty:
    st.warning("No parts match the selected filters. Try broadening your criteria.")
else:
    # Sort order selector
    sort_choice = st.selectbox(
        "Sort By",
        ["Price: Low to High", "Price: High to Low", "Brand: A to Z"],
        index=0
    )

    if sort_choice == "Price: Low to High":
        display_list = filtered.sort_values("price_usd", ascending=True)
    elif sort_choice == "Price: High to Low":
        display_list = filtered.sort_values("price_usd", ascending=False)
    else:
        display_list = filtered.sort_values("brand", ascending=True)

    for idx, row in display_list.iterrows():
        with st.container():
            c_img, c_details, c_pricing, c_action = st.columns([1, 4, 2, 2])

            with c_img:
                if pd.notna(row["image_url"]) and str(row["image_url"]).startswith("http"):
                    st.image(row["image_url"], width=85)
                else:
                    st.write("📦")

            with c_details:
                st.markdown(f"**{row['part_name']}**")
                
                # Badge & Details
                tier_badge = "badge-oem" if row["tier"] == "OEM (Genuine)" else "badge-aftermarket"
                st.markdown(
                    f"<span class='{tier_badge}'>{row['tier']}</span> &nbsp; "
                    f"Brand: **{row['brand']}**",
                    unsafe_allow_html=True
                )
                st.caption(f"Part Number: `{row['part_number']}` | SKU: `{row['sku']}` | Source: {row['source']}")

            with c_pricing:
                st.markdown(f"### ${row['price_usd']:.2f}")
                if oem_min and row["tier"] != "OEM (Genuine)":
                    savings_diff = oem_min - row["price_usd"]
                    if savings_diff > 0:
                        st.caption(f"🟢 **Save ${savings_diff:.2f}** vs OEM")

            with c_action:
                st.write("")
                # Direct Outbound Link button with target=_blank
                st.link_button(
                    label="View on Retailer ↗",
                    url=row["product_url"],
                    use_container_width=True
                )

            st.divider()

# -------------------------------------------------------------
# QOL: EXPORT DATA
# -------------------------------------------------------------
st.markdown("### 📥 Export Parts Quote")
csv_data = filtered.to_csv(index=False).encode("utf-8")
st.download_button(
    label="Download Filtered Parts List (CSV)",
    data=csv_data,
    file_name=f"mercedes_{selected_model}_{selected_year}_{selected_category}_quote.csv",
    mime="text/csv"
)
