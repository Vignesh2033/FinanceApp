import * as XLSX from 'xlsx';
import { Asset, AssetCategory } from '../types/finance';

export interface ParsedSpreadsheetRow {
  name: string;
  category: AssetCategory;
  institution: string;
  currentValue: number;
  investedValue: number;
  units?: number;
  notes?: string;
}

/**
 * Intelligent asset category and sub-category classifier for Zerodha and Indian markets
 */
export function classifyZerodhaInstrument(symbol: string, sector?: string): { category: AssetCategory; subCategory: string } {
  const sym = symbol.toUpperCase().trim();

  // 1. Sovereign Gold Bonds (SGB)
  if (sym.startsWith('SGB') || sym.includes('SGB')) {
    return {
      category: 'Precious Metals',
      subCategory: 'Sovereign Gold Bond (SGB)'
    };
  }

  // 2. Gold & Silver ETFs
  if (
    sym.includes('GOLDBEES') ||
    sym.includes('SILVERBEES') ||
    sym.includes('GOLDETF') ||
    sym.includes('SILVERETF') ||
    sym.includes('SETFGOLD') ||
    sym.endsWith('GOLD') ||
    sym.endsWith('SILVER')
  ) {
    return {
      category: 'Precious Metals',
      subCategory: 'Gold & Silver ETF'
    };
  }

  // 3. Liquid Funds / Cash equivalents
  if (sym.includes('LIQUIDBEES') || sym.includes('LIQUIDETF') || sym.includes('ICICILIQ')) {
    return {
      category: 'Cash & Bank',
      subCategory: 'Liquid ETF'
    };
  }

  // 4. REITs & InvITs
  if (
    sym.includes('REIT') ||
    sym.includes('EMBASSY') ||
    sym.includes('MINDSPACE') ||
    sym.includes('NEXUS') ||
    sym.includes('BIRET') ||
    sym.includes('BROOKFIELD')
  ) {
    return {
      category: 'Real Estate',
      subCategory: 'Commercial REIT'
    };
  }
  if (sym.includes('INVIT') || sym.includes('PGINVIT') || sym.includes('POWERGRID')) {
    return {
      category: 'Real Estate',
      subCategory: 'Infrastructure Trust (InvIT)'
    };
  }

  // 5. Index & Sectoral ETFs
  if (
    sym.includes('BEES') ||
    sym.includes('ETF') ||
    sym.includes('NIFTY') ||
    sym.includes('SENSEX') ||
    sym.includes('MON100') ||
    sym.includes('MAFANG') ||
    sym.includes('CPSE')
  ) {
    return {
      category: 'Mutual Funds',
      subCategory: 'Exchange Traded Fund (ETF)'
    };
  }

  // 6. Mutual Funds (if named with Fund, Direct, Growth, etc.)
  if (
    sym.includes('FUND') ||
    sym.includes('MUTUAL') ||
    sym.includes('GROWTH') ||
    sym.includes('DIRECT') ||
    sym.includes('INDEX')
  ) {
    return {
      category: 'Mutual Funds',
      subCategory: 'Mutual Fund Holding'
    };
  }

  // 7. Standard Equities (Large, Mid, Small Cap)
  return {
    category: 'Equity',
    subCategory: sector ? `Direct Stock (${sector})` : 'Direct Stock (NSE/BSE)'
  };
}

/**
 * Intelligent detector and mapper for 2D string/number arrays (from CSV, XLS, or XLSX)
 */
