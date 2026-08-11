const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '../data/dv_financials.db');
const backupDir = path.resolve(__dirname, '../data/backups');
const backupPath = path.resolve(backupDir, 'dv_financials_PRE_MULTITENANT.db');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

fs.copyFileSync(srcPath, backupPath);
console.log("🛡️ [SYSTEM RESTORE POINT CREATED]: Written to " + backupPath);
