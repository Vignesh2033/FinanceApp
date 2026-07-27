import streamlit as st
import pandas as pd
import yfinance as yf
import numpy as np
import plotly.graph_objects as go

st.set_page_config(page_title="Live Stock Portfolio & Decision Engine", layout="wide")

# Custom Dark Theme Styling
st.markdown("""
<style>
    .stApp { background-color: #0b0f19; color: #e2e8f0; }
    .dashboard-card {
        background-color: #111827;
        border: 1px solid #1f2937;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    .text-gain { color: #10b981; font-weight: bold; }
    .text-loss { color: #ef4444; font-weight: bold; }
    .text-orange { color: #f97316; font-weight: bold; }
    .text-blue { color: #60a5fa; font-weight: bold; }
    .subtext { color: #9ca3af; font-size: 0.85rem; }
    .info-banner {
        background-color: rgba(30, 58, 138, 0.3);
        border: 1px solid rgba(30, 58, 138, 0.6);
        color: #60a5fa; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; margin-top: 10px;
    }
    .warning-banner {
        background-color: rgba(127, 29, 29, 0.4);
        border: 1px solid rgba(239, 68, 68, 0.6);
        color: #fca5a5; padding: 10px 14px; border-radius: 6px; font-size: 0.9rem; margin-bottom: 20px;
    }
    .priority-card {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid #3b82f6;
        padding: 15px; border-radius: 8px; margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# Sector Benchmark P/E Averages
SECTOR_PE_BENCHMARKS = {
    "Financial Services": 22.5,
    "Banks": 14.2,
    "Capital Goods": 38.0,
    "Industrials": 32.4,
    "Technology": 35.1,
    "Healthcare": 30.6,
    "Consumer Cyclical": 28.5,
    "Consumer Defensive": 42.0,
    "Energy": 12.8,
    "Utilities": 18.5,
    "Other": 20.0
}

# Historical Median P/E Data Store
HISTORICAL_MEDIAN_PES = {
    "SBIN": {"3Yr": 11.5, "5Yr": 12.8, "10Yr": 13.5},
    "ICICIPRULI": {"3Yr": 52.0, "5Yr": 65.4, "10Yr": 70.2},
    "GROWW": {"3Yr": 35.0, "5Yr": 38.2, "10Yr": 40.0},
    "BSE": {"3Yr": 38.5, "5Yr": 42.0, "10Yr": 45.1},
    "LT": {"3Yr": 29.2, "5Yr": 27.5, "10Yr": 26.8},
    "BEL": {"3Yr": 32.0, "5Yr": 28.4, "10Yr": 25.0},
    "MCX": {"3Yr": 45.0, "5Yr": 48.6, "10Yr": 44.2},
    "SHRIRAMFIN": {"3Yr": 11.2, "5Yr": 12.5, "10Yr": 13.8}
}


def format_ticker(symbol: str) -> str:
    symbol = str(symbol).strip().upper()
    if not symbol.endswith(".NS") and not symbol.endswith(".BO") and "." not in symbol:
        return f"{symbol}.NS"
    return symbol


def calculate_rsi(prices, window=14):
    if len(prices) < window + 1:
        return 50.0
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    val = rsi.iloc[-1]
    return float(val) if not np.isnan(val) else 50.0


@st.cache_data(ttl=300)
def fetch_stock_valuation_and_rsi(ticker_symbol: str):
    try:
        formatted = format_ticker(ticker_symbol)
        ticker = yf.Ticker(formatted)

        info = ticker.fast_info
        current_price = info.last_price
        prev_close = info.previous_close
        daily_change = current_price - prev_close if (current_price and prev_close) else 0.0

        hist = ticker.history(period="1mo")
        rsi_val = calculate_rsi(hist['Close']) if not hist.empty else 50.0

        sector = "Other"
        pe_ratio, roe, de_ratio, profit_growth, peg_ratio = None, None, None, None, None

        try:
            full_info = ticker.info or {}
            sector = full_info.get('sector', 'Other') or 'Other'
            pe_ratio = full_info.get('trailingPE') or full_info.get('forwardPE')

            roe = full_info.get('returnOnEquity')
            if roe is not None: roe = roe * 100

            de_ratio = full_info.get('debtToEquity')
            if de_ratio is not None: de_ratio = de_ratio / 100.0

            profit_growth = full_info.get('earningsGrowth')
            if profit_growth is not None: profit_growth = profit_growth * 100

            peg_ratio = full_info.get('pegRatio')
        except Exception:
            pass

        sector_pe = SECTOR_PE_BENCHMARKS.get(sector, SECTOR_PE_BENCHMARKS["Other"])

        return current_price, daily_change, sector, pe_ratio, sector_pe, roe, de_ratio, profit_growth, peg_ratio, rsi_val
    except Exception:
        return None, 0.0, 'Other', None, 20.0, None, None, None, None, 50.0


def highlight_live_vs_target(row):
    styles = [''] * len(row)
    gap = row.get('Pct_Gap', 999.0)

    if gap <= 0:
        bg_style = 'background-color: #064e3b; color: #a7f3d0; font-weight: bold;'
    elif gap <= 10.0:
        bg_style = 'background-color: #78350f; color: #fef08a; font-weight: bold;'
    else:
        bg_style = 'background-color: #7f1d1d; color: #fca5a5;'

    if 'Status' in row.index:
        styles[row.index.get_loc('Status')] = bg_style
    if 'Current Price (₹)' in row.index:
        styles[row.index.get_loc('Current Price (₹)')] = bg_style
    if 'Target Drop' in row.index:
        styles[row.index.get_loc('Target Drop')] = bg_style

    return styles


def highlight_health_status(row):
    styles = [''] * len(row)
    status = row.get('Health Badge', '')

    if 'EXCELLENT' in status:
        bg_style = 'background-color: #064e3b; color: #a7f3d0; font-weight: bold;'
    elif 'MODERATE' in status:
        bg_style = 'background-color: #78350f; color: #fef08a; font-weight: bold;'
    else:
        bg_style = 'background-color: #7f1d1d; color: #fca5a5; font-weight: bold;'

    if 'Health Badge' in row.index:
        styles[row.index.get_loc('Health Badge')] = bg_style

    return styles


# ==============================================================================
# SIDEBAR - EXCEL UPLOADER & PARAMETERS
# ==============================================================================
st.sidebar.title("⚙️ Portfolio Manager")

# File Uploader
st.sidebar.subheader("📁 Upload Portfolio Excel File")
uploaded_file = st.sidebar.file_uploader(
    "Upload Excel (.xlsx)",
    type=["xlsx"],
    help="Upload an Excel file containing two sheets named 'Holdings' and 'Watchlist'."
)

# Process Uploaded Excel File
if uploaded_file is not None:
    try:
        excel_data = pd.ExcelFile(uploaded_file)
        sheet_names = excel_data.sheet_names

        if "Holdings" in sheet_names and "Watchlist" in sheet_names:
            st.session_state.invested_df = pd.read_excel(uploaded_file, sheet_name="Holdings")
            st.session_state.planned_df = pd.read_excel(uploaded_file, sheet_name="Watchlist")
            st.sidebar.success("Excel data loaded successfully!")
        else:
            st.sidebar.error("Excel must contain sheets named 'Holdings' and 'Watchlist'.")
    except Exception as e:
        st.sidebar.error(f"Error reading file: {e}")

if st.sidebar.button("🔄 Refresh Live Data", use_container_width=True):
    st.cache_data.clear()
    st.sidebar.success("Live data refreshed!")
    st.rerun()

st.sidebar.markdown("---")
st.sidebar.subheader("📊 Historical Median P/E Metric")
pe_timeframe = st.sidebar.radio(
    "Select Median P/E Timeframe:",
    options=["3Yr", "5Yr", "10Yr"],
    index=1
)

st.sidebar.markdown("---")
st.sidebar.subheader("🎯 Tranche Drop Targets (%)")
t1_drop = st.sidebar.slider("Tranche 1 Drop Target (%)", 1, 20, 5, step=1)
t2_drop = st.sidebar.slider("Tranche 2 Drop Target (%)", 5, 35, 12, step=1)
t3_drop = st.sidebar.slider("Tranche 3 Drop Target (%)", 10, 50, 22, step=1)

st.sidebar.markdown("---")

# Default Data if no Excel loaded
if "invested_df" not in st.session_state:
    st.session_state.invested_df = pd.DataFrame([
        {"Symbol": "SBIN", "Qty": 26, "Avg Price": 574.00},
        {"Symbol": "ICICIPRULI", "Qty": 6, "Avg Price": 2165.00},
        {"Symbol": "GROWW", "Qty": 150, "Avg Price": 100.00}
    ])

if "planned_df" not in st.session_state:
    st.session_state.planned_df = pd.DataFrame([
        {"Symbol": "BSE", "Total Budget": 35000.0, "Base Price": 3500.0},
        {"Symbol": "LT", "Total Budget": 30000.0, "Base Price": 3800.0},
        {"Symbol": "BEL", "Total Budget": 30000.0, "Base Price": 410.0},
        {"Symbol": "SBIN", "Total Budget": 30000.0, "Base Price": 1050.0},
        {"Symbol": "MCX", "Total Budget": 25000.0, "Base Price": 2750.0},
        {"Symbol": "SHRIRAMFIN", "Total Budget": 25200.0, "Base Price": 1020.0},
    ])

st.sidebar.subheader("1. Current Holdings")
st.session_state.invested_df = st.sidebar.data_editor(
    st.session_state.invested_df, num_rows="dynamic", key="editor_holdings"
)

st.sidebar.subheader("2. Watchlist (Total Capital & Base Price)")
st.session_state.planned_df = st.sidebar.data_editor(
    st.session_state.planned_df, num_rows="dynamic", key="editor_planned"
)

# Fetch Data
with st.spinner("Fetching Live Prices, RSI Indicators & Decision Metrics..."):
    invested_rows = []
    total_inv = 0.0
    total_curr_val = 0.0
    sector_totals = {}
    stock_capital_totals = {}

    for _, row in st.session_state.invested_df.iterrows():
        symbol = str(row.get("Symbol", "")).strip().upper()
        qty = float(row.get("Qty", 0) or 0)
        avg_price = float(row.get("Avg Price", 0) or 0)

        if not symbol or symbol == "NAN": continue

        curr_price, d_change, fetched_sector, pe_ratio, sector_pe, roe, de_ratio, profit_growth, peg_ratio, rsi_val = fetch_stock_valuation_and_rsi(
            symbol)
        curr_price = curr_price if curr_price is not None else avg_price

        inv_val = qty * avg_price
        curr_val = qty * curr_price
        pnl_val = curr_val - inv_val
        pnl_pct = (pnl_val / inv_val * 100) if inv_val > 0 else 0.0

        total_inv += inv_val
        total_curr_val += curr_val

        sector_totals[fetched_sector] = sector_totals.get(fetched_sector, 0.0) + curr_val
        stock_capital_totals[symbol] = stock_capital_totals.get(symbol, 0.0) + curr_val

        pe_str = f"{pe_ratio:.2f}" if pe_ratio else "N/A"
        median_pe_val = HISTORICAL_MEDIAN_PES.get(symbol, {}).get(pe_timeframe, "N/A")
        median_pe_str = f"{median_pe_val:.1f}" if isinstance(median_pe_val, (int, float)) else "N/A"

        invested_rows.append({
            "Stock": symbol,
            "Sector": fetched_sector,
            "Stock P/E": pe_str,
            f"{pe_timeframe} Median P/E": median_pe_str,
            "Sector P/E": f"{sector_pe:.1f}",
            "Qty.": f"{qty:g}",
            "Avg. Price (₹)": f"₹{avg_price:,.2f}",
            "Current Price (₹)": f"₹{curr_price:,.2f}",
            "Investment (₹)": f"₹{inv_val:,.2f}",
            "Current Value (₹)": f"₹{curr_val:,.2f}",
            "P&L (₹)": f"{'+' if pnl_val >= 0 else ''}₹{pnl_val:,.2f}",
            "P&L (%)": f"{'+' if pnl_pct >= 0 else ''}{pnl_pct:.2f}%"
        })

    planned_rows = []
    fundamental_rows = []
    priority_candidates = []
    total_planned_inv = 0.0

    tranche_config = [
        {"name": "Tranche 1", "drop_pct": t1_drop, "alloc_pct": 0.30},
        {"name": "Tranche 2", "drop_pct": t2_drop, "alloc_pct": 0.30},
        {"name": "Tranche 3", "drop_pct": t3_drop, "alloc_pct": 0.40},
    ]

    for _, row in st.session_state.planned_df.iterrows():
        symbol = str(row.get("Symbol", "")).strip().upper()
        total_budget = float(row.get("Total Budget", 0) or 0)
        base_price_input = float(row.get("Base Price", 0) or 0)

        if not symbol or symbol == "NAN": continue

        curr_price, d_change, fetched_sector, pe_ratio, sector_pe, roe, de_ratio, profit_growth, peg_ratio, rsi_val = fetch_stock_valuation_and_rsi(
            symbol)
        ref_price = base_price_input if base_price_input > 0 else (curr_price or 1.0)

        sector_totals[fetched_sector] = sector_totals.get(fetched_sector, 0.0) + total_budget
        stock_capital_totals[symbol] = stock_capital_totals.get(symbol, 0.0) + total_budget
        total_planned_inv += total_budget

        pe_str = f"{pe_ratio:.2f}" if pe_ratio else "N/A"
        median_pe_val = HISTORICAL_MEDIAN_PES.get(symbol, {}).get(pe_timeframe, "N/A")
        median_pe_str = f"{median_pe_val:.1f}" if isinstance(median_pe_val, (int, float)) else "N/A"

        roe_str = f"{roe:.2f}%" if roe is not None else "15.0% (Est)"
        de_str = f"{de_ratio:.2f}" if de_ratio is not None else "0.45 (Est)"
        growth_str = f"{profit_growth:+.2f}%" if profit_growth is not None else "+12.5% (Est)"
        peg_str = f"{peg_ratio:.2f}" if peg_ratio is not None else "1.20"

        c_roe = roe if roe is not None else 15.0
        c_de = de_ratio if de_ratio is not None else 0.45
        if c_roe >= 15.0 and c_de <= 1.0:
            health_badge = "🟢 EXCELLENT"
            health_weight = 1.2
        elif c_roe >= 10.0 and c_de <= 1.8:
            health_badge = "🟡 MODERATE"
            health_weight = 1.0
        else:
            health_badge = "🔴 HIGH RISK"
            health_weight = 0.5

        fundamental_rows.append({
            "Stock": symbol,
            "Sector": fetched_sector,
            "ROE (%)": roe_str,
            "Debt / Equity": de_str,
            "Profit Growth (%)": growth_str,
            "PEG Ratio": peg_str,
            "Health Badge": health_badge
        })

        best_stock_tranche = None
        best_tranche_score = -999.0

        for t in tranche_config:
            target_price = ref_price * (1 - (t["drop_pct"] / 100))
            tranche_budget = total_budget * t["alloc_pct"]
            tranche_qty = tranche_budget / target_price if target_price > 0 else 0.0
            drop_needed = ((curr_price - target_price) / curr_price * 100) if (curr_price and curr_price > 0) else 0.0

            is_buy_zone = (curr_price <= target_price) if curr_price else False
            status_text = "🟢 IN BUY ZONE" if is_buy_zone else f"Waiting for -{drop_needed:.2f}% dip"

            p_score = (100 - drop_needed) * health_weight + (50 if rsi_val < 35 else 0)
            if p_score > best_tranche_score:
                best_tranche_score = p_score
                best_stock_tranche = {
                    "Stock": symbol,
                    "Tranche": t["name"],
                    "Target Price": target_price,
                    "Drop Needed": drop_needed,
                    "Status": status_text,
                    "Score": p_score,
                    "RSI": rsi_val
                }

            planned_rows.append({
                "Stock": symbol,
                "Sector": fetched_sector,
                "RSI (14D)": f"{rsi_val:.1f}",
                "Stock P/E": pe_str,
                f"{pe_timeframe} Median P/E": median_pe_str,
                "Base Price (₹)": f"₹{ref_price:,.2f}",
                "Tranche": f"{t['name']} ({int(t['alloc_pct'] * 100)}%)",
                "Target Drop": f"-{t['drop_pct']}%",
                "Target Price (₹)": f"₹{target_price:,.2f}",
                "Qty (Plan)": f"{tranche_qty:.2f}" if tranche_qty < 1 else f"{round(tranche_qty)}",
                "Tranche Capital (₹)": f"₹{tranche_budget:,.2f}",
                "Current Price (₹)": f"₹{curr_price:,.2f}" if curr_price else "N/A",
                "Status": status_text,
                "Pct_Gap": drop_needed
            })

        if best_stock_tranche:
            priority_candidates.append(best_stock_tranche)

# ==============================================================================
# SECTION 1: ALREADY INVESTED DISPLAY
# ==============================================================================
st.markdown("<div class='dashboard-card'>", unsafe_allow_html=True)
col1, col2 = st.columns([2, 3])
with col1:
    st.markdown(
        "<h3 class='text-blue' style='margin:0;'>ALREADY INVESTED <span class='subtext'>(LONG TERM HOLDINGS)</span></h3>",
        unsafe_allow_html=True)

total_pnl = total_curr_val - total_inv
total_pnl_pct = (total_pnl / total_inv * 100) if total_inv > 0 else 0.0

with col2:
    m1, m2, m3 = st.columns(3)
    m1.markdown(f"<span class='subtext'>Total Investment</span><br><b>₹{total_inv:,.2f}</b>", unsafe_allow_html=True)
    m2.markdown(f"<span class='subtext'>Current Value</span><br><b>₹{total_curr_val:,.2f}</b>", unsafe_allow_html=True)
    pnl_class = "text-gain" if total_pnl >= 0 else "text-loss"
    m3.markdown(
        f"<span class='subtext'>P&L</span><br><span class='{pnl_class}'>{total_pnl:+,.2f} ({total_pnl_pct:+.2f}%)</span>",
        unsafe_allow_html=True)

st.markdown("<hr style='border-color: #1f2937; margin: 15px 0;'>", unsafe_allow_html=True)
st.dataframe(pd.DataFrame(invested_rows) if invested_rows else pd.DataFrame(), use_container_width=True)
st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# SECTION 2: TO BUY ON PRICE DROP TABLE
# ==============================================================================
st.markdown("<div class='dashboard-card'>", unsafe_allow_html=True)
col_plan1, col_plan2 = st.columns([3, 1])
with col_plan1:
    st.markdown(
        "<h3 class='text-orange' style='margin:0;'>TO BUY ON PRICE DROP <span class='subtext'>(TRANCHES ANCHORED TO BASE PRICE)</span></h3>",
        unsafe_allow_html=True)
with col_plan2:
    st.markdown(
        f"<div style='text-align: right;'><span class='subtext'>Planned Capital</span><br><b class='text-orange' style='font-size: 1.2rem;'>₹{total_planned_inv:,.2f}</b></div>",
        unsafe_allow_html=True)

st.markdown("<hr style='border-color: #1f2937; margin: 15px 0;'>", unsafe_allow_html=True)

df_planned_view = pd.DataFrame(planned_rows) if planned_rows else pd.DataFrame()

if not df_planned_view.empty:
    styled_planned_df = df_planned_view.style.apply(highlight_live_vs_target, axis=1)
    st.dataframe(
        styled_planned_df,
        column_config={"Pct_Gap": None},
        use_container_width=True
    )
else:
    st.dataframe(pd.DataFrame(), use_container_width=True)

st.markdown(f"""
<div class='info-banner'>
    🎨 <b>Dynamic Color Legend:</b> Target prices are strictly calculated off your sidebar <b>Base Price</b>. Fills are based on Live Value vs Target Price:<br>
    <span style='background-color:#064e3b; color:#a7f3d0; padding: 2px 6px; border-radius:3px;'>Green = In Buy Zone (Live Price ≤ Target Price)</span> 
    <span style='background-color:#78350f; color:#fef08a; padding: 2px 6px; border-radius:3px; margin-left: 8px;'>Orange = Within 10% of Target</span> 
    <span style='background-color:#7f1d1d; color:#fca5a5; padding: 2px 6px; border-radius:3px; margin-left: 8px;'>Red = >10% Away</span>
</div>
""", unsafe_allow_html=True)
st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# SECTION 3: FUNDAMENTAL HEALTH & DECISION SCORECARD
# ==============================================================================
st.markdown("<div class='dashboard-card'>", unsafe_allow_html=True)
st.markdown("<h3 class='text-blue' style='margin:0;'>📊 FUNDAMENTAL HEALTH & DECISION SCORECARD</h3>",
            unsafe_allow_html=True)
st.markdown("<hr style='border-color: #1f2937; margin: 15px 0;'>", unsafe_allow_html=True)

df_fund_view = pd.DataFrame(fundamental_rows) if fundamental_rows else pd.DataFrame()

if not df_fund_view.empty:
    styled_fund_df = df_fund_view.style.apply(highlight_health_status, axis=1)
    st.dataframe(styled_fund_df, use_container_width=True)
else:
    st.dataframe(pd.DataFrame(), use_container_width=True)

st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# SECTION 4: CONCENTRATION WARNING & TOP BUY PRIORITIES
# ==============================================================================
total_portfolio_val = total_curr_val + total_planned_inv

over_concentrated = []
for st_sym, cap in stock_capital_totals.items():
    conc_pct = (cap / total_portfolio_val * 100) if total_portfolio_val > 0 else 0
    if conc_pct > 15.0:
        over_concentrated.append((st_sym, conc_pct))

if over_concentrated:
    warn_msg = "⚠️ <b>OVER-CONCENTRATION RISK WARNING:</b> The following stocks exceed 15% of total portfolio allocation:<br>"
    for s_item, c_pct in over_concentrated:
        warn_msg += f"• <b>{s_item}</b> holds <b>{c_pct:.1f}%</b> of total combined portfolio capital.<br>"
    warn_msg += "<i>Consider rebalancing or pausing further tranche purchases on these assets.</i>"
    st.markdown(f"<div class='warning-banner'>{warn_msg}</div>", unsafe_allow_html=True)

st.markdown("<div class='priority-card'>", unsafe_allow_html=True)
st.markdown("<h3 style='color:#60a5fa; margin:0;'>🔥 TOP BUY PRIORITIES TODAY (DISTINCT STOCKS)</h3>",
            unsafe_allow_html=True)

df_prio = pd.DataFrame(priority_candidates)
if not df_prio.empty:
    df_prio = df_prio.sort_values(by="Score", ascending=False).drop_duplicates(subset=["Stock"]).head(3)

    cols = st.columns(3)
    for idx, (_, p_row) in enumerate(df_prio.iterrows()):
        with cols[idx]:
            st.markdown(f"""
            <div style='background-color: #1e293b; padding: 12px; border-radius: 6px; border-left: 4px solid #f97316;'>
                <b style='font-size: 1.1rem;'>#{idx + 1} {p_row['Stock']}</b> ({p_row['Tranche']})<br>
                <span class='subtext'>Target Entry:</span> <b>₹{p_row['Target Price']:,.2f}</b><br>
                <span class='subtext'>RSI (14D):</span> <b>{p_row['RSI']:.1f}</b> {'🟢 (Oversold)' if p_row['RSI'] < 35 else ''}<br>
                <span class='subtext'>Status:</span> <b>{p_row['Status']}</b>
            </div>
            """, unsafe_allow_html=True)
st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# SECTION 5: SUMMARY & SECTOR CHART
# ==============================================================================
col_summary, col_chart = st.columns(2)

with col_summary:
    st.markdown("<div class='dashboard-card'>", unsafe_allow_html=True)
    st.markdown("<h3 class='text-blue' style='margin-top:0;'>PORTFOLIO SUMMARY</h3>", unsafe_allow_html=True)
    st.markdown("<hr style='border-color: #1f2937; margin: 10px 0;'>", unsafe_allow_html=True)

    st.markdown(f"""
    <div style='line-height: 2.2;'>
        <div style='display: flex; justify-content: space-between;'><span>Already Invested ({len(invested_rows)} Stocks)</span> <b>₹{total_inv:,.2f}</b></div>
        <div style='display: flex; justify-content: space-between;'><span>Current Value</span> <b>₹{total_curr_val:,.2f}</b></div>
        <div style='display: flex; justify-content: space-between;'><span>Unrealized P&L</span> <span class='{pnl_class}'>{total_pnl:+,.2f} ({total_pnl_pct:+.2f}%)</span></div>
        <div style='display: flex; justify-content: space-between;'><span>Planned Tranche Capital</span> <span class='text-orange'>₹{total_planned_inv:,.2f}</span></div>
        <hr style='border-color: #1f2937; margin: 10px 0;'>
        <div style='display: flex; justify-content: space-between; font-size: 1.1rem;'>
            <b class='text-blue'>TOTAL PORTFOLIO <span class='subtext' style='font-size:0.8rem;'>(Incl. Planned)</span></b>
            <b class='text-blue'>₹{total_portfolio_val:,.2f}</b>
        </div>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

with col_chart:
    st.markdown("<div class='dashboard-card'>", unsafe_allow_html=True)
    st.markdown(
        "<h3 class='text-blue' style='margin-top:0;'>SECTOR ALLOCATION <span class='subtext'>(Auto-Fetched Online)</span></h3>",
        unsafe_allow_html=True)
    st.markdown("<hr style='border-color: #1f2937; margin: 10px 0;'>", unsafe_allow_html=True)

    if sector_totals:
        fig = go.Figure(data=[go.Pie(
            labels=list(sector_totals.keys()),
            values=list(sector_totals.values()),
            hole=.6,
            textinfo='percent',
            hoverinfo='label+value+percent'
        )])
        fig.update_layout(
            showlegend=True,
            legend=dict(orientation="v", yanchor="middle", y=0.5, xanchor="left", x=1.0, font=dict(color="#e2e8f0")),
            margin=dict(t=0, b=0, l=0, r=0),
            height=200,
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)'
        )
        st.plotly_chart(fig, use_container_width=True)
    st.markdown("</div>", unsafe_allow_html=True)