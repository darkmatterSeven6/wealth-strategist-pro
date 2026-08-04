# 🚀 FinFlow Pro | Philippine Wealth & Quantitative Aggregator

**FinFlow Pro** is an automated, unified Wealth Management & Cash Flow Hub optimized to run locally on your desktop. It aggregates digital bank accounts, tracks investments in GCash GInvest (GFunds) & Maya Funds, monitors high-yield savings (MariBank, Maya, GoTyme, Atome Save, Tonik), mitigates BNPL credit drag penalties, and executes quantitative portfolio analysis to recommend asset rebalancing.

---

## 💎 Core Capabilities

### 1. Digital Bank & Liquid Yield Aggregation
- **MariBank:** Real-time balance tracking with daily credited interest accrual @ 3.75% p.a.
- **Maya Bank:** Tier tracking with boosted rates up to 10.0%–15.0% p.a. + Personal Goals multi-pockets.
- **GoTyme Bank:** 3.00% p.a. tracking across GoSave automated pockets.
- **Atome Savings (Netbank):** 3.25% p.a. high yield.
- **Tonik Bank:** 4.00%–4.50% Stash pockets + 6.00% Time Deposits.
- **Traditional Banks & Wallets:** BPI Preferred, GCash Wallet, Maya Wallet.

### 2. GInvest & Feeder Fund Quantitative Suite
- **Tracked Funds:**
  - `ATRAM Global Technology Feeder Fund` (Secular AI/Tech)
  - `ATRAM Global Infra Equity Feeder Fund` (Power/Data Centers)
  - `ALFM Global Multi-Asset Income Fund` (5.8% dividend yield)
  - `Manulife Global REIT Feeder Fund` (6.2% dividend yield)
  - `ATRAM Peso Money Market Fund` (Capital preservation)
- **Quantitative Engine Metrics:**
  - **1-Yr Net Return & 3-Yr CAGR:** Compound Annual Growth Rate over multi-year holding periods.
  - **Annualized Volatility ($\sigma$):** Computed from rolling log return standard deviations ($\sigma_{\text{ann}} = \sigma_{\text{period}} \times \sqrt{12}$).
  - **Sharpe Ratio:** Excess return normalized over the Philippine 3-Month Treasury Bill risk-free rate ($R_f = 5.50\%$):
    $$\text{Sharpe} = \frac{\text{CAGR} - R_f}{\sigma_{\text{ann}}}$$
  - **Maximum Drawdown (MDD):** Peak-to-trough historical decline measurement.

### 3. Market-Aware Portfolio Rebalancing
- **Pre-Configured Model Portfolios:**
  1. *Conservative:* 65% Money Market, 20% Multi-Asset/REITs, 15% Global Equities.
  2. *Moderate (Dividend Focus):* 50% Multi-Asset & REITs (monthly payouts), 20% Money Market, 30% Tech & Infra.
  3. *Aggressive (AI Momentum):* 60% Global Tech & Infra, 30% Multi-Asset/REITs, 10% Money Market.
- **Tactical GInvest Execution Checklist:** Generates exact step-by-step instructions for executing trades directly inside GCash GInvest (e.g. "Sell ₱22,500 from ATRAM Peso Money Market -> Buy ₱22,500 ATRAM Global Tech Feeder Fund").

### 4. BNPL & Credit Drag Engine
- **Compounded Effective APR:** Translates deceptively low monthly nominal rates (e.g. 3.49%/mo) into true compounded APR (50.8%+):
  $$\text{Effective APR} = \left(1 + \frac{r_{\text{monthly}}}{100}\right)^{12} - 1$$
- **Grace Period Timers:** Billing cycle countdown timers to prevent overdue penalties.
- **Emergency Liquidity Buffer:** Automated health check ensuring liquid reserves cover 1–2 months minimum (and 3+ months ideal) of monthly living expenses + debt installments.

### 5. Local Ingestion Rails & Statement Parser
- **Proxy Endpoints:** `/api/sync/maribank`, `/api/sync/gcash`, `/api/sync/maya`, `/api/sync/gotyme`, `/api/sync/atome`.
- **E-Statement Parser:** Ingests CSV & JSON bank statement logs.
- **Zero Cloud Leakage:** All data persisted locally to `backend/data/db.json`.

---

## 🛠️ Tech Stack & Architecture

- **Backend:** Node.js (v20.18+), Express, WebSocket (`ws`), Cheerio & Axios (Web Scraping), Local JSON Persistence.
- **Frontend:** React 18, Vite, Tailwind CSS Glassmorphism, Lucide Icons.
- **Port Setup:**
  - Backend API & WebSocket: `http://localhost:5001`
  - Frontend UI Dashboard: `http://localhost:5173`

---

## 🚀 Quick Start (Single-Click Launch)

Double click `start-all.bat` or run via terminal:

```powershell
# 1. Start Backend
cd backend
node server.js

# 2. Start Frontend (in a second terminal)
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser.
