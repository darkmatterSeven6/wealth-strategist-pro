const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'dv_financials.db');
const SQL_PATH = path.join(__dirname, '..', 'data', 'hard_restore.sql');

const sql = fs.readFileSync(SQL_PATH, 'utf8');

const db = new sqlite3.Database(DB_PATH);
db.exec(sql, (err) => {
  if (err) {
    console.error('Error executing SQL:', err);
  } else {
    console.log('✅ SQLite updated successfully from restore.sql');
  }
  db.close();
});
