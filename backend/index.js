const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Database file path - check if we're on Render
let DB_DIR;
if (process.env.RENDER) {
  // On Render, use the data directory for persistent storage
  DB_DIR = path.join('/opt/render/project', 'data');
} else {
  DB_DIR = __dirname;
}

// Create the directory if it doesn't exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_FILE = path.join(DB_DIR, 'equb.db');
console.log('📄 Database file:', DB_FILE);

// Initialize SQLite database
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Unique color palette for members
const memberColors = [
  '#10b981', '#fbbf24', '#3b82f6', '#8b5cf6',
  '#14b8a6', '#f97316', '#06b6d4', '#ec4899',
  '#84cc16', '#eab308', '#22c55e', '#06b6d4'
];

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    )`);

    // Members table
    db.run(`CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      joinDate TEXT NOT NULL,
      color TEXT NOT NULL
    )`);

    // Contributions table
    db.run(`CREATE TABLE IF NOT EXISTS contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memberId INTEGER NOT NULL,
      memberName TEXT NOT NULL,
      round INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      userPaymentRequested INTEGER NOT NULL DEFAULT 0,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      dueDate TEXT NOT NULL
    )`);

    // Winners table
    db.run(`CREATE TABLE IF NOT EXISTS winners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memberId INTEGER NOT NULL,
      memberName TEXT NOT NULL,
      round INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL
    )`);

    // Equb state table
    db.run(`CREATE TABLE IF NOT EXISTS equb_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round INTEGER NOT NULL DEFAULT 1,
      drawStarted INTEGER NOT NULL DEFAULT 0,
      wheelSpinning INTEGER NOT NULL DEFAULT 0,
      drawOrder TEXT NOT NULL,
      currentWinnerIndex INTEGER NOT NULL DEFAULT 0,
      contributionsPaid INTEGER NOT NULL DEFAULT 0,
      equbAmount INTEGER NOT NULL DEFAULT 1000
    )`);

    // Chart data table
    db.run(`CREATE TABLE IF NOT EXISTS chart_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL,
      contributions INTEGER NOT NULL
    )`);

    // Notifications table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL
    )`);

    // Check if data exists, if not insert minimal default data
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('Error checking users:', err);
        return;
      }
      if (row.count === 0) {
        insertMinimalDefaultData();
      }
    });
  });
}

// Insert minimal default data (only admin user, no test members/contributions/winners)
function insertMinimalDefaultData() {
  console.log('📥 Inserting minimal default data...');
  
  // Insert admin user
  const userStmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  userStmt.run('Kalab Bezuayhu', 'kalabbezuayhu@gmail.com', 'kal123456', 'admin');
  userStmt.finalize();

  // Insert empty equb state
  const equbStateStmt = db.prepare('INSERT INTO equb_state (round, drawStarted, wheelSpinning, drawOrder, currentWinnerIndex, contributionsPaid, equbAmount) VALUES (?, ?, ?, ?, ?, ?, ?)');
  equbStateStmt.run(1, 0, 0, JSON.stringify([]), 0, 0, 1000);
  equbStateStmt.finalize();

  console.log('✅ Minimal default data inserted successfully');
}

// Helper function to get equb state
function getEqubState(callback) {
  db.get('SELECT * FROM equb_state ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
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
      // Insert default state if none exists
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
      stmt.finalize();
      callback(null, defaultState);
      return;
    }
    callback(null, {
      ...row,
      drawStarted: Boolean(row.drawStarted),
      wheelSpinning: Boolean(row.wheelSpinning),
      contributionsPaid: Boolean(row.contributionsPaid),
      drawOrder: JSON.parse(row.drawOrder),
      equbAmount: row.equbAmount || 1000
    });
  });
}

// Helper function to update equb state
function updateEqubState(state, callback) {
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
    state.equbAmount || 1000,
    (err) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    }
  );
  stmt.finalize();
}

// Helper function to calculate due date (7 days from today)
function calculateDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  // First insert user
  const userStmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
  userStmt.run(name, email, password, function(err) {
    if (err) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    const userId = this.lastID;
    
    // Then get count of existing members to assign color
    db.get('SELECT COUNT(*) as count FROM members', (err, row) => {
      if (err) {
        console.error('Error getting member count:', err);
      }
      const color = memberColors[(row?.count || 0) % memberColors.length];
      const joinDate = new Date().toISOString().split('T')[0];
      
      // Insert as member
      const memberStmt = db.prepare('INSERT INTO members (name, phone, email, address, joinDate, color) VALUES (?, ?, ?, ?, ?, ?)');
      memberStmt.run(name, '', email, '', joinDate, color, function(err) {
        if (err) {
          console.error('Error adding member:', err);
        }
        const memberId = this.lastID;
        
        // Then add a contribution for the current round
        getEqubState((err, equbState) => {
          if (err) {
            console.error('Error getting equb state:', err);
          }
          const round = equbState?.round || 1;
          const amount = equbState?.equbAmount || 1000;
          const dueDate = calculateDueDate();
          const date = new Date().toISOString().split('T')[0];
          
          const contribStmt = db.prepare('INSERT INTO contributions (memberId, memberName, round, status, amount, date, dueDate, userPaymentRequested) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
          contribStmt.run(memberId, name, round, 'pending', amount, date, dueDate, 0, (err) => {
            if (err) {
              console.error('Error adding contribution:', err);
            }
          });
          contribStmt.finalize();
        });
        
        // Also update draw order
        getEqubState((err, equbState) => {
          if (!err && equbState) {
            if (!equbState.drawOrder.includes(memberId)) {
              equbState.drawOrder.push(memberId);
              updateEqubState(equbState, () => {});
            }
          }
        });
        
        res.json({ success: true, user: { id: userId, name, email, role: 'user' } });
      });
      memberStmt.finalize();
    });
  });
  userStmt.finalize();
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

// Get all members
app.get('/api/members', (req, res) => {
  db.all('SELECT * FROM members', (err, members) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json(members);
  });
});

// Add member (with unique color)
app.post('/api/members', (req, res) => {
  const { name, phone, email, address } = req.body;
  
  // Get count of existing members to assign next color
  db.get('SELECT COUNT(*) as count FROM members', (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    const color = memberColors[row.count % memberColors.length];
    const joinDate = new Date().toISOString().split('T')[0];
    
    const stmt = db.prepare('INSERT INTO members (name, phone, email, address, joinDate, color) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(name, phone, email, address, joinDate, color, function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      const newMember = { id: this.lastID, name, phone, email, address, joinDate, color };
      
      // Update draw order to include new member
      getEqubState((err, equbState) => {
        if (!err && equbState) {
          if (!equbState.drawOrder.includes(newMember.id)) {
            equbState.drawOrder.push(newMember.id);
            updateEqubState(equbState, () => {});
          }
        }
      });
      
      res.json(newMember);
    });
    stmt.finalize();
  });
});

// Get all contributions
app.get('/api/contributions', (req, res) => {
  db.all('SELECT * FROM contributions', (err, contributions) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json(contributions);
  });
});

// User requests payment (marks as userPaymentRequested
app.put('/api/contributions/:id/request-payment', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('UPDATE contributions SET userPaymentRequested = ? WHERE id = ?');
  stmt.run(1, id, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    db.get('SELECT * FROM contributions WHERE id = ?', [id], (err, contribution) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.json(contribution);
    });
  });
  stmt.finalize();
});

// Mark contribution as paid
app.put('/api/contributions/:id/paid', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('UPDATE contributions SET status = ? WHERE id = ?');
  stmt.run('paid', id, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    // Get updated contribution
    db.get('SELECT * FROM contributions WHERE id = ?', [id], (err, contribution) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      // Check if all contributions are paid
      db.all('SELECT * FROM contributions WHERE status = ?', ['pending'], (err, pendingContributions) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        const allPaid = pendingContributions.length === 0;
        
        // Update equb state if all are paid
        if (allPaid) {
          getEqubState((err, equbState) => {
            if (!err && equbState) {
              equbState.contributionsPaid = true;
              updateEqubState(equbState, () => {});
            }
          });
        }
        
        res.json(contribution);
      });
    });
  });
  stmt.finalize();
});

// Get all winners
app.get('/api/winners', (req, res) => {
  db.all('SELECT * FROM winners ORDER BY id DESC', (err, winners) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json(winners);
  });
});

// Get draw status
app.get('/api/draw-status', (req, res) => {
  getEqubState((err, equbState) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    // Get next winner info
    let nextWinner = null;
    if (equbState.drawOrder.length > 0 && equbState.currentWinnerIndex < equbState.drawOrder.length) {
      const nextWinnerId = equbState.drawOrder[equbState.currentWinnerIndex];
      db.get('SELECT * FROM members WHERE id = ?', [nextWinnerId], (err, member) => {
        if (!err && member) {
          nextWinner = member;
        }
        res.json({
          round: equbState.round,
          contributionsPaid: equbState.contributionsPaid,
          drawStarted: equbState.drawStarted,
          wheelSpinning: equbState.wheelSpinning,
          nextWinner,
          equbAmount: equbState.equbAmount
        });
      });
    } else {
      res.json({
        round: equbState.round,
        contributionsPaid: equbState.contributionsPaid,
        drawStarted: equbState.drawStarted,
        wheelSpinning: equbState.wheelSpinning,
        nextWinner: null,
        equbAmount: equbState.equbAmount
      });
    }
  });
});

// Start draw
app.post('/api/start-draw', (req, res) => {
  getEqubState((err, equbState) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    // If draw order is empty, populate it with all members
    if (equbState.drawOrder.length === 0) {
      db.all('SELECT id FROM members', (err, members) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        equbState.drawOrder = members.map(m => m.id);
        equbState.drawStarted = true;
        updateEqubState(equbState, (err) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          getEqubState((err, newState) => {
            if (!err) {
              res.json(newState);
            }
          });
        });
      });
    } else {
      equbState.drawStarted = true;
      updateEqubState(equbState, (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        getEqubState((err, newState) => {
          if (!err) {
            res.json(newState);
          }
        });
      });
    }
  });
});

// Set winner and advance
app.post('/api/set-winner', (req, res) => {
  getEqubState((err, equbState) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    // Get current winner
    const winnerId = equbState.drawOrder[equbState.currentWinnerIndex];
    db.get('SELECT * FROM members WHERE id = ?', [winnerId], (err, winner) => {
      if (err || !winner) {
        return res.status(500).json({ success: false, message: 'Winner not found' });
      }
      
      // Insert winner into winners table
      const winnerDate = new Date().toISOString().split('T')[0];
      const winnerStmt = db.prepare('INSERT INTO winners (memberId, memberName, round, amount, date) VALUES (?, ?, ?, ?, ?)');
      winnerStmt.run(winner.id, winner.name, equbState.round, equbState.drawOrder.length * equbState.equbAmount, winnerDate, function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        const newWinner = {
          id: this.lastID,
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
          db.all('SELECT * FROM members', (err, members) => {
            if (!err && members.length > 0) {
              const contribStmt = db.prepare('INSERT INTO contributions (memberId, memberName, round, amount, date, status, userPaymentRequested, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
              const contribDate = new Date().toISOString().split('T')[0];
              const dueDate = calculateDueDate();
              members.forEach(member => {
                contribStmt.run(member.id, member.name, equbState.round, equbState.equbAmount, contribDate, 'pending', 0, dueDate);
              });
              contribStmt.finalize();
            }
          });
        }
        
        updateEqubState(equbState, (err) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          
          getEqubState((err, newState) => {
            if (!err) {
              res.json({ winner: newWinner, ...newState });
            }
          });
        });
      });
      winnerStmt.finalize();
    });
  });
});

// Get next winner
app.get('/api/next-winner', (req, res) => {
  getEqubState((err, equbState) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (equbState.drawOrder.length === 0 || equbState.currentWinnerIndex >= equbState.drawOrder.length) {
      return res.json(null);
    }
    
    const winnerId = equbState.drawOrder[equbState.currentWinnerIndex];
    db.get('SELECT * FROM members WHERE id = ?', [winnerId], (err, winner) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.json(winner);
    });
  });
});

// Get equb amount
app.get('/api/equb-amount', (req, res) => {
  getEqubState((err, equbState) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ equbAmount: equbState.equbAmount || 1000 });
  });
});

// Set equb amount (admin only)
app.post('/api/equb-amount', (req, res) => {
  const { equbAmount } = req.body;
  if (!equbAmount || equbAmount < 100) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }
  getEqubState((err, equbState) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    equbState.equbAmount = equbAmount;
    updateEqubState(equbState, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.json({ success: true, equbAmount });
    });
  });
});

// Get chart data
app.get('/api/chart-data', (req, res) => {
  db.all('SELECT * FROM chart_data', (err, chartData) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json(chartData);
  });
});

// Get notifications
app.get('/api/notifications', (req, res) => {
  db.all('SELECT * FROM notifications ORDER BY id DESC LIMIT 10', (err, notifications) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json(notifications);
  });
});

// Start wheel spinning (admin only)
app.post('/api/start-wheel', (req, res) => {
  getEqubState((err, equbState) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    equbState.wheelSpinning = true;
    updateEqubState(equbState, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      getEqubState((err, newState) => {
        if (!err) {
          res.json(newState);
        }
      });
    });
  });
});

// Stop wheel spinning (admin only)
app.post('/api/stop-wheel', (req, res) => {
  getEqubState((err, equbState) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    equbState.wheelSpinning = false;
    updateEqubState(equbState, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      getEqubState((err, newState) => {
        if (!err) {
          res.json(newState);
        }
      });
    });
  });
});

// Get stats
app.get('/api/stats', (req, res) => {
  db.all('SELECT * FROM members', (err, members) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    db.all('SELECT * FROM contributions WHERE status = ?', ['paid'], (err, paidContributions) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      db.get('SELECT * FROM winners ORDER BY id DESC LIMIT 1', (err, latestWinner) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        getEqubState((err, equbState) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({
            totalMembers: members.length,
            totalCollection: paidContributions.length * (equbState.equbAmount || 1000),
            currentRound: equbState.round,
            currentWinner: latestWinner ? latestWinner.memberName : 'TBD',
            equbAmount: equbState.equbAmount || 1000
          });
        });
      });
    });
  });
});

// Catch-all route for frontend (SPA)
app.get('*', (req, res) => {
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
