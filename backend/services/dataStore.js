const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const DEFAULT_DATA_PATH = path.join(__dirname, '..', 'data', 'defaultData.json');

class DataStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DB_PATH)) {
        // Database is locked from auto-seeding. Initialize empty struct if missing.
        this.data = { funds: [], summary: {}, macroData: {} };
        this.saveDb(this.data);
      } else {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error initializing DataStore:', err);
      // Database is locked from auto-seeding. Do not fallback.
      this.data = { funds: [], summary: {}, macroData: {} };
    }
  }

  getDb() {
    if (!this.data) {
      this.init();
    }
    return this.data;
  }

  reloadFromDisk() {
    this.init();
    return this.data;
  }

  saveDb(newData) {
    this.data = { ...this.data, ...newData };
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error saving DataStore:', err);
      return false;
    }
  }

  addSyncLog(source, status, message) {
    const log = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      source,
      status,
      message
    };
    if (!this.data.syncLogs) {
      this.data.syncLogs = [];
    }
    this.data.syncLogs.unshift(log);
    if (this.data.syncLogs.length > 50) {
      this.data.syncLogs = this.data.syncLogs.slice(0, 50);
    }
    this.saveDb(this.data);
    return log;
  }

  resetToDefault() {
    const defaultRaw = fs.readFileSync(DEFAULT_DATA_PATH, 'utf-8');
    this.data = JSON.parse(defaultRaw);
    this.saveDb(this.data);
    return this.data;
  }
}

module.exports = new DataStore();