export function mapRowsToAssets(rows: any[][], defaultProfileId: string = 'personal'): Asset[] {
  if (!rows || rows.length < 2) return [];

  // Find header row (some Zerodha Console & Excel sheets have title/client info banners in rows 0-25)
  let headerRowIdx = -1;
  for (let r = 0; r < Math.min(rows.length, 30); r++) {
    const row = rows[r];
    if (!row || !Array.isArray(row)) continue;
    const rowStr = row.map(c => String(c || '').toLowerCase().trim()).join(' ');
    
    // Check for Zerodha Kite / Console header keywords
    const hasInstrumentOrSymbol =
      rowStr.includes('instrument') ||
      rowStr.includes('tradingsymbol') ||
      rowStr.includes('symbol') ||
      rowStr.includes('stock name') ||
      rowStr.includes('scheme name') ||
      rowStr.includes('asset name') ||
      rowStr.includes('isin');

    const hasQtyOrValue =
      rowStr.includes('qty') ||
      rowStr.includes('quantity') ||
      rowStr.includes('cur. val') ||
      rowStr.includes('current value') ||
      rowStr.includes('ltp') ||
      rowStr.includes('avg. cost') ||
      rowStr.includes('buy price') ||
      rowStr.includes('invested');

    if (hasInstrumentOrSymbol && hasQtyOrValue) {
      headerRowIdx = r;
      break;
    }
  }

  // Fallback to row 0 if no header found
  if (headerRowIdx === -1) headerRowIdx = 0;

  const header = rows[headerRowIdx].map(h => String(h || '').toLowerCase().trim());
  const assets: Asset[] = [];

  // Detect broker signatures
  const isZerodha = header.some(h => h.includes('instrument') || h.includes('tradingsymbol') || h.includes('isin')) &&
                    header.some(h => h.includes('cur. val') || h.includes('current value') || h.includes('qty') || h.includes('ltp'));

  const isGroww = header.some(h => h.includes('scheme name') || h.includes('stock name')) &&
                  header.some(h => h.includes('invested') || h.includes('current'));

  const isCams = header.some(h => h.includes('folio') || h.includes('scheme description')) &&
                 header.some(h => h.includes('valuation') || h.includes('cost value') || h.includes('units'));

  // Column indexes for Zerodha Kite & Console
  const nameIdx = header.findIndex(h =>
    h === 'instrument' ||
    h === 'tradingsymbol' ||
    h === 'symbol' ||
    h === 'stock symbol' ||
    h.includes('instrument') ||
    h.includes('tradingsymbol') ||
    h.includes('symbol') ||
    h.includes('stock name') ||
    h.includes('scheme name') ||
    h.includes('asset name') ||
    h.includes('description')
  );

  const qtyIdx = header.findIndex(h =>
    h === 'qty.' ||
    h === 'qty' ||
    h === 'quantity' ||
    h.includes('available qty') ||
    h.includes('quantity available') ||
    h.includes('qty') ||
    h.includes('quantity') ||
    h.includes('units') ||
    h.includes('balance units')
  );

  const avgCostIdx = header.findIndex(h =>
    h === 'avg. cost' ||
    h === 'avg cost' ||
    h === 'avg. price' ||
    h === 'avg price' ||
    h.includes('avg. cost') ||
    h.includes('average cost') ||
    h.includes('average price') ||
    h.includes('buy price') ||
    h.includes('buy avg')
  );

  const ltpIdx = header.findIndex(h =>
    h === 'ltp' ||
    h === 'current price' ||
    h.includes('last traded price') ||
    h.includes('ltp') ||
    h.includes('close price') ||
    h.includes('nav')
  );

  const currentValIdx = header.findIndex(h =>
    h === 'cur. val' ||
    h === 'cur. val.' ||
    h === 'cur val' ||
    h === 'current value' ||
    h === 'market value' ||
    h.includes('cur. val') ||
    h.includes('current value') ||
    h.includes('present value') ||
    h.includes('valuation') ||
    h.includes('market value')
  );

  const investedValIdx = header.findIndex(h =>
    h === 'invested' ||
    h === 'invested value' ||
    h === 'buy value' ||
    h === 'cost' ||
    h.includes('invested value') ||
    h.includes('total cost') ||
    h.includes('cost value') ||
    h.includes('purchase value')
  );

  const categoryIdx = header.findIndex(h =>
    h.includes('category') || h.includes('type') || h.includes('asset class')
  );

  const sectorIdx = header.findIndex(h =>
    h.includes('sector') || h.includes('industry')
  );

  const institutionIdx = header.findIndex(h =>
    h.includes('institution') || h.includes('broker') || h.includes('platform') || h.includes('amc') || h.includes('fund house')
  );

  const isinIdx = header.findIndex(h => h.includes('isin'));

  const cleanNum = (val: any) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !Array.isArray(row) || row.length < 2) continue;

    const rawName = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : '';
    // Skip empty lines, summary/total lines
    if (
      !rawName ||
      rawName.toLowerCase().startsWith('total') ||
      rawName.toLowerCase().startsWith('grand total') ||
      rawName.toLowerCase().startsWith('disclaimer') ||
      rawName.toLowerCase().startsWith('note') ||
      rawName.toLowerCase().startsWith('client id')
    ) {
      continue;
    }

    const qty = qtyIdx !== -1 ? cleanNum(row[qtyIdx]) : undefined;
    const avgCost = avgCostIdx !== -1 ? cleanNum(row[avgCostIdx]) : 0;
    const ltp = ltpIdx !== -1 ? cleanNum(row[ltpIdx]) : 0;
    const sector = sectorIdx !== -1 && row[sectorIdx] ? String(row[sectorIdx]).trim() : undefined;
    const isin = isinIdx !== -1 && row[isinIdx] ? String(row[isinIdx]).trim() : undefined;

    // Determine current value: from column, or computed as Qty * LTP
    let currentVal = currentValIdx !== -1 ? cleanNum(row[currentValIdx]) : 0;
    if (currentVal === 0 && qty && ltp) {
      currentVal = qty * ltp;
    }

    // Determine invested value: from column, or computed as Qty * Avg Cost, or fallback to currentVal
    let investedVal = investedValIdx !== -1 ? cleanNum(row[investedValIdx]) : 0;
    if (investedVal === 0 && qty && avgCost) {
      investedVal = qty * avgCost;
    }
    if (investedVal === 0) {
      investedVal = currentVal;
    }
    if (currentVal === 0) {
      currentVal = investedVal;
    }

    // Determine Institution
    let inst = institutionIdx !== -1 && row[institutionIdx]
      ? String(row[institutionIdx]).trim()
      : (isZerodha ? 'Zerodha Kite' : isGroww ? 'Groww' : isCams ? 'CAMS / MF' : 'Zerodha Kite');

    // Classification (Zerodha Instrument Rules + Sector)
    let { category, subCategory } = classifyZerodhaInstrument(rawName, sector);

    if (categoryIdx !== -1 && row[categoryIdx]) {
      const catText = String(row[categoryIdx]).toLowerCase();
      if (catText.includes('fund') || catText.includes('mf') || catText.includes('mutual')) category = 'Mutual Funds';
      else if (catText.includes('gold') || catText.includes('sgb') || catText.includes('metal')) category = 'Precious Metals';
      else if (catText.includes('epf') || catText.includes('ppf') || catText.includes('nps')) category = 'Govt & EPF/PPF';
      else if (catText.includes('real estate') || catText.includes('reit')) category = 'Real Estate';
      else if (catText.includes('deposit') || catText.includes('fd')) category = 'Fixed Income & Deposits';
      else if (catText.includes('cash') || catText.includes('bank')) category = 'Cash & Bank';
      else if (catText.includes('crypto')) category = 'Crypto & Alternate';
    }

    // Construct notes
    let notes = '';
    if (isin) notes += `ISIN: ${isin} `;
    if (qty && ltp) notes += `| Qty: ${qty} @ LTP ₹${ltp}`;

    if (currentVal > 0 || investedVal > 0) {
      assets.push({
        id: `imported-zerodha-${Date.now()}-${i}`,
        name: rawName,
        category,
        subCategory,
        institution: inst,
        currentValue: Math.round(currentVal),
        investedValue: Math.round(investedVal),
        units: qty,
        currency: 'INR',
        profileId: defaultProfileId,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
  }

  return assets;
}

/**
 * Universal Spreadsheet File Parser for .csv, .xls, .xlsx, .ods (processes all sheets in workbook!)
 */
export async function parseSpreadsheetFile(file: File, defaultProfileId: string = 'personal'): Promise<Asset[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  const allAssets: Asset[] = [];

  // Iterate over all sheets in the Excel workbook (e.g. Holdings, Equity, Mutual Funds)
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;
    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    const sheetAssets = mapRowsToAssets(rows, defaultProfileId);
    allAssets.push(...sheetAssets);
  }

  return allAssets;
}

