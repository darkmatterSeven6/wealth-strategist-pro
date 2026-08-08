/**
 * DV Financials - Philippine UITF & Mutual Fund Live NAVPU Scraper & Valuation Worker
 * Targets BPI Wealth / ALFM, ATRAM, and Manulife feeds with automated daily cron at 6:00 PM PHT.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const dataStore = require('./dataStore');

class NavpuScraper {
  constructor() {
    this.cronJob = null;
    this.isInitialized = false;
    this.isScraping = false;
  }

  /**
   * Initialize automated daily 6:00 PM PHT sync worker
   */
  initScheduler() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 6:00 PM Asia/Manila (18:00 PHT) every day
    this.cronJob = cron.schedule('0 18 * * *', async () => {
      console.log('⏰ [NAVPU Scraper] Triggering scheduled 6:00 PM PHT End-of-Day Fund NAVPU Sync...');
      try {
        await this.scrapeAllFunds(true);
      } catch (err) {
        console.error('❌ [NAVPU Scraper Cron Error]:', err.message);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Manila'
    });

    console.log('✅ [NAVPU Scraper] Scheduled daily 6:00 PM PHT fund valuation worker (Asia/Manila).');
  }

  /**
   * Scrape / Fetch latest NAVPU for all configured funds across the database
   * @param {boolean} isScheduled
   */
  async scrapeAllFunds(isScheduled = false) {
    if (this.isScraping) {
      console.log('[NAVPU Scraper] Scrape already in progress, skipping overlapping run.');
      return dataStore.getDb().funds || [];
    }

    this.isScraping = true;
    const db = dataStore.getDb();
    const funds = db.funds || [];
    const results = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const triggerSource = isScheduled ? 'Automated 6:00 PM PHT Worker' : 'Manual Sync / Fetch';

    try {
      for (const fund of funds) {
        let latestNavpu = fund.currentNavpu;
        let sourceUsed = 'verified_stored_navpu';
        let scrapedNavpu = null;

        try {
          // 1. ALFM / BPI Wealth Mutual Funds
          if (
            fund.id.includes('alfm') || 
            fund.id.includes('bpi') || 
            (fund.provider && (fund.provider.includes('ALFM') || fund.provider.includes('BPI Wealth')))
          ) {
            scrapedNavpu = await this.scrapeAlfmPortal(fund.id);
            if (scrapedNavpu && scrapedNavpu > 0) {
              latestNavpu = scrapedNavpu;
              sourceUsed = 'bpi_alfm_official_portal';
            }
          }
          // 2. ATRAM Feeder & UITF Funds
          else if (fund.id.includes('atram') || (fund.provider && fund.provider.includes('ATRAM'))) {
            scrapedNavpu = await this.scrapeAtramPortal(fund.id);
            if (scrapedNavpu && scrapedNavpu > 0) {
              latestNavpu = scrapedNavpu;
              sourceUsed = 'atram_official_portal';
            }
          }
          // 3. Manulife Feeder Funds
          else if (fund.id.includes('manulife') || (fund.provider && fund.provider.includes('Manulife'))) {
            scrapedNavpu = await this.scrapeManulifePortal(fund.id);
            if (scrapedNavpu && scrapedNavpu > 0) {
              latestNavpu = scrapedNavpu;
              sourceUsed = 'manulife_official_portal';
            }
          }
        } catch (err) {
          console.warn(`[NAVPU Scraper] Web scrape fetch failed for ${fund.name}: ${err.message}. Retaining verified valuation.`);
        }

        const previousNavpu = fund.currentNavpu || latestNavpu;
        const history = fund.historicalNavpu ? [...fund.historicalNavpu] : [];
        
        // Update or append today's entry if NAVPU changed or fresh
        const existingIdx = history.findIndex(h => h.date === todayStr);
        if (existingIdx >= 0) {
          history[existingIdx].navpu = latestNavpu;
        } else if (sourceUsed !== 'verified_stored_navpu') {
          history.push({ date: todayStr, navpu: latestNavpu });
        }

        const currentMarketValue = parseFloat(((fund.unitsHeld || 0) * latestNavpu).toFixed(2));
        const investedCapital = fund.investedCapital || 0;
        const unrealizedGain = parseFloat((currentMarketValue - investedCapital).toFixed(2));
        const unrealizedGainPercent = investedCapital > 0 
          ? parseFloat(((unrealizedGain / investedCapital) * 100).toFixed(2)) 
          : 0;

        const updatedFund = {
          ...fund,
          previousNavpu,
          currentNavpu: latestNavpu,
          navpuDate: sourceUsed !== 'verified_stored_navpu' ? todayStr : (fund.navpuDate || todayStr),
          currentMarketValue,
          unrealizedGain,
          unrealizedGainPercent,
          historicalNavpu: history
        };

        results.push(updatedFund);
      }

      // Save back to data store
      db.funds = results;
      dataStore.saveDb(db);
      dataStore.addSyncLog(
        'NAVPU Valuation Engine',
        'success',
        `${triggerSource}: Synchronized NAVPUs & Market Values for ${results.length} Philippine Funds (ALFM, ATRAM, Manulife).`
      );

      // Broadcast live update via WebSocket to all connected browser tabs
      if (typeof global.broadcastEvent === 'function') {
        global.broadcastEvent('DATA_UPDATED', { type: 'FUNDS_SYNC', count: results.length });
      }

      console.log(`✅ [NAVPU Scraper] Sync completed successfully (${triggerSource}).`);
      return results;
    } finally {
      this.isScraping = false;
    }
  }

  /**
   * Scrape ALFM / BPI Wealth Mutual Funds Portal
   */
  async scrapeAlfmPortal(fundId) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    };

    // Primary: ALFM official funds portal
    try {
      const response = await axios.get('https://www.alfmfunds.com/fund-performance', { headers, timeout: 5000 });
      if (response.status === 200 && response.data) {
        const $ = cheerio.load(response.data);
        let extracted = null;

        $('tr, .fund-row, div').each((i, el) => {
          const txt = $(el).text();
          
          if (fundId === 'fund-alfm-multi-asset' && (txt.includes('Global Multi-Asset') || txt.includes('Global Multi Asset'))) {
            const matches = txt.match(/4[0-9]\.[0-9]{2,4}/g);
            if (matches && matches.length > 0) extracted = parseFloat(matches[0]);
          } else if (fundId === 'fund-alfm-multi-asset-usd' && (txt.includes('USD') || txt.includes('Dollar')) && txt.includes('Multi-Asset')) {
            const matches = txt.match(/0\.[89][0-9]{2,4}/g);
            if (matches && matches.length > 0) extracted = parseFloat(matches[0]);
          } else if (fundId === 'fund-alfm-money-market' && txt.includes('Money Market')) {
            const matches = txt.match(/14[0-9]\.[0-9]{2,4}/g);
            if (matches && matches.length > 0) extracted = parseFloat(matches[0]);
          } else if (fundId === 'fund-alfm-growth' && txt.includes('Growth Fund')) {
            const matches = txt.match(/2[0-9]{2}\.[0-9]{2,4}/g);
            if (matches && matches.length > 0) extracted = parseFloat(matches[0]);
          } else if (fundId === 'fund-alfm-peso-bond' && txt.includes('Peso Bond')) {
            const matches = txt.match(/3[0-9]{2}\.[0-9]{2,4}/g);
            if (matches && matches.length > 0) extracted = parseFloat(matches[0]);
          } else if (fundId === 'fund-alfm-dollar-bond' && txt.includes('Dollar Bond')) {
            const matches = txt.match(/4[0-9]{2}\.[0-9]{2,4}/g);
            if (matches && matches.length > 0) extracted = parseFloat(matches[0]);
          } else if ((fundId === 'fund-bpi-philippine-stock-index' || fundId === 'fund-alfm-psif') && (txt.includes('Stock Index') || txt.includes('PSIF'))) {
            const matches = txt.match(/7[0-9]{2}\.[0-9]{2,4}/g);
            if (matches && matches.length > 0) extracted = parseFloat(matches[0]);
          }
        });

        if (extracted) return extracted;
      }
    } catch (e) {
      // Fallback
    }

    // Secondary: Philippine Investment Funds Association (PIFA / UITF)
    try {
      const response = await axios.get('https://www.pifa.com.ph/factsheets.asp', { headers, timeout: 5000 });
      if (response.status === 200 && response.data) {
        const $ = cheerio.load(response.data);
        let extracted = null;

        $('tr').each((i, el) => {
          const rowText = $(el).text();
          if (fundId === 'fund-alfm-multi-asset' && rowText.includes('ALFM') && (rowText.includes('Multi-Asset') || rowText.includes('Income'))) {
            const valStr = $(el).find('td').last().text().trim().replace(/[^0-9.]/g, '');
            if (valStr && parseFloat(valStr) > 30) extracted = parseFloat(valStr);
          } else if (fundId === 'fund-alfm-money-market' && rowText.includes('ALFM') && rowText.includes('Money Market')) {
            const valStr = $(el).find('td').last().text().trim().replace(/[^0-9.]/g, '');
            if (valStr && parseFloat(valStr) > 100) extracted = parseFloat(valStr);
          } else if (fundId === 'fund-alfm-growth' && rowText.includes('ALFM') && rowText.includes('Growth')) {
            const valStr = $(el).find('td').last().text().trim().replace(/[^0-9.]/g, '');
            if (valStr && parseFloat(valStr) > 100) extracted = parseFloat(valStr);
          } else if (fundId === 'fund-alfm-peso-bond' && rowText.includes('ALFM') && rowText.includes('Peso Bond')) {
            const valStr = $(el).find('td').last().text().trim().replace(/[^0-9.]/g, '');
            if (valStr && parseFloat(valStr) > 100) extracted = parseFloat(valStr);
          } else if ((fundId === 'fund-bpi-philippine-stock-index' || fundId === 'fund-alfm-psif') && rowText.includes('Stock Index')) {
            const valStr = $(el).find('td').last().text().trim().replace(/[^0-9.]/g, '');
            if (valStr && parseFloat(valStr) > 500) extracted = parseFloat(valStr);
          }
        });

        if (extracted) return extracted;
      }
    } catch (e) {
      // Fallback
    }

    return null;
  }

  /**
   * Scrape ATRAM Official Portal
   */
  async scrapeAtramPortal(fundId) {
    try {
      const response = await axios.get('https://www.atram.com.ph/funds/uitf', { 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000 
      });

      if (response.status === 200 && response.data) {
        const $ = cheerio.load(response.data);
        let extractedVal = null;

        $('tr').each((i, el) => {
          const text = $(el).text();
          if (fundId.includes('tech') && (text.includes('Global Technology') || text.includes('Technology Feeder'))) {
            const valStr = $(el).find('td').eq(2).text().trim().replace(/[^0-9.]/g, '');
            if (valStr) extractedVal = parseFloat(valStr);
          } else if (fundId.includes('infra') && (text.includes('Infrastructure') || text.includes('Infra'))) {
            const valStr = $(el).find('td').eq(2).text().trim().replace(/[^0-9.]/g, '');
            if (valStr) extractedVal = parseFloat(valStr);
          } else if (fundId.includes('money-market') && (text.includes('Money Market') || text.includes('Liquid'))) {
            const valStr = $(el).find('td').eq(2).text().trim().replace(/[^0-9.]/g, '');
            if (valStr) extractedVal = parseFloat(valStr);
          } else if (fundId.includes('consumer') && text.includes('Consumer')) {
            const valStr = $(el).find('td').eq(2).text().trim().replace(/[^0-9.]/g, '');
            if (valStr) extractedVal = parseFloat(valStr);
          } else if (fundId.includes('health') && text.includes('Health')) {
            const valStr = $(el).find('td').eq(2).text().trim().replace(/[^0-9.]/g, '');
            if (valStr) extractedVal = parseFloat(valStr);
          } else if (fundId.includes('equity-opportunity') && (text.includes('Opportunity') || text.includes('Morgan'))) {
            const valStr = $(el).find('td').eq(2).text().trim().replace(/[^0-9.]/g, '');
            if (valStr) extractedVal = parseFloat(valStr);
          }
        });

        return extractedVal;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  /**
   * Scrape Manulife Investment Management Portal
   */
  async scrapeManulifePortal(fundId) {
    try {
      const response = await axios.get('https://www.manulifeim.com.ph/prices-and-performance.html', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      });

      if (response.status === 200 && response.data) {
        const $ = cheerio.load(response.data);
        let extractedVal = null;

        $('tr, .fund-item').each((i, el) => {
          const text = $(el).text();
          if (fundId.includes('reit') && !fundId.includes('apac') && (text.includes('Asian REIT') || text.includes('Global REIT'))) {
            const matches = text.match(/1[0-9]{2}\.[0-9]{2,4}/g);
            if (matches && matches.length > 0) extractedVal = parseFloat(matches[0]);
          } else if (fundId.includes('apac') && (text.includes('Asia Pacific REIT') || text.includes('APAC REIT'))) {
            const matches = text.match(/1\.[0-9]{2,4}/g);
            if (matches && matches.length > 0) extractedVal = parseFloat(matches[0]);
          } else if (fundId.includes('preferred') && text.includes('Preferred')) {
            const matches = text.match(/1\.[0-9]{2,4}/g);
            if (matches && matches.length > 0) extractedVal = parseFloat(matches[0]);
          } else if (fundId.includes('dynamic-bond') && text.includes('Dynamic Bond')) {
            const matches = text.match(/1\.[0-9]{2,4}/g);
            if (matches && matches.length > 0) extractedVal = parseFloat(matches[0]);
          }
        });

        return extractedVal;
      }
    } catch (e) {
      return null;
    }
    return null;
  }
}

module.exports = new NavpuScraper();
