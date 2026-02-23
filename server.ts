import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(express.json());

// Configure nodemailer with hardcoded credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'auth.aiguardian@gmail.com',
    pass: 'rlqkpwlsocezfgpe',
  },
});

// Initialize SQLite Database
const db = new Database('local.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    credibility INTEGER DEFAULT 100,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS debates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    endTime DATETIME,
    sideA_user INTEGER,
    sideB_user INTEGER,
    winner INTEGER,
    votesA INTEGER DEFAULT 0,
    votesB INTEGER DEFAULT 0,
    description TEXT,
    FOREIGN KEY(sideA_user) REFERENCES users(id),
    FOREIGN KEY(sideB_user) REFERENCES users(id),
    FOREIGN KEY(winner) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS arguments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    debateId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    round INTEGER NOT NULL,
    side TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(debateId) REFERENCES debates(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

// Seed some initial data if empty
const debateCount = db.prepare('SELECT COUNT(*) as count FROM debates').get() as any;
if (debateCount.count === 0) {
  db.prepare(`
    INSERT INTO debates (title, category, description, status) 
    VALUES (?, ?, ?, ?)
  `).run(
    'AI Ethics: Should AI have rights?', 
    'Ethics', 
    'A deep dive into the moral status of artificial intelligence.',
    'active'
  );
  db.prepare(`
    INSERT INTO debates (title, category, description, status) 
    VALUES (?, ?, ?, ?)
  `).run(
    'Privacy vs Security in the Digital Age', 
    'Privacy', 
    'Is total surveillance justified for national security?',
    'active'
  );
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, username, password) VALUES (?, ?, ?)');
    const info = stmt.run(email, username, hashedPassword);

    const user = { id: info.lastInsertRowid, email, username, role: 'user' };
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Current User Route
app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT id, email, username, role, credibility, wins, losses, level, createdAt FROM users WHERE id = ?').get(decoded.id) as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get User Profile by Username
app.get('/api/users/:username', (req, res) => {
  const { username } = req.params;
  try {
    const user = db.prepare('SELECT id, username, role, credibility, wins, losses, level, createdAt FROM users WHERE username = ?').get(username) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, credibility, wins, level FROM users ORDER BY credibility DESC LIMIT 50').all();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Debates
app.get('/api/debates', (req, res) => {
  const { status, limit = 20 } = req.query;
  try {
    let query = 'SELECT * FROM debates';
    const params = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY startTime DESC LIMIT ?';
    params.push(Number(limit));
    
    const debates = db.prepare(query).all(...params);
    res.json({ debates });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Single Debate
app.get('/api/debates/:id', (req, res) => {
  const { id } = req.params;
  try {
    const debate = db.prepare('SELECT * FROM debates WHERE id = ?').get(id);
    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }
    const arguments_list = db.prepare('SELECT a.*, u.username FROM arguments a JOIN users u ON a.userId = u.id WHERE a.debateId = ? ORDER BY a.createdAt ASC').all(id);
    res.json({ debate, arguments: arguments_list });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Post Argument
app.post('/api/debates/:id/arguments', async (req, res) => {
  const { id } = req.params;
  const { content, side, round } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const stmt = db.prepare('INSERT INTO arguments (debateId, userId, round, side, content) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, decoded.id, round, side, content);
    
    // Award credibility
    db.prepare('UPDATE users SET credibility = credibility + 10 WHERE id = ?').run(decoded.id);
    
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token or error posting argument' });
  }
});

// Vote Route
app.post('/api/debates/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { side } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Update debate votes
    const voteColumn = side === 'A' ? 'votesA' : 'votesB';
    db.prepare(`UPDATE debates SET ${voteColumn} = ${voteColumn} + 1 WHERE id = ?`).run(id);
    
    // Award credibility for voting
    db.prepare('UPDATE users SET credibility = credibility + 5 WHERE id = ?').run(decoded.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token or error voting' });
  }
});

// Create Debate (Admin only)
app.post('/api/debates', async (req, res) => {
  const { title, category, description } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.id) as any;
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const stmt = db.prepare('INSERT INTO debates (title, category, description, status) VALUES (?, ?, ?, ?)');
    stmt.run(title, category, description, 'active');
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token or error creating debate' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
