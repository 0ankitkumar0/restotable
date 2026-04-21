const db = require('better-sqlite3')('./restopos.db');
console.log('=== DATABASE: restopos.db ===\n');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => {
  const count = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
  console.log(`📋 ${t.name}: ${count.c} rows`);
});

console.log('\n=== USERS ===');
console.log(db.prepare('SELECT id, name, email, role FROM users').all());

console.log('\n=== CATEGORIES ===');
console.log(db.prepare('SELECT id, name FROM categories').all());

console.log('\n=== TABLES ===');
console.log(db.prepare('SELECT id, table_number, seats, status FROM tables').all());

console.log('\n=== RECENT ORDERS (last 5) ===');
console.log(db.prepare('SELECT id, customer_name, status, total, notes, created_at FROM orders ORDER BY created_at DESC LIMIT 5').all());

db.close();
