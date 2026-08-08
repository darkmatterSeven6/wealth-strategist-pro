/**
 * DV Financials - Fund Screenshot & Statement Intelligent Text Parser
 * Specializes in extracting metrics from GCash GFunds, Maya Investa, Seedbox, and BPI Wealth.
 */

function cleanNumber(str) {
  if (!str) return null;
  const cleaned = str.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDateString(str) {
  if (!str) return null;
  // e.g. "Aug 05, 2026", "08/05/2026", "2026-08-05", "August 5, 2026"
  const monthMap = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  const textMonthMatch = str.match(/([A-Za-z]{3,9})\s+([0-9]{1,2}),?\s+([0-9]{4})/i);
  if (textMonthMatch) {
    const monthKey = textMonthMatch[1].toLowerCase().slice(0, 3);
    const month = monthMap[monthKey] || '01';
    const day = String(textMonthMatch[2]).padStart(2, '0');
    const year = textMonthMatch[3];
    return `${year}-${month}-${day}`;
  }

  const isoMatch = str.match(/([0-9]{4})-([0-9]{2})-([0-9]{2})/);
  if (isoMatch) return isoMatch[0];

  return null;
}

/**
 * Intelligent regex parser for OCR extracted text
 * @param {string} rawText 
 * @param {object} metadata - optional hints like platform or fundName
 */
function parseFundStatementText(rawText, metadata = {}) {
  if (!rawText || typeof rawText !== 'string') {
    return { success: false, error: 'Empty text input' };
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const fullText = rawText.replace(/\s+/g, ' ');

  const result = {
    totalInvestmentValue: null,
    totalUnits: null,
    navpu: null,
    navpuDate: null,
    pendingBuyOrders: 0,
    pendingSellOrders: 0,
    oneYearReturn: null,
    fundNameDetected: null,
    rawTextPreview: rawText.slice(0, 300)
  };

  // 1. Extract Total Investment Value
  // Matches: "Total Investment Value PHP 1,014.84", "Investment Value: 1,014.84"
  const valueMatch = 
    fullText.match(/Total\s+Investment\s+Value\s*(?:PHP|Php|₱)?\s*([0-9,]+\.[0-9]{2})/i) ||
    fullText.match(/Investment\s+Value\s*(?:PHP|Php|₱)?\s*([0-9,]+\.[0-9]{2})/i) ||
    fullText.match(/Total\s+Value\s*(?:PHP|Php|₱)?\s*([0-9,]+\.[0-9]{2})/i);
  if (valueMatch) {
    result.totalInvestmentValue = cleanNumber(valueMatch[1]);
  }

  // 2. Extract Total Units
  // Matches: "Total Units 2.0419", "Units: 2.0419"
  const unitsMatch = 
    fullText.match(/Total\s+Units\s*[:\s]*([0-9,]+\.[0-9]{2,6})/i) ||
    fullText.match(/Units\s+Held\s*[:\s]*([0-9,]+\.[0-9]{2,6})/i) ||
    fullText.match(/Units\s*[:\s]*([0-9,]+\.[0-9]{2,6})/i);
  if (unitsMatch) {
    result.totalUnits = cleanNumber(unitsMatch[1]);
  }

  // 3. Extract NAVPU (Net Asset Value per Unit)
  // Matches: "NAVPU (Net Asset Value per Unit) PHP 497.009196", "NAVPU PHP 497.009196"
  const navpuMatch = 
    fullText.match(/NAVPU\s*(?:\([^)]*\))?\s*(?:PHP|Php|₱)?\s*([0-9,]+\.[0-9]{2,6})/i) ||
    fullText.match(/Net\s+Asset\s+Value\s*per\s*Unit\s*(?:PHP|Php|₱)?\s*([0-9,]+\.[0-9]{2,6})/i) ||
    fullText.match(/NAV\s*[:\s]*(?:PHP|Php|₱)?\s*([0-9,]+\.[0-9]{2,6})/i);
  if (navpuMatch) {
    result.navpu = cleanNumber(navpuMatch[1]);
  }

  // 4. Extract As of Date
  // Matches: "as of Aug 05, 2026", "as of 2026-08-05"
  const dateMatch = 
    fullText.match(/as\s+of\s+([A-Za-z]{3,9}\s+[0-9]{1,2},?\s+[0-9]{4})/i) ||
    fullText.match(/Date\s*[:\s]*([A-Za-z]{3,9}\s+[0-9]{1,2},?\s+[0-9]{4})/i) ||
    fullText.match(/([A-Za-z]{3,9}\s+[0-9]{1,2},?\s+[0-9]{4})/i);
  if (dateMatch) {
    result.navpuDate = parseDateString(dateMatch[1]);
  }

  // 5. Extract Pending Buy Orders
  const pendingBuyMatch = 
    fullText.match(/Pending\s+Buy\s+Orders?\s*(?:PHP|Php|₱)?\s*([0-9,]+\.[0-9]{2})/i) ||
    fullText.match(/Pending\s+Buy\s*(?:PHP|Php|₱)?\s*([0-9,]+\.[0-9]{2})/i);
  if (pendingBuyMatch) {
    result.pendingBuyOrders = cleanNumber(pendingBuyMatch[1]) || 0;
  }

  // 6. Extract Pending Sell Orders
  const pendingSellMatch = 
    fullText.match(/Pending\s+Sell\s+Orders?\s*(?:PHP|Php|₱)?\s*([0-9,]+\.[0-9]{2})/i) ||
    fullText.match(/Pending\s+Sell\s*(?:PHP|Php|₱)?\s*([0-9,]+\.[0-9]{2})/i);
  if (pendingSellMatch) {
    result.pendingSellOrders = cleanNumber(pendingSellMatch[1]) || 0;
  }

  // 7. Extract Past 1 Year Return %
  // Matches: "Past 1 Year Return ▲ 33.9300%", "1-Year Return 33.93%"
  const returnMatch = 
    fullText.match(/(?:Past\s+)?1\s*[- ]?Year\s+Return\s*[:\s]*[▲▼+-]?\s*([0-9,]+\.[0-9]+)%?/i) ||
    fullText.match(/1\s*Yr\s+Return\s*[:\s]*[▲▼+-]?\s*([0-9,]+\.[0-9]+)%?/i);
  if (returnMatch) {
    result.oneYearReturn = cleanNumber(returnMatch[1]);
  }

  // 8. Fund Name heuristics from context
  const lower = fullText.toLowerCase();
  if (lower.includes('technology') || lower.includes('tech')) {
    result.fundNameDetected = 'ATRAM Global Technology Feeder Fund';
  } else if (lower.includes('multi-asset') || lower.includes('alfm')) {
    result.fundNameDetected = 'ALFM Global Multi-Asset Income Fund Inc - PHP';
  } else if (lower.includes('consumer')) {
    result.fundNameDetected = 'ATRAM Global Consumer Trends Feeder Fund';
  } else if (lower.includes('infra')) {
    result.fundNameDetected = 'ATRAM Global Infra Equity Feeder Fund';
  } else if (lower.includes('reit')) {
    result.fundNameDetected = 'Manulife Global REIT Feeder Fund';
  } else if (lower.includes('stock index') || lower.includes('psei') || lower.includes('psif')) {
    result.fundNameDetected = 'Philippine Stock Index Fund (Units)';
  }

  // Sanity check: if NAVPU and Units exist but Value is missing, calculate it
  if (result.totalUnits && result.navpu && !result.totalInvestmentValue) {
    result.totalInvestmentValue = parseFloat((result.totalUnits * result.navpu).toFixed(2));
  }

  // If Units is missing but Value and NAVPU exist, derive Units
  if (!result.totalUnits && result.totalInvestmentValue && result.navpu && result.navpu > 0) {
    result.totalUnits = parseFloat((result.totalInvestmentValue / result.navpu).toFixed(4));
  }

  return {
    success: true,
    data: result
  };
}

module.exports = {
  parseFundStatementText,
  cleanNumber,
  parseDateString
};
