import pandas as pd

# 1. Dummy Data for Sheet 1: Holdings
holdings_data = {
    "Symbol": ["SBIN", "ICICIPRULI", "HDFCBANK"],
    "Qty": [26, 6, 15],
    "Avg Price": [574.00, 2165.00, 1650.00]
}

# 2. Dummy Data for Sheet 2: Watchlist
watchlist_data = {
    "Symbol": ["BSE", "LT", "BEL", "SBIN", "MCX", "SHRIRAMFIN"],
    "Total Budget": [35000.00, 30000.00, 30000.00, 30000.00, 25000.00, 25200.00],
    "Base Price": [3500.00, 3800.00, 410.00, 1050.00, 2750.00, 1020.00]
}

# Convert to DataFrames
df_holdings = pd.DataFrame(holdings_data)
df_watchlist = pd.DataFrame(watchlist_data)

# Save to Excel with two distinct sheets
with pd.ExcelWriter("portfolio.xlsx", engine="openpyxl") as writer:
    df_holdings.to_excel(writer, sheet_name="Holdings", index=False)
    df_watchlist.to_excel(writer, sheet_name="Watchlist", index=False)

print("Created 'portfolio.xlsx' successfully!")