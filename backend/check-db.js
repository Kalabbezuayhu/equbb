const Database = require('better-sqlite3');
const path = require('path');

const DB_FILE = path.join(__dirname, 'equb.db');
const db = new Database(DB_FILE);

console.log('Checking database...');

const users = db.prepare('SELECT * FROM users').all();
console.log('Users:', users);

const members = db.prepare('SELECT * FROM members').all();
console.log('Members:', members);

const contributions = db.prepare('SELECT * FROM contributions').all();
console.log('Contributions:', contributions);

db.close();
