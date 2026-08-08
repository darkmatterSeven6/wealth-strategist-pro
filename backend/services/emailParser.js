/**
 * DV Financials - Non-Invasive Email Receipt & Notification Parser
 * Extracts transaction reference numbers, amounts (PHP), transaction types
 * (Deposit, Debit, Daily Interest Earned, Fund Purchases), and balances.
 * 
 * Target Senders:
 * - Maya: no-reply@maya.ph, notifications@maya.ph
 * - MariBank: notifications@maribank.ph, service@maribank.ph
 * - GoTyme: support@gotyme.com.ph, notifications@gotyme.com.ph
 * - GCash / GInvest: no-reply@gcash.com, notifications@gcash.com
 * - Tonik: no-reply@tonikbank.com
 * - Atome: service@atome.ph
 */

const dataStore = require('./dataStore');

class EmailParser {
  constructor() {
    this.senderPatterns = {
      maya: /@(maya\.ph|paymaya\.com)/i,
      maribank: /@maribank\.ph/i,
      gotyme: /@gotyme\.com\.ph/i,
      gcash: /@(gcash\.com|mynt\.xyz)/i,
      tonik: /@tonikbank\.com/i,
      atome: /@atome\.ph/i
    };
  }

  /**
   * Parse a raw email notification or receipt text
   * @param {Object} emailPayload - { from, subject, body, date }
   * @returns {Object} parsed transaction record
   */
  parseEmailReceipt(emailPayload) {
    const { from = '', subject = '', body = '', date = new Date().toISOString() } = emailPayload;
    const text = `${subject}\n${body}`;

    let institution = 'Unknown';
    if (this.senderPatterns.maya.test(from) || /maya/i.test(subject)) institution = 'Maya Bank';
    else if (this.senderPatterns.maribank.test(from) || /maribank/i.test(subject)) institution = 'MariBank';
    else if (this.senderPatterns.gotyme.test(from) || /gotyme/i.test(subject)) institution = 'GoTyme Bank';
    else if (this.senderPatterns.gcash.test(from) || /gcash|ginvest/i.test(subject)) institution = 'GCash / GInvest';
    else if (this.senderPatterns.tonik.test(from) || /tonik/i.test(subject)) institution = 'Tonik Bank';
    else if (this.senderPatterns.atome.test(from) || /atome/i.test(subject)) institution = 'Atome Savings';

    // 1. Extract Amount (PHP / ₱)
    const amountMatch = text.match(/(?:PHP|Php|₱|\bAmount:?\s*PHP?)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

    // 2. Extract Reference Number
    const refMatch = text.match(/(?:Ref(?:\.|erence)?\s*(?:No|Number|ID)?|Transaction\s*(?:ID|Ref|No)?|Trace\s*No\.?)[:\s#]*([A-Za-z0-9\-_]{6,30})/i);
    const referenceNumber = refMatch ? refMatch[1].trim() : `REF-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    // 3. Determine Transaction Type
    let type = 'Transfer';
    if (/daily\s*interest|interest\s*earned|interest\s*credited|interest\s*credit/i.test(text)) {
      type = 'Daily Interest Earned';
    } else if (/cash\s*in|deposit|received\s*money|money\s*received|funds?\s*credited|fund\s*transfer\s*received/i.test(text)) {
      type = 'Deposit';
    } else if (/sent\s*money|money\s*sent|transfer\s*to|paid|payment\s*to|debit|purchase/i.test(text)) {
      type = 'Debit';
    } else if (/ginvest|gfunds|feeder\s*fund|subscription|buy\s*fund/i.test(text)) {
      type = 'Fund Purchase';
    } else if (/bill\s*payment|pay\s*bills|utility/i.test(text)) {
      type = 'Bill Payment';
    }

    // 4. Extract Running Balance if available
    const balMatch = text.match(/(?:Available\s*Balance|New\s*Balance|Remaining\s*Balance|Total\s*Balance)[:\s]*(?:PHP|Php|₱)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i);
    const runningBalance = balMatch ? parseFloat(balMatch[1].replace(/,/g, '')) : null;

    const parsedRecord = {
      id: `tx-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      institution,
      referenceNumber,
      type,
      amount,
      runningBalance,
      subject,
      sender: from,
      timestamp: date,
      parsedAt: new Date().toISOString(),
      rawSummary: text.substring(0, 150).replace(/\s+/g, ' ')
    };

    return parsedRecord;
  }

  /**
   * Ingest an email receipt and apply changes to dataStore
   * @param {Object} emailPayload 
   */
  ingestAndApply(emailPayload) {
    const record = this.parseEmailReceipt(emailPayload);
    const db = dataStore.getDb();

    if (!db.transactions) db.transactions = [];
    db.transactions.unshift(record);

    // Keep last 200 transactions
    if (db.transactions.length > 200) {
      db.transactions = db.transactions.slice(0, 200);
    }

    // Auto-update matched account if applicable
    let matchedAccount = null;
    if (record.institution.includes('MariBank')) matchedAccount = db.accounts.find(a => a.id === 'acc-maribank-01');
    else if (record.institution.includes('Maya')) matchedAccount = db.accounts.find(a => a.id === 'acc-maya-01');
    else if (record.institution.includes('GoTyme')) matchedAccount = db.accounts.find(a => a.id === 'acc-gotyme-01');
    else if (record.institution.includes('Atome')) matchedAccount = db.accounts.find(a => a.id === 'acc-atome-01');
    else if (record.institution.includes('Tonik')) matchedAccount = db.accounts.find(a => a.id === 'acc-tonik-01');

    if (matchedAccount) {
      if (record.runningBalance !== null && record.runningBalance > 0) {
        matchedAccount.balance = record.runningBalance;
      } else if (record.type === 'Daily Interest Earned' || record.type === 'Deposit') {
        matchedAccount.balance = parseFloat((matchedAccount.balance + record.amount).toFixed(2));
      } else if (record.type === 'Debit' || record.type === 'Bill Payment') {
        matchedAccount.balance = parseFloat(Math.max(0, matchedAccount.balance - record.amount).toFixed(2));
      }
      matchedAccount.lastSynced = new Date().toISOString();
    }

    dataStore.saveDb(db);
    dataStore.addSyncLog(
      `Email Parser (${record.institution})`,
      'success',
      `Parsed receipt [${record.referenceNumber}]: ${record.type} ₱${record.amount.toLocaleString()}`
    );

    return {
      success: true,
      transaction: record,
      updatedAccount: matchedAccount
    };
  }
}

module.exports = new EmailParser();