/**
 * Parses raw text string (for demo samples and pasteboards)
 */
export function parseBrokerCsv(csvText: string, defaultProfileId: string = 'personal'): Asset[] {
  const workbook = XLSX.read(csvText, { type: 'string' });
  const allAssets: Asset[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;
    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    const sheetAssets = mapRowsToAssets(rows, defaultProfileId);
    allAssets.push(...sheetAssets);
  }

  return allAssets;
}

/**
 * Exports current assets list to CSV string
 */
export function exportAssetsToCsv(assets: Asset[]): string {
  const headers = ['Name', 'Category', 'Sub-Category', 'Institution', 'Invested Value (INR)', 'Current Value (INR)', 'Gain/Loss (INR)', 'Gain %', 'Currency', 'Updated Date'];
  const rows = assets.map(a => {
    const gain = a.currentValue - a.investedValue;
    const gainPct = a.investedValue > 0 ? ((gain / a.investedValue) * 100).toFixed(2) : '0';
    return [
      `"${a.name}"`,
      `"${a.category}"`,
      `"${a.subCategory}"`,
      `"${a.institution}"`,
      a.investedValue,
      a.currentValue,
      gain,
      `${gainPct}%`,
      a.currency,
      a.updatedAt
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Exports current assets list to Excel (.xlsx) file
 */
export function exportAssetsToExcel(assets: Asset[], fileName?: string): void {
  const rows = assets.map(a => {
    const gain = a.currentValue - a.investedValue;
    const gainPct = a.investedValue > 0 ? Number(((gain / a.investedValue) * 100).toFixed(2)) : 0;
    return {
      'Instrument / Asset': a.name,
      'Category': a.category,
      'Sub-Category': a.subCategory,
      'Institution / Broker': a.institution,
      'Invested Value (INR)': a.investedValue,
      'Current Value (INR)': a.currentValue,
      'Gain / Loss (INR)': gain,
      'Gain %': `${gainPct}%`,
      'Units / Quantity': a.units || '',
      'Currency': a.currency,
      'Last Updated': a.updatedAt
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Zerodha Portfolio');

  const outFileName = fileName || `FinBoom_Zerodha_Portfolio_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, outFileName);
}
