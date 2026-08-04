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
        const defaultRaw = fs.readFileSync(DEFAULT_DATA_PATH, 'utf-8');
        fs.writeFileSync(DB_PATH, defaultRaw, 'utf-8');
      }
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      this.data = JSON.parse(raw);
    } catch (err) {
      console.error('Error initializing DataStore:', err);
      const defaultRaw = fs.readFileSync(DEFAULT_DATA_PATH, 'utf-8');
      this.data = JSON.parse(defaultRaw);
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
