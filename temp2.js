const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/data/dv_danilo.db');
db.run("UPDATE digital_banks SET current_balance = 5000.00, net_daily_gain = 0.44 WHERE last_four_digits LIKE '%5798%' OR account_name LIKE '%Rainy Days%'", function(err) {
  if (err) console.error(err);
  else console.log('SQLite updated:', this.changes);
  db.close();
});
