const Database = require('better-sqlite3');
const path = require('path');

const DB_FILE = path.join(__dirname, 'equb.db');
const db = new Database(DB_FILE);

const memberColors = [
  '#10b981', '#fbbf24', '#3b82f6', '#8b5cf6',
  '#14b8a6', '#f97316', '#06b6d4', '#ec4899'
];

const testMembers = [
  { name: 'Abebe Kebede', phone: '0911223344', email: 'abebe@example.com', address: 'Addis Ababa' },
  { name: 'Birtukan Tesfaye', phone: '0912334455', email: 'birtukan@example.com', address: 'Bole' },
  { name: 'Chala Abdi', phone: '0913445566', email: 'chala@example.com', address: 'Mekele' }
];

const joinDate = new Date().toISOString().split('T')[0];
const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

console.log('Adding test members...');
const memberStmt = db.prepare('INSERT INTO members (name, phone, email, address, joinDate, color) VALUES (?, ?, ?, ?, ?, ?)');
const testMemberIds = [];

testMembers.forEach((member, index) => {
  const result = memberStmt.run(member.name, member.phone, member.email, member.address, joinDate, memberColors[index % memberColors.length]);
  testMemberIds.push(result.lastInsertRowid);
  console.log(`Added member: ${member.name} (ID: ${result.lastInsertRowid})`);
});

console.log('Adding contributions...');
const equbState = db.prepare('SELECT * FROM equb_state ORDER BY id DESC LIMIT 1').get();
const round = equbState?.round || 1;
const amount = equbState?.equbAmount || 1000;
const contribStmt = db.prepare('INSERT INTO contributions (memberId, memberName, round, amount, date, status, userPaymentRequested, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

testMembers.forEach((member, index) => {
  const status = index === 0 ? 'paid' : 'pending';
  const userPaymentRequested = index === 1 ? 1 : 0;
  contribStmt.run(testMemberIds[index], member.name, round, amount, joinDate, status, userPaymentRequested, dueDate);
  console.log(`Added contribution for ${member.name}: ${status}`);
});

console.log('Updating draw order...');
const currentDrawOrder = JSON.parse(equbState?.drawOrder || '[]');
const newDrawOrder = [...currentDrawOrder, ...testMemberIds];
db.prepare('UPDATE equb_state SET drawOrder = ? WHERE id = (SELECT id FROM equb_state ORDER BY id DESC LIMIT 1)').run(JSON.stringify(newDrawOrder));

console.log('✅ Test data added successfully!');

db.close();
