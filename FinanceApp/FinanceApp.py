import io
import streamlit as st
import pandas as pd
import yfinance as yf
import numpy as np
import plotly.graph_objects as go

st.set_page_config(
    page_title="Live Stock Portfolio & Decision Engine",
    page_icon="📈",
    layout="wide"
)

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
    .text-cyan { color: #38bdf8; font-weight: bold; }
    .subtext { color: #9ca3af; font-size: 0.85rem; }
    .info-banner {
        background-color: rgba(30, 58, 138, 0.3);
        border: 1px solid rgba(30, 58, 138, 0.6);
        color: #60a5fa; padding: 10px 14px; border-radius: 6px; font-size: 0.85rem; margin-top: 10px;
    }
    .warning-banner {
        background-color: rgba(127, 29, 29, 0.4);
        border: 1px solid rgba(239, 68, 68, 0.6);
        color: #fca5a5; padding: 12px 16px; border-radius: 6px; font-size: 0.9rem; margin-bottom: 20px;
    }
    .priority-card {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid #3b82f6;
        padding: 15px; border-radius: 8px; margin-bottom: 20px;
    }
    .rebalance-card {
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        border: 1px solid #6366f1;
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
    "Basic Materials": 16.5,
    "Real Estate": 25.0,
    "Other": 20.0
}

# Default Sector Allocation Models (Presets)
SECTOR_TARGET_PRESETS = {
    "Balanced / All-Weather": {
        "Financial Services": 20.0,
        "Banks": 10.0,
        "Capital Goods": 15.0,
        "Technology": 15.0,
        "Healthcare": 10.0,
        "Industrials": 10.0,
        "Consumer Cyclical": 10.0,
        "Consumer Defensive": 10.0,
    },
    "Growth Focused": {
        "Technology": 25.0,
        "Financial Services": 20.0,
        "Capital Goods": 20.0,
        "Healthcare": 15.0,
        "Consumer Cyclical": 10.0,
        "Industrials": 10.0,
    },
    "Defensive / Dividend": {
        "Consumer Defensive": 25.0,
        "Healthcare": 20.0,
        "Utilities": 15.0,
        "Energy": 15.0,
        "Financial Services": 15.0,
        "Banks": 10.0,
    },
    "Equal Weight": {}
}

# Historical Median P/E Data Store
HISTORICAL_MEDIAN_PES = {
    "SBIN": {"3Yr": 11.5, "5Yr": 12.8, "10Yr": 13.5},
    "ICICIPRULI": {"3Yr": 52.0, "5Yr": 65.4, "10Yr": 70.2},
    "HDFCBANK": {"3Yr": 19.5, "5Yr": 22.0, "10Yr": 24.5},
    "ICICIBANK": {"3Yr": 17.5, "5Yr": 18.8, "10Yr": 19.2},
    "INFY": {"3Yr": 26.0, "5Yr": 27.5, "10Yr": 23.0},
    "TCS": {"3Yr": 29.5, "5Yr": 30.2, "10Yr": 26.5},
    "RELIANCE": {"3Yr": 25.2, "5Yr": 27.0, "10Yr": 22.8},
    "ITC": {"3Yr": 26.5, "5Yr": 24.0, "10Yr": 28.5},
    "BSE": {"3Yr": 38.5, "5Yr": 42.0, "10Yr": 45.1},
    "LT": {"3Yr": 29.2, "5Yr": 27.5, "10Yr": 26.8},
    "BEL": {"3Yr": 32.0, "5Yr": 28.4, "10Yr": 25.0},
    "MCX": {"3Yr": 45.0, "5Yr": 48.6, "10Yr": 44.2},
    "SHRIRAMFIN": {"3Yr": 11.2, "5Yr": 12.5, "10Yr": 13.8},
    "GROWW": {"3Yr": 35.0, "5Yr": 38.2, "10Yr": 40.0}
}


def format_ticker(symbol: str) -> str:
    """Format ticker to NSE suffix if no exchange is provided."""
    symbol = str(symbol).strip().upper()
    if not symbol or symbol == "NAN":
        return ""
    if symbol.endswith("-E"):
        symbol = symbol[:-2]
    if not symbol.endswith(".NS") and not symbol.endswith(".BO") and "." not in symbol and "^" not in symbol:
        return f"{symbol}.NS"
    return symbol


def calculate_rsi(prices: pd.Series, window: int = 14) -> float:
    """Calculate 14-period RSI using standard Wilder's Exponential Smoothing (EWMA)."""
    if len(prices) < window + 1:
        return 50.0

    delta = prices.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    # Wilder's smoothing (alpha = 1 / window)
    avg_gain = gain.ewm(alpha=1.0 / window, min_periods=window, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / window, min_periods=window, adjust=False).mean()

    last_gain = avg_gain.iloc[-1]
    last_loss = avg_loss.iloc[-1]

    if np.isnan(last_gain) or np.isnan(last_loss):
        return 50.0
    if last_loss == 0:
        return 100.0 if last_gain > 0 else 50.0
    if last_gain == 0:
        return 0.0

    rs = last_gain / last_loss
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return float(np.clip(rsi, 0.0, 100.0))


@st.cache_data(ttl=300)
def fetch_stock_valuation_and_rsi(ticker_symbol: str):
    """Fetch live market price, valuation metrics, fundamentals and 14D RSI via yfinance."""
    formatted = format_ticker(ticker_symbol)
    if not formatted:
        return None, 0.0, 'Other', None, 20.0, None, None, None, None, 50.0, False

    try:
        ticker = yf.Ticker(formatted)

        # Retrieve Price & Daily Change from fast_info
        current_price = None
        prev_close = None
        try:
            info = ticker.fast_info
            current_price = getattr(info, 'last_price', None)
            if current_price is None or np.isnan(current_price):
                current_price = getattr(info, 'regular_market_price', None)
            prev_close = getattr(info, 'previous_close', None)
        except Exception:
            pass

        # Historical Prices for RSI & Fallback Price
        hist = ticker.history(period="1mo")
        if not hist.empty and 'Close' in hist.columns:
            if current_price is None or np.isnan(current_price):
                current_price = float(hist['Close'].iloc[-1])
            if prev_close is None and len(hist['Close']) > 1:
                prev_close = float(hist['Close'].iloc[-2])
            rsi_val = calculate_rsi(hist['Close'])
        else:
            rsi_val = 50.0

        daily_change = (current_price - prev_close) if (current_price and prev_close) else 0.0
        is_valid = current_price is not None and not np.isnan(current_price) and current_price > 0

        # Retrieve Fundamentals
        sector = "Other"
        pe_ratio, roe, de_ratio, profit_growth, peg_ratio = None, None, None, None, None

        try:
            full_info = ticker.info or {}
            sector = full_info.get('sector') or 'Other'
            pe_ratio = full_info.get('trailingPE') or full_info.get('forwardPE')

            roe = full_info.get('returnOnEquity')
            if roe is not None and not np.isnan(roe):
                roe = roe * 100

            de_ratio = full_info.get('debtToEquity')
            if de_ratio is not None and not np.isnan(de_ratio):
                de_ratio = de_ratio / 100.0

            profit_growth = full_info.get('earningsGrowth')
            if profit_growth is not None and not np.isnan(profit_growth):
                profit_growth = profit_growth * 100

            peg_ratio = full_info.get('pegRatio')
        except Exception:
            pass

        sector_pe = SECTOR_PE_BENCHMARKS.get(sector, SECTOR_PE_BENCHMARKS["Other"])

        return current_price, daily_change, sector, pe_ratio, sector_pe, roe, de_ratio, profit_growth, peg_ratio, rsi_val, is_valid
    except Exception:
        return None, 0.0, 'Other', None, 20.0, None, None, None, None, 50.0, False


def highlight_live_vs_target(row):
    """Highlight table cells based on how close current price is to the tranche target."""
    styles = [''] * len(row)
    raw_gap = row.get('Pct_Gap', 999.0)
    try:
        gap = float(raw_gap)
    except (ValueError, TypeError):
        gap = 999.0

    if gap <= 0:
        bg_style = 'background-color: #064e3b; color: #a7f3d0; font-weight: bold;'
    elif gap <= 10.0:
        bg_style = 'background-color: #78350f; color: #fef08a; font-weight: bold;'
    else:
        bg_style = 'background-color: #7f1d1d; color: #fca5a5;'

    for col_name in ['Status', 'Current Price (₹)', 'Target Drop', 'Target Price (₹)']:
        if col_name in row.index:
            styles[row.index.get_loc(col_name)] = bg_style

    return styles


def highlight_health_status(row):
    """Highlight health badge column."""
    styles = [''] * len(row)
    status = str(row.get('Health Badge', ''))

    if 'EXCELLENT' in status:
        bg_style = 'background-color: #064e3b; color: #a7f3d0; font-weight: bold;'
    elif 'MODERATE' in status:
        bg_style = 'background-color: #78350f; color: #fef08a; font-weight: bold;'
    else:
        bg_style = 'background-color: #7f1d1d; color: #fca5a5; font-weight: bold;'

    if 'Health Badge' in row.index:
        styles[row.index.get_loc('Health Badge')] = bg_style

    return styles


def highlight_sector_balance(row):
    """Highlight Sector Balancing scorecard based on allocation drift."""
    styles = [''] * len(row)
    status = str(row.get('Status / Action', ''))

    if 'OVERWEIGHT' in status:
        bg_style = 'background-color: #7f1d1d; color: #fca5a5; font-weight: bold;'
    elif 'UNDERWEIGHT' in status:
        bg_style = 'background-color: #1e3a8a; color: #93c5fd; font-weight: bold;'
    else:
        bg_style = 'background-color: #064e3b; color: #a7f3d0; font-weight: bold;'

    for col in ['Status / Action', 'Allocation Drift', 'Rebalance Delta (₹)']:
        if col in row.index:
            styles[row.index.get_loc(col)] = bg_style

    return styles


# ==============================================================================
# SIDEBAR - EXCEL UPLOADER, EXPORT & PARAMETERS
# ==============================================================================
st.sidebar.title("⚙️ Portfolio Manager")

# Default Data Initialization
if "invested_df" not in st.session_state:
    try:
        excel_default = pd.ExcelFile("portfolio.xlsx")
        if "Holdings" in excel_default.sheet_names:
            st.session_state.invested_df = pd.read_excel("portfolio.xlsx", sheet_name="Holdings")
        else:
            st.session_state.invested_df = pd.DataFrame([
                {"Symbol": "SBIN", "Qty": 26, "Avg Price": 574.00},
                {"Symbol": "ICICIPRULI", "Qty": 6, "Avg Price": 2165.00},
                {"Symbol": "HDFCBANK", "Qty": 15, "Avg Price": 1650.00}
            ])
    except Exception:
        st.session_state.invested_df = pd.DataFrame([
            {"Symbol": "SBIN", "Qty": 26, "Avg Price": 574.00},
            {"Symbol": "ICICIPRULI", "Qty": 6, "Avg Price": 2165.00},
            {"Symbol": "HDFCBANK", "Qty": 15, "Avg Price": 1650.00}
        ])

if "planned_df" not in st.session_state:
    try:
        excel_default = pd.ExcelFile("portfolio.xlsx")
        if "Watchlist" in excel_default.sheet_names:
            st.session_state.planned_df = pd.read_excel("portfolio.xlsx", sheet_name="Watchlist")
        else:
            st.session_state.planned_df = pd.DataFrame([
                {"Symbol": "BSE", "Total Budget": 35000.0, "Base Price": 3500.0},
                {"Symbol": "LT", "Total Budget": 30000.0, "Base Price": 3800.0},
                {"Symbol": "BEL", "Total Budget": 30000.0, "Base Price": 410.0},
                {"Symbol": "SBIN", "Total Budget": 30000.0, "Base Price": 1050.0},
                {"Symbol": "MCX", "Total Budget": 25000.0, "Base Price": 2750.0},
                {"Symbol": "SHRIRAMFIN", "Total Budget": 25200.0, "Base Price": 1020.0},
            ])
    except Exception:
        st.session_state.planned_df = pd.DataFrame([
            {"Symbol": "BSE", "Total Budget": 35000.0, "Base Price": 3500.0},
            {"Symbol": "LT", "Total Budget": 30000.0, "Base Price": 3800.0},
            {"Symbol": "BEL", "Total Budget": 30000.0, "Base Price": 410.0},
            {"Symbol": "SBIN", "Total Budget": 30000.0, "Base Price": 1050.0},
            {"Symbol": "MCX", "Total Budget": 25000.0, "Base Price": 2750.0},
            {"Symbol": "SHRIRAMFIN", "Total Budget": 25200.0, "Base Price": 1020.0},
        ])

# File Uploader
st.sidebar.subheader("📁 Upload Portfolio Excel File")
uploaded_file = st.sidebar.file_uploader(
    "Upload Excel (.xlsx)",
    type=["xlsx"],
    help="Upload an Excel file containing two sheets named 'Holdings' and 'Watchlist'."
)

# Process Uploaded Excel File
if uploaded_file is not None:
    if st.session_state.get("last_uploaded_name") != uploaded_file.name:
        try:
            excel_data = pd.ExcelFile(uploaded_file)
            sheet_names = excel_data.sheet_names

            if "Holdings" in sheet_names and "Watchlist" in sheet_names:
                st.session_state.invested_df = pd.read_excel(uploaded_file, sheet_name="Holdings")
                st.session_state.planned_df = pd.read_excel(uploaded_file, sheet_name="Watchlist")
                st.session_state.last_uploaded_name = uploaded_file.name
                st.sidebar.success("Excel data loaded successfully!")
            else:
                st.sidebar.error("Excel must contain sheets named 'Holdings' and 'Watchlist'.")
        except Exception as e:
            st.sidebar.error(f"Error reading file: {e}")

# Refresh Button
if st.sidebar.button("🔄 Refresh Live Data", use_container_width=True):
    st.cache_data.clear()
    st.sidebar.success("Live data refreshed!")
    st.rerun()

st.sidebar.markdown("---")
st.sidebar.subheader("⚖️ Sector Target Balancing Model")
sector_preset = st.sidebar.selectbox(
    "Sector Model Preset:",
    options=list(SECTOR_TARGET_PRESETS.keys()) + ["Custom Allocation"],
    index=0
)

# Manage Custom or Preset Sector Weights
if "custom_sector_weights" not in st.session_state:
    st.session_state.custom_sector_weights = pd.DataFrame([
        {"Sector": "Financial Services", "Target (%)": 20.0},
        {"Sector": "Banks", "Target (%)": 10.0},
        {"Sector": "Capital Goods", "Target (%)": 15.0},
        {"Sector": "Technology", "Target (%)": 15.0},
        {"Sector": "Healthcare", "Target (%)": 10.0},
        {"Sector": "Industrials", "Target (%)": 10.0},
        {"Sector": "Consumer Cyclical", "Target (%)": 10.0},
        {"Sector": "Consumer Defensive", "Target (%)": 10.0}
    ])

if sector_preset == "Custom Allocation":
    with st.sidebar.expander("🛠️ Edit Custom Sector Weights (%)", expanded=True):
        st.session_state.custom_sector_weights = st.data_editor(
            st.session_state.custom_sector_weights,
            num_rows="dynamic",
            key="custom_sector_editor",
            use_container_width=True
        )

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

# Interactive Data Editors
st.sidebar.subheader("1. Current Holdings")
st.session_state.invested_df = st.sidebar.data_editor(
    st.session_state.invested_df, num_rows="dynamic", key="editor_holdings", use_container_width=True
)

st.sidebar.subheader("2. Watchlist (Total Capital & Base Price)")
st.session_state.planned_df = st.sidebar.data_editor(
    st.session_state.planned_df, num_rows="dynamic", key="editor_planned", use_container_width=True
)

# Export Excel Feature
def generate_excel_download():
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        st.session_state.invested_df.to_excel(writer, sheet_name="Holdings", index=False)
        st.session_state.planned_df.to_excel(writer, sheet_name="Watchlist", index=False)
    return output.getvalue()

st.sidebar.markdown("---")
st.sidebar.download_button(
    label="📥 Download Portfolio (.xlsx)",
    data=generate_excel_download(),
    file_name="portfolio.xlsx",
    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    use_container_width=True
)

# ==============================================================================
# DATA ENGINE - FETCH & COMPUTE
# ==============================================================================
with st.spinner("Fetching Live Prices, RSI Indicators & Decision Metrics..."):
    invested_rows = []
    total_inv = 0.0
    total_curr_val = 0.0
    invested_sector_totals = {}
    planned_sector_totals = {}
    stock_capital_totals = {}
    stock_sector_map = {}

    # 1. Process Current Holdings
    if not st.session_state.invested_df.empty:
        for _, row in st.session_state.invested_df.iterrows():
            symbol = str(row.get("Symbol", "")).strip().upper()
            try:
                qty = float(row.get("Qty", 0) or 0)
            except (ValueError, TypeError):
                qty = 0.0
            try:
                avg_price = float(row.get("Avg Price", 0) or 0)
            except (ValueError, TypeError):
                avg_price = 0.0

            if not symbol or symbol == "NAN" or qty <= 0:
                continue

            curr_price, d_change, fetched_sector, pe_ratio, sector_pe, roe, de_ratio, profit_growth, peg_ratio, rsi_val, is_valid = fetch_stock_valuation_and_rsi(symbol)
            curr_price = curr_price if (is_valid and curr_price is not None) else avg_price

            inv_val = qty * avg_price
            curr_val = qty * curr_price
            pnl_val = curr_val - inv_val
            pnl_pct = (pnl_val / inv_val * 100) if inv_val > 0 else 0.0

            total_inv += inv_val
            total_curr_val += curr_val

            invested_sector_totals[fetched_sector] = invested_sector_totals.get(fetched_sector, 0.0) + curr_val
            stock_capital_totals[symbol] = stock_capital_totals.get(symbol, 0.0) + curr_val
            stock_sector_map[symbol] = fetched_sector

            pe_str = f"{pe_ratio:.2f}" if (pe_ratio and not np.isnan(pe_ratio)) else "N/A"
            median_pe_val = HISTORICAL_MEDIAN_PES.get(symbol, {}).get(pe_timeframe, "N/A")
            median_pe_str = f"{median_pe_val:.1f}" if isinstance(median_pe_val, (int, float)) else "N/A"

            stock_display = symbol if is_valid else f"{symbol} ⚠️"

            invested_rows.append({
                "Stock": stock_display,
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

    # 2. Process Planned Tranches & Fundamentals
    planned_rows = []
    fundamental_rows = []
    priority_candidates = []
    total_planned_inv = 0.0

    tranche_config = [
        {"name": "Tranche 1", "drop_pct": t1_drop, "alloc_pct": 0.30},
        {"name": "Tranche 2", "drop_pct": t2_drop, "alloc_pct": 0.30},
        {"name": "Tranche 3", "drop_pct": t3_drop, "alloc_pct": 0.40},
    ]

    # Pre-calculate Sector Allocations for dynamic priority adjustments
    all_active_sectors = set(invested_sector_totals.keys())
    if not st.session_state.planned_df.empty:
        for _, row in st.session_state.planned_df.iterrows():
            sym = str(row.get("Symbol", "")).strip().upper()
            try:
                bud = float(row.get("Total Budget", 0) or 0)
            except (ValueError, TypeError):
                bud = 0.0
            if sym and sym != "NAN" and bud > 0:
                _, _, f_sec, _, _, _, _, _, _, _, _ = fetch_stock_valuation_and_rsi(sym)
                planned_sector_totals[f_sec] = planned_sector_totals.get(f_sec, 0.0) + bud
                stock_capital_totals[sym] = stock_capital_totals.get(sym, 0.0) + bud
                stock_sector_map[sym] = f_sec
                all_active_sectors.add(f_sec)
                total_planned_inv += bud

    total_portfolio_val = total_curr_val + total_planned_inv

    # Compute Target Weights per sector
    resolved_target_weights = {}
    if sector_preset == "Custom Allocation":
        c_df = st.session_state.custom_sector_weights
        if not c_df.empty and "Sector" in c_df.columns and "Target (%)" in c_df.columns:
            for _, c_row in c_df.iterrows():
                s_name = str(c_row.get("Sector", "")).strip()
                try:
                    s_w = float(c_row.get("Target (%)", 0) or 0)
                except (ValueError, TypeError):
                    s_w = 0.0
                if s_name:
                    resolved_target_weights[s_name] = s_w
    elif sector_preset == "Equal Weight":
        if all_active_sectors:
            eq_weight = 100.0 / len(all_active_sectors)
            for sec in all_active_sectors:
                resolved_target_weights[sec] = eq_weight
    else:
        resolved_target_weights = dict(SECTOR_TARGET_PRESETS.get(sector_preset, {}))

    # Normalize target weights to 100%
    target_sum = sum(resolved_target_weights.values())
    if target_sum > 0:
        normalized_targets = {k: (v / target_sum * 100.0) for k, v in resolved_target_weights.items()}
    else:
        normalized_targets = {}

    # Combined Sector Totals & Sector Balancing Scorecard
    combined_sector_totals = {}
    for sec in set(list(invested_sector_totals.keys()) + list(planned_sector_totals.keys()) + list(normalized_targets.keys())):
        inv_amt = invested_sector_totals.get(sec, 0.0)
        plan_amt = planned_sector_totals.get(sec, 0.0)
        combined_sector_totals[sec] = inv_amt + plan_amt

    sector_balance_rows = []
    sector_status_map = {}

    for sec, tot_amt in combined_sector_totals.items():
        if tot_amt <= 0 and sec not in normalized_targets:
            continue

        inv_amt = invested_sector_totals.get(sec, 0.0)
        plan_amt = planned_sector_totals.get(sec, 0.0)
        curr_weight = (inv_amt / total_curr_val * 100.0) if total_curr_val > 0 else 0.0
        proj_weight = (tot_amt / total_portfolio_val * 100.0) if total_portfolio_val > 0 else 0.0
        t_weight = normalized_targets.get(sec, 0.0)

        drift = proj_weight - t_weight
        target_val = (t_weight / 100.0) * total_portfolio_val
        rebalance_delta = target_val - tot_amt

        if drift > 3.0:
            status_act = f"🔴 OVERWEIGHT (+{drift:.1f}%)"
            action_badge = "Pause / Trim"
            sector_status_map[sec] = "OVERWEIGHT"
        elif drift < -3.0:
            status_act = f"🔵 UNDERWEIGHT ({drift:.1f}%)"
            action_badge = "Allocate Capital"
            sector_status_map[sec] = "UNDERWEIGHT"
        else:
            status_act = "🟢 BALANCED"
            action_badge = "On Target"
            sector_status_map[sec] = "BALANCED"

        sector_balance_rows.append({
            "Sector": sec,
            "Invested (₹)": f"₹{inv_amt:,.2f}",
            "Planned (₹)": f"₹{plan_amt:,.2f}",
            "Combined (₹)": f"₹{tot_amt:,.2f}",
            "Current Weight": f"{curr_weight:.1f}%",
            "Projected Weight": f"{proj_weight:.1f}%",
            "Target Weight": f"{t_weight:.1f}%",
            "Allocation Drift": f"{'+' if drift > 0 else ''}{drift:.1f}%",
            "Rebalance Delta (₹)": f"{'+' if rebalance_delta > 0 else ''}₹{rebalance_delta:,.2f}",
            "Status / Action": status_act,
            "_raw_proj_weight": proj_weight,
            "_raw_target_weight": t_weight,
            "_raw_drift": drift,
            "_raw_rebalance_delta": rebalance_delta
        })

    # Detailed planned rows generation
    if not st.session_state.planned_df.empty:
        for _, row in st.session_state.planned_df.iterrows():
            symbol = str(row.get("Symbol", "")).strip().upper()
            try:
                total_budget = float(row.get("Total Budget", 0) or 0)
            except (ValueError, TypeError):
                total_budget = 0.0
            try:
                base_price_input = float(row.get("Base Price", 0) or 0)
            except (ValueError, TypeError):
                base_price_input = 0.0

            if not symbol or symbol == "NAN" or total_budget <= 0:
                continue

            curr_price, d_change, fetched_sector, pe_ratio, sector_pe, roe, de_ratio, profit_growth, peg_ratio, rsi_val, is_valid = fetch_stock_valuation_and_rsi(symbol)
            ref_price = base_price_input if base_price_input > 0 else ((curr_price or 1.0) if is_valid else 1.0)

            pe_str = f"{pe_ratio:.2f}" if (pe_ratio and not np.isnan(pe_ratio)) else "N/A"
            median_pe_val = HISTORICAL_MEDIAN_PES.get(symbol, {}).get(pe_timeframe, "N/A")
            median_pe_str = f"{median_pe_val:.1f}" if isinstance(median_pe_val, (int, float)) else "N/A"

            roe_str = f"{roe:.2f}%" if roe is not None else "15.0% (Est)"
            de_str = f"{de_ratio:.2f}" if de_ratio is not None else "0.45 (Est)"
            growth_str = f"{profit_growth:+.2f}%" if profit_growth is not None else "+12.5% (Est)"
            peg_str = f"{peg_ratio:.2f}" if (peg_ratio and not np.isnan(peg_ratio)) else "1.20"

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

            stock_display = symbol if is_valid else f"{symbol} ⚠️"

            fundamental_rows.append({
                "Stock": stock_display,
                "Sector": fetched_sector,
                "ROE (%)": roe_str,
                "Debt / Equity": de_str,
                "Profit Growth (%)": growth_str,
                "PEG Ratio": peg_str,
                "Health Badge": health_badge
            })

            best_stock_tranche = None
            best_tranche_score = -999.0

            # Sector Balance Multiplier
            sec_status = sector_status_map.get(fetched_sector, "BALANCED")
            if sec_status == "UNDERWEIGHT":
                sector_bonus = 20.0  # Boost priority for underweight sectors
                sector_badge = "🎯 Underweight Sector Boost"
            elif sec_status == "OVERWEIGHT":
                sector_bonus = -25.0  # Penalize priority for overweight sectors
                sector_badge = "⚠️ Overweight Sector"
            else:
                sector_bonus = 0.0
                sector_badge = "⚖️ Balanced Sector"

            for t in tranche_config:
                target_price = ref_price * (1.0 - (t["drop_pct"] / 100.0))
                tranche_budget = total_budget * t["alloc_pct"]
                tranche_qty = tranche_budget / target_price if target_price > 0 else 0.0

                if is_valid and curr_price and curr_price > 0:
                    drop_needed = ((curr_price - target_price) / curr_price * 100.0)
                    is_buy_zone = curr_price <= target_price
                    status_text = "🟢 IN BUY ZONE" if is_buy_zone else f"Waiting for -{drop_needed:.2f}% dip"
                else:
                    drop_needed = 999.0
                    status_text = "⚠️ Live Price N/A"

                p_score = (100.0 - drop_needed) * health_weight + (50.0 if rsi_val < 35.0 else 0.0) + sector_bonus
                if p_score > best_tranche_score:
                    best_tranche_score = p_score
                    best_stock_tranche = {
                        "Stock": symbol,
                        "Sector": fetched_sector,
                        "Tranche": t["name"],
                        "Target Price": target_price,
                        "Drop Needed": drop_needed,
                        "Status": status_text,
                        "Score": p_score,
                        "RSI": rsi_val,
                        "Sector Badge": sector_badge
                    }

                planned_rows.append({
                    "Stock": stock_display,
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
                    "Current Price (₹)": f"₹{curr_price:,.2f}" if (is_valid and curr_price) else "N/A",
                    "Status": status_text,
                    "Pct_Gap": drop_needed
                })

            if best_stock_tranche and is_valid:
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
if invested_rows:
    st.dataframe(pd.DataFrame(invested_rows), use_container_width=True)
else:
    st.info("No current holdings configured. Add stocks via the sidebar editor or upload an Excel file.")
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
    st.info("No watchlist items configured. Add planned stocks in the sidebar.")

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
    st.info("No fundamental data available.")

st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# SECTION 4: CONCENTRATION WARNING & TOP BUY PRIORITIES (SECTOR BALANCED)
# ==============================================================================
if total_portfolio_val > 0:
    over_concentrated = []
    for st_sym, cap in stock_capital_totals.items():
        conc_pct = (cap / total_portfolio_val * 100.0)
        if conc_pct > 15.0:
            over_concentrated.append((st_sym, conc_pct))

    if over_concentrated:
        warn_msg = "⚠️ <b>OVER-CONCENTRATION RISK WARNING:</b> The following stocks exceed 15% of total portfolio allocation:<br>"
        for s_item, c_pct in over_concentrated:
            warn_msg += f"• <b>{s_item}</b> holds <b>{c_pct:.1f}%</b> of total combined portfolio capital.<br>"
        warn_msg += "<i>Consider rebalancing or pausing further tranche purchases on these assets.</i>"
        st.markdown(f"<div class='warning-banner'>{warn_msg}</div>", unsafe_allow_html=True)

st.markdown("<div class='priority-card'>", unsafe_allow_html=True)
st.markdown("<h3 style='color:#60a5fa; margin:0;'>🔥 TOP BUY PRIORITIES TODAY (SECTOR-BALANCED & QUALITY RANKED)</h3>",
            unsafe_allow_html=True)

df_prio = pd.DataFrame(priority_candidates)
if not df_prio.empty:
    df_prio = df_prio.sort_values(by="Score", ascending=False).drop_duplicates(subset=["Stock"]).head(3)

    cols = st.columns(len(df_prio))
    for idx, (_, p_row) in enumerate(df_prio.iterrows()):
        with cols[idx]:
            st.markdown(f"""
            <div style='background-color: #1e293b; padding: 12px; border-radius: 6px; border-left: 4px solid #f97316;'>
                <b style='font-size: 1.1rem;'>#{idx + 1} {p_row['Stock']}</b> ({p_row['Tranche']})<br>
                <span class='subtext'>Sector:</span> <b>{p_row['Sector']}</b> ({p_row['Sector Badge']})<br>
                <span class='subtext'>Target Entry:</span> <b>₹{p_row['Target Price']:,.2f}</b><br>
                <span class='subtext'>RSI (14D):</span> <b>{p_row['RSI']:.1f}</b> {'🟢 (Oversold)' if p_row['RSI'] < 35.0 else ''}<br>
                <span class='subtext'>Status:</span> <b>{p_row['Status']}</b>
            </div>
            """, unsafe_allow_html=True)
else:
    st.info("No buy priority candidates available currently.")
st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# SECTION 5: SECTOR BALANCING & REBALANCING ENGINE
# ==============================================================================
st.markdown("<div class='dashboard-card'>", unsafe_allow_html=True)
st.markdown(
    f"<h3 class='text-cyan' style='margin:0;'>⚖️ SECTOR BALANCING & REBALANCING ENGINE <span class='subtext'>[Model: {sector_preset}]</span></h3>",
    unsafe_allow_html=True)
st.markdown("<hr style='border-color: #1f2937; margin: 15px 0;'>", unsafe_allow_html=True)

df_sec_balance = pd.DataFrame(sector_balance_rows) if sector_balance_rows else pd.DataFrame()

if not df_sec_balance.empty:
    col_chart_sec, col_table_sec = st.columns([1, 1])

    with col_chart_sec:
        # Comparison Bar Chart: Projected vs Target Allocation
        sorted_sec = df_sec_balance.sort_values(by="_raw_proj_weight", ascending=True)
        fig_bar = go.Figure()
        fig_bar.add_trace(go.Bar(
            y=sorted_sec["Sector"],
            x=sorted_sec["_raw_proj_weight"],
            name="Projected Weight (%)",
            orientation="h",
            marker=dict(color="#3b82f6")
        ))
        fig_bar.add_trace(go.Bar(
            y=sorted_sec["Sector"],
            x=sorted_sec["_raw_target_weight"],
            name="Target Weight (%)",
            orientation="h",
            marker=dict(color="#10b981")
        ))
        fig_bar.update_layout(
            title=dict(text="Projected vs Target Allocation (%)", font=dict(color="#e2e8f0", size=14)),
            barmode="group",
            xaxis=dict(title="Weight (%)", color="#9ca3af", gridcolor="#1f2937"),
            yaxis=dict(color="#e2e8f0"),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1.0, font=dict(color="#e2e8f0")),
            margin=dict(t=30, b=0, l=0, r=0),
            height=320,
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)'
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    with col_table_sec:
        # Summary & Actions
        over_sec = df_sec_balance[df_sec_balance["_raw_drift"] > 3.0]
        under_sec = df_sec_balance[df_sec_balance["_raw_drift"] < -3.0]
        
        st.markdown("<div class='rebalance-card'>", unsafe_allow_html=True)
        st.markdown("<b style='color:#a5b4fc; font-size:1.05rem;'>💡 Systematic Rebalancing Directives:</b><br>", unsafe_allow_html=True)
        
        if not under_sec.empty:
            st.markdown("<b class='text-blue'>Underweight Inflow Priorities:</b>", unsafe_allow_html=True)
            for _, u_row in under_sec.iterrows():
                st.markdown(f"• Deploy <b>₹{abs(u_row['_raw_rebalance_delta']):,.2f}</b> into <b>{u_row['Sector']}</b> (currently {u_row['Projected Weight']}, target {u_row['Target Weight']}).", unsafe_allow_html=True)
        else:
            st.markdown("• <span class='text-gain'>No underweight sectors requiring urgent capital deployment.</span>", unsafe_allow_html=True)
            
        if not over_sec.empty:
            st.markdown("<br><b class='text-orange'>Overweight Restraints:</b>", unsafe_allow_html=True)
            for _, o_row in over_sec.iterrows():
                st.markdown(f"• <b>{o_row['Sector']}</b> is over target by <b>+{o_row['_raw_drift']:.1f}%</b>. Pause watchlist additions.", unsafe_allow_html=True)
        else:
            st.markdown("<br>• <span class='text-gain'>No sectors exceed risk tolerance drift.</span>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    # Filter columns to display in data table
    display_cols = [
        "Sector", "Invested (₹)", "Planned (₹)", "Combined (₹)",
        "Current Weight", "Projected Weight", "Target Weight",
        "Allocation Drift", "Rebalance Delta (₹)", "Status / Action"
    ]
    styled_sec_df = df_sec_balance[display_cols].style.apply(highlight_sector_balance, axis=1)
    st.dataframe(styled_sec_df, use_container_width=True)
else:
    st.info("No sector balancing data available.")
st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# SECTION 6: SUMMARY & ASSET ALLOCATION DONUT CHART
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

    if combined_sector_totals:
        colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#14b8a6', '#f43f5e']
        fig = go.Figure(data=[go.Pie(
            labels=list(combined_sector_totals.keys()),
            values=list(combined_sector_totals.values()),
            hole=.6,
            textinfo='percent',
            hoverinfo='label+value+percent',
            marker=dict(colors=colors)
        )])
        fig.update_layout(
            showlegend=True,
            legend=dict(orientation="v", yanchor="middle", y=0.5, xanchor="left", x=1.0, font=dict(color="#e2e8f0")),
            margin=dict(t=0, b=0, l=0, r=0),
            height=220,
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)'
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("No sector allocation data to display.")
    st.markdown("</div>", unsafe_allow_html=True)