const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

console.log('🚀 Starting server...');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Check if dist directory exists
const distPath = path.join(__dirname, '../dist');
console.log('📂 Dist directory:', distPath);
console.log('📂 Dist exists:', fs.existsSync(distPath));

// Serve static files from the frontend dist directory
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Serving static files from dist directory');
} else {
  console.warn('⚠️ Dist directory not found!');
}

// Database file path - check if we're on Render
let DB_DIR;
if (process.env.RENDER) {
  // On Render, use the data directory for persistent storage
  DB_DIR = path.join('/opt/render/project', 'data');
} else {
  DB_DIR = __dirname;
}

console.log('📂 Database directory:', DB_DIR);

// Create the directory if it doesn't exist
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log('✅ Created database directory');
  }
} catch (err) {
  console.error('❌ Error creating database directory:', err);
  process.exit(1);
}

const DB_FILE = path.join(DB_DIR, 'equb.db');
console.log('📄 Database file:', DB_FILE);

// Initialize SQLite database
let db;
try {
  db = new Database(DB_FILE);
  console.log('✅ Connected to SQLite database');
  initializeDatabase();
} catch (err) {
  console.error('❌ Error opening database:', err);
  process.exit(1);
}

// Unique color palette for members
const memberColors = [
  '#10b981', '#fbbf24', '#3b82f6', '#8b5cf6',
  '#14b8a6', '#f97316', '#06b6d4', '#ec4899',
  '#84cc16', '#eab308', '#22c55e', '#06b6d4'
];

// Initialize database tables
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      joinDate TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memberId INTEGER NOT NULL,
      memberName TEXT NOT NULL,
      round INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      userPaymentRequested INTEGER NOT NULL DEFAULT 0,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      dueDate TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS winners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memberId INTEGER NOT NULL,
      memberName TEXT NOT NULL,
      round INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS equb_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round INTEGER NOT NULL DEFAULT 1,
      drawStarted INTEGER NOT NULL DEFAULT 0,
      wheelSpinning INTEGER NOT NULL DEFAULT 0,
      drawOrder TEXT NOT NULL,
      currentWinnerIndex INTEGER NOT NULL DEFAULT 0,
      contributionsPaid INTEGER NOT NULL DEFAULT 0,
      equbAmount INTEGER NOT NULL DEFAULT 1000
    );

    CREATE TABLE IF NOT EXISTS chart_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      contributions INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `);

  // Check if data exists, if not insert minimal default data
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    insertMinimalDefaultData();
  }
}

// Insert minimal default data (only admin user, no test members/contributions/winners)
function insertMinimalDefaultData() {
  console.log('📥 Inserting minimal default data...');
  
  // Insert admin user
  const userStmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  userStmt.run('Kalab Bezuayhu', 'kalabbezuayhu@gmail.com', 'kal123456', 'admin');

  // Insert empty equb state
  const equbStateStmt = db.prepare('INSERT INTO equb_state (round, drawStarted, wheelSpinning, drawOrder, currentWinnerIndex, contributionsPaid, equbAmount) VALUES (?, ?, ?, ?, ?, ?, ?)');
  equbStateStmt.run(1, 0, 0, JSON.stringify([]), 0, 0, 1000);

  console.log('✅ Minimal default data inserted successfully');
}

// Helper function to get equb state
function getEqubState() {
  const row = db.prepare('SELECT * FROM equb_state ORDER BY id DESC LIMIT 1').get();
  if (!row) {
    const defaultState = {
      round: 1,
      drawStarted: false,
      wheelSpinning: false,
      drawOrder: [],
      currentWinnerIndex: 0,
      contributionsPaid: false,
      equbAmount: 1000
    };
    const stmt = db.prepare('INSERT INTO equb_state (round, drawStarted, wheelSpinning, drawOrder, currentWinnerIndex, contributionsPaid, equbAmount) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(
      defaultState.round,
      defaultState.drawStarted ? 1 : 0,
      defaultState.wheelSpinning ? 1 : 0,
      JSON.stringify(defaultState.drawOrder),
      defaultState.currentWinnerIndex,
      defaultState.contributionsPaid ? 1 : 0,
      defaultState.equbAmount
    );
    return defaultState;
  }
  return {
    ...row,
    drawStarted: Boolean(row.drawStarted),
    wheelSpinning: Boolean(row.wheelSpinning),
    contributionsPaid: Boolean(row.contributionsPaid),
    drawOrder: JSON.parse(row.drawOrder),
    equbAmount: row.equbAmount || 1000
  };
}

// Helper function to update equb state
function updateEqubState(state) {
  const stmt = db.prepare(`UPDATE equb_state 
    SET round = ?, drawStarted = ?, wheelSpinning = ?, drawOrder = ?, currentWinnerIndex = ?, contributionsPaid = ?, equbAmount = ?
    WHERE id = (SELECT id FROM equb_state ORDER BY id DESC LIMIT 1)`);
  stmt.run(
    state.round,
    state.drawStarted ? 1 : 0,
    state.wheelSpinning ? 1 : 0,
    JSON.stringify(state.drawOrder),
    state.currentWinnerIndex,
    state.contributionsPaid ? 1 : 0,
    state.equbAmount || 1000
  );
}

// Helper function to calculate due date (7 days from today)
function calculateDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}

// Signup endpoint
app.post('/api/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // First insert user
    const userStmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const userResult = userStmt.run(name, email, password);
    const userId = userResult.lastInsertRowid;
    
    // Then get count of existing members to assign color
    const memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get();
    const color = memberColors[memberCount.count % memberColors.length];
    const joinDate = new Date().toISOString().split('T')[0];
    
    // Insert as member
    const memberStmt = db.prepare('INSERT INTO members (name, phone, email, address, joinDate, color) VALUES (?, ?, ?, ?, ?, ?)');
    const memberResult = memberStmt.run(name, '', email, '', joinDate, color);
    const memberId = memberResult.lastInsertRowid;
    
    // Then add a contribution for the current round
    const equbState = getEqubState();
    const round = equbState.round || 1;
    const amount = equbState.equbAmount || 1000;
    const dueDate = calculateDueDate();
    const contribDate = new Date().toISOString().split('T')[0];
    
    const contribStmt = db.prepare('INSERT INTO contributions (memberId, memberName, round, amount, date, dueDate, userPaymentRequested, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    contribStmt.run(memberId, name, round, amount, contribDate, dueDate, 0, 'pending');
    
    // Also update draw order
    const newEqubState = getEqubState();
    if (!newEqubState.drawOrder.includes(memberId)) {
      newEqubState.drawOrder.push(memberId);
      updateEqubState(newEqubState);
    }
    
    res.json({ success: true, user: { id: userId, name, email, role: 'user' } });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed: users.email')) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    console.error('Error during signup:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get all members
app.get('/api/members', (req, res) => {
  try {
    const members = db.prepare('SELECT * FROM members').all();
    res.json(members);
  } catch (err) {
    console.error('Error getting members:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Add member (with unique color)
app.post('/api/members', (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    // Get count of existing members to assign next color
    const memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get();
    const color = memberColors[memberCount.count % memberColors.length];
    const joinDate = new Date().toISOString().split('T')[0];
    
    const stmt = db.prepare('INSERT INTO members (name, phone, email, address, joinDate, color) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(name, phone, email, address, joinDate, color);
    const newMember = { id: result.lastInsertRowid, name, phone, email, address, joinDate, color };
    
    // Update draw order to include new member
    const equbState = getEqubState();
    if (!equbState.drawOrder.includes(newMember.id)) {
      equbState.drawOrder.push(newMember.id);
      updateEqubState(equbState);
    }
    
    res.json(newMember);
  } catch (err) {
    console.error('Error adding member:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get all contributions
app.get('/api/contributions', (req, res) => {
  try {
    const contributions = db.prepare('SELECT * FROM contributions').all();
    res.json(contributions);
  } catch (err) {
    console.error('Error getting contributions:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// User requests payment (marks as userPaymentRequested
app.put('/api/contributions/:id/request-payment', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('UPDATE contributions SET userPaymentRequested = ? WHERE id = ?');
    stmt.run(1, id);
    const contribution = db.prepare('SELECT * FROM contributions WHERE id = ?').get(id);
    res.json(contribution);
  } catch (err) {
    console.error('Error requesting payment:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Mark contribution as paid
app.put('/api/contributions/:id/paid', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('UPDATE contributions SET status = ? WHERE id = ?');
    stmt.run('paid', id);
    const updatedContribution = db.prepare('SELECT * FROM contributions WHERE id = ?').get(id);
    
    // Check if all contributions are paid
    const pendingContributions = db.prepare('SELECT * FROM contributions WHERE status = ?').all('pending');
    const allPaid = pendingContributions.length === 0;
    
    // Update equb state if all are paid
    if (allPaid) {
      const equbState = getEqubState();
      equbState.contributionsPaid = true;
      updateEqubState(equbState);
    }
    
    res.json(updatedContribution);
  } catch (err) {
    console.error('Error marking contribution paid:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get all winners
app.get('/api/winners', (req, res) => {
  try {
    const winners = db.prepare('SELECT * FROM winners ORDER BY id DESC').all();
    res.json(winners);
  } catch (err) {
    console.error('Error getting winners:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get draw status
app.get('/api/draw-status', (req, res) => {
  try {
    const equbState = getEqubState();
    
    // Get next winner info
    let nextWinner = null;
    if (equbState.drawOrder.length > 0 && equbState.currentWinnerIndex < equbState.drawOrder.length) {
      const nextWinnerId = equbState.drawOrder[equbState.currentWinnerIndex];
      nextWinner = db.prepare('SELECT * FROM members WHERE id = ?').get(nextWinnerId);
    }
    
    res.json({
      round: equbState.round,
      contributionsPaid: equbState.contributionsPaid,
      drawStarted: equbState.drawStarted,
      wheelSpinning: equbState.wheelSpinning,
      nextWinner,
      equbAmount: equbState.equbAmount
    });
  } catch (err) {
    console.error('Error getting draw status:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Start draw
app.post('/api/start-draw', (req, res) => {
  try {
    let equbState = getEqubState();
    
    // If draw order is empty, populate it with all members
    if (equbState.drawOrder.length === 0) {
      const members = db.prepare('SELECT id FROM members').all();
      equbState.drawOrder = members.map(m => m.id);
    }
    
    equbState.drawStarted = true;
    updateEqubState(equbState);
    const newState = getEqubState();
    res.json(newState);
  } catch (err) {
    console.error('Error starting draw:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Set winner and advance
app.post('/api/set-winner', (req, res) => {
  try {
    let equbState = getEqubState();
    
    // Get current winner
    const winnerId = equbState.drawOrder[equbState.currentWinnerIndex];
    const winner = db.prepare('SELECT * FROM members WHERE id = ?').get(winnerId);
    if (!winner) {
      return res.status(500).json({ success: false, message: 'Winner not found' });
    }
    
    // Insert winner into winners table
    const winnerDate = new Date().toISOString().split('T')[0];
    const winnerStmt = db.prepare('INSERT INTO winners (memberId, memberName, round, amount, date) VALUES (?, ?, ?, ?, ?)');
    const winnerResult = winnerStmt.run(winner.id, winner.name, equbState.round, equbState.drawOrder.length * equbState.equbAmount, winnerDate);
    const newWinner = {
      id: winnerResult.lastInsertRowid,
      memberId: winner.id,
      memberName: winner.name,
      round: equbState.round,
      amount: equbState.drawOrder.length * equbState.equbAmount,
      date: winnerDate
    };
    
    // Update equb state
    equbState.currentWinnerIndex++;
    equbState.drawStarted = false;
    
    // Check if we've completed a full cycle
    if (equbState.currentWinnerIndex >= equbState.drawOrder.length) {
      equbState.round++;
      equbState.currentWinnerIndex = 0;
      equbState.contributionsPaid = false;
      
      // Reset all contributions to pending for new round
      const members = db.prepare('SELECT * FROM members').all();
      if (members.length > 0) {
        const contribStmt = db.prepare('INSERT INTO contributions (memberId, memberName, round, amount, date, status, userPaymentRequested, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        const contribDate = new Date().toISOString().split('T')[0];
        const dueDate = calculateDueDate();
        members.forEach(member => {
          contribStmt.run(member.id, member.name, equbState.round, equbState.equbAmount, contribDate, 'pending', 0, dueDate);
        });
      }
    }
    
    updateEqubState(equbState);
    const newState = getEqubState();
    res.json({ winner: newWinner, ...newState });
  } catch (err) {
    console.error('Error setting winner:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get next winner
app.get('/api/next-winner', (req, res) => {
  try {
    const equbState = getEqubState();
    
    if (equbState.drawOrder.length === 0 || equbState.currentWinnerIndex >= equbState.drawOrder.length) {
      return res.json(null);
    }
    
    const winnerId = equbState.drawOrder[equbState.currentWinnerIndex];
    const winner = db.prepare('SELECT * FROM members WHERE id = ?').get(winnerId);
    res.json(winner);
  } catch (err) {
    console.error('Error getting next winner:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get equb amount
app.get('/api/equb-amount', (req, res) => {
  try {
    const equbState = getEqubState();
    res.json({ equbAmount: equbState.equbAmount || 1000 });
  } catch (err) {
    console.error('Error getting equb amount:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Set equb amount (admin only)
app.post('/api/equb-amount', (req, res) => {
  try {
    const { equbAmount } = req.body;
    if (!equbAmount || equbAmount < 100) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    const equbState = getEqubState();
    equbState.equbAmount = equbAmount;
    updateEqubState(equbState);
    res.json({ success: true, equbAmount });
  } catch (err) {
    console.error('Error setting equb amount:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get chart data
app.get('/api/chart-data', (req, res) => {
  try {
    const chartData = db.prepare('SELECT * FROM chart_data').all();
    res.json(chartData);
  } catch (err) {
    console.error('Error getting chart data:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get notifications
app.get('/api/notifications', (req, res) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications ORDER BY id DESC LIMIT 10').all();
    res.json(notifications);
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Start wheel spinning (admin only)
app.post('/api/start-wheel', (req, res) => {
  try {
    const equbState = getEqubState();
    equbState.wheelSpinning = true;
    updateEqubState(equbState);
    const newState = getEqubState();
    res.json(newState);
  } catch (err) {
    console.error('Error starting wheel:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Stop wheel spinning (admin only)
app.post('/api/stop-wheel', (req, res) => {
  try {
    const equbState = getEqubState();
    equbState.wheelSpinning = false;
    updateEqubState(equbState);
    const newState = getEqubState();
    res.json(newState);
  } catch (err) {
    console.error('Error stopping wheel:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get stats
app.get('/api/stats', (req, res) => {
  try {
    const members = db.prepare('SELECT * FROM members').all();
    const paidContributions = db.prepare('SELECT * FROM contributions WHERE status = ?').all('paid');
    const latestWinner = db.prepare('SELECT * FROM winners ORDER BY id DESC LIMIT 1').get();
    const equbState = getEqubState();
    
    res.json({
      totalMembers: members.length,
      totalCollection: paidContributions.length * (equbState.equbAmount || 1000),
      currentRound: equbState.round,
      currentWinner: latestWinner ? latestWinner.memberName : 'TBD',
      equbAmount: equbState.equbAmount || 1000
    });
  } catch (err) {
    console.error('Error getting stats:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Catch-all middleware for frontend (SPA) - Express 5.x compatible
app.use((req, res, next) => {
  // If it's an API route, pass it along
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Otherwise serve the index.html
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Database file: ${DB_FILE}`);
});
