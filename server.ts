import express, { Request, Response } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' })
})

// Database setup
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'app.db')

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Check if database file already exists
const dbExists = fs.existsSync(DB_PATH)

const db = new Database(DB_PATH)

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS wordlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    words TEXT NOT NULL,
    assigned_students TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id)
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS user_gamification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    experience_to_next INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id)
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id TEXT NOT NULL,
    earned BOOLEAN DEFAULT FALSE,
    earned_date DATETIME,
    progress INTEGER DEFAULT 0,
    target INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS user_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    average_accuracy REAL DEFAULT 0,
    average_session_time REAL DEFAULT 0,
    mastered_words INTEGER DEFAULT 0,
    progress_data TEXT,
    difficulty_data TEXT,
    session_data TEXT,
    streak_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id)
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS user_spaced_repetition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    word_id TEXT NOT NULL,
    word TEXT NOT NULL,
    difficulty REAL DEFAULT 0.5,
    repetitions INTEGER DEFAULT 0,
    interval_days INTEGER DEFAULT 1,
    ease_factor REAL DEFAULT 2.5,
    next_review_date DATETIME,
    last_reviewed_date DATETIME,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, word_id)
  )
`)

// Only seed if this is a completely new database (no existing file)
if (!dbExists) {
  console.log('Creating new database - seeding with admin user...')
  const saltRounds = 10
  const defaultPassword = 'password123' // Default password for admin user

  const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds)
  console.log('Generated hash for password123:', hashedPassword)

  const insertUser = db.prepare('INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, ?, ?)')

  // Only create admin user
  insertUser.run('admin@school.edu', 'Admin User', 'admin', hashedPassword)
  console.log('Admin user created successfully')
} else {
  console.log('Using existing database - skipping seed data')
}

// Authentication
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const stmt = db.prepare('SELECT id, email, name, role, password_hash FROM users WHERE email = ?')
    const user = stmt.get(email) as any

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Create a simple token (in production, use JWT)
    const token = `user_${user.id}_${Date.now()}`

    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }
    
    console.log('Sending response:', response)
    res.json(response)
    console.log('Response sent')
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, name, password, role } = req.body

    if (!email || !name || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const stmt = db.prepare('INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, ?, ?)')
    const result = stmt.run(email, name, role, passwordHash)

    // Create a simple token
    const token = `user_${result.lastInsertRowid}_${Date.now()}`

    res.status(201).json({
      user: {
        id: result.lastInsertRowid,
        email,
        name,
        role
      },
      token
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Email already exists' })
    } else {
      res.status(500).json({ error: 'Registration failed' })
    }
  }
})

// Users
app.get('/api/users', (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT id, email, name, role FROM users ORDER BY id')
    const users = stmt.all()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

app.get('/api/users/:id', (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?')
    const user = stmt.get(req.params.id)
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { email, name, role, password } = req.body

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const stmt = db.prepare('INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, ?, ?)')
    const result = stmt.run(email, name, role, passwordHash)
    res.json({
      id: result.lastInsertRowid,
      email,
      name,
      role
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Email already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create user' })
    }
  }
})

app.put('/api/users/:id', (req, res) => {
  try {
    const { email, name, role } = req.body
    const stmt = db.prepare('UPDATE users SET email = ?, name = ?, role = ? WHERE id = ?')
    const result = stmt.run(email, name, role, req.params.id)
    if (result.changes > 0) {
      res.json({ success: true })
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

app.delete('/api/users/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(req.params.id)
    if (result.changes > 0) {
      res.json({ success: true })
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Wordlists
app.get('/api/wordlists', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, name, description, words, assigned_students, created_by, created_at
      FROM wordlists ORDER BY id
    `)
    const rows = stmt.all() as any[]

    const wordlists = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      words: JSON.parse(row.words),
      assignedStudents: JSON.parse(row.assigned_students),
      createdBy: row.created_by,
      createdAt: row.created_at
    }))

    res.json(wordlists)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wordlists' })
  }
})

app.get('/api/wordlists/:id', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, name, description, words, assigned_students, created_by, created_at
      FROM wordlists WHERE id = ?
    `)
    const row = stmt.get(req.params.id) as any

    if (row) {
      const wordlist = {
        id: row.id,
        name: row.name,
        description: row.description,
        words: JSON.parse(row.words),
        assignedStudents: JSON.parse(row.assigned_students),
        createdBy: row.created_by,
        createdAt: row.created_at
      }
      res.json(wordlist)
    } else {
      res.status(404).json({ error: 'Wordlist not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wordlist' })
  }
})

app.post('/api/wordlists', (req, res) => {
  try {
    const { name, description, words, assignedStudents, createdBy, createdAt } = req.body
    const stmt = db.prepare(`
      INSERT INTO wordlists (name, description, words, assigned_students, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      name,
      description,
      JSON.stringify(words),
      JSON.stringify(assignedStudents),
      createdBy,
      createdAt
    )
    res.json({
      id: result.lastInsertRowid,
      name,
      description,
      words,
      assignedStudents,
      createdBy,
      createdAt
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create wordlist' })
  }
})

app.put('/api/wordlists/:id', (req, res) => {
  try {
    const { name, description, words, assignedStudents } = req.body
    const stmt = db.prepare(`
      UPDATE wordlists SET name = ?, description = ?, words = ?, assigned_students = ?
      WHERE id = ?
    `)
    const result = stmt.run(
      name,
      description,
      JSON.stringify(words),
      JSON.stringify(assignedStudents),
      req.params.id
    )
    if (result.changes > 0) {
      res.json({ success: true })
    } else {
      res.status(404).json({ error: 'Wordlist not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wordlist' })
  }
})

app.delete('/api/wordlists/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM wordlists WHERE id = ?')
    const result = stmt.run(req.params.id)
    if (result.changes > 0) {
      res.json({ success: true })
    } else {
      res.status(404).json({ error: 'Wordlist not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete wordlist' })
  }
})

// Gamification endpoints
app.get('/api/gamification/:userId', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM user_gamification WHERE user_id = ?')
    const gamification = stmt.get(req.params.userId)
    if (gamification) {
      res.json(gamification)
    } else {
      // Return default values if no data exists
      res.json({
        user_id: req.params.userId,
        points: 0,
        level: 1,
        experience: 0,
        experience_to_next: 100
      })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get gamification data' })
  }
})

app.post('/api/gamification/:userId', (req, res) => {
  try {
    const { points, level, experience, experience_to_next } = req.body
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_gamification 
      (user_id, points, level, experience, experience_to_next, updated_at) 
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `)
    stmt.run(req.params.userId, points, level, experience, experience_to_next)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save gamification data' })
  }
})

// Achievements endpoints
app.get('/api/achievements/:userId', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM user_achievements WHERE user_id = ?')
    const achievements = stmt.all(req.params.userId)
    res.json(achievements)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get achievements data' })
  }
})

app.post('/api/achievements/:userId', (req, res) => {
  try {
    const achievements = req.body
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_achievements 
      (user_id, achievement_id, earned, earned_date, progress, target, completed, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    
    for (const achievement of achievements) {
      stmt.run(
        req.params.userId,
        achievement.achievement_id,
        achievement.earned,
        achievement.earned_date,
        achievement.progress,
        achievement.target,
        achievement.completed
      )
    }
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save achievements data' })
  }
})

// Analytics endpoints
app.get('/api/analytics/:userId', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM user_analytics WHERE user_id = ?')
    const analytics = stmt.get(req.params.userId)
    if (analytics) {
      res.json({
        ...analytics,
        progress_data: analytics.progress_data ? JSON.parse(analytics.progress_data) : null,
        difficulty_data: analytics.difficulty_data ? JSON.parse(analytics.difficulty_data) : null,
        session_data: analytics.session_data ? JSON.parse(analytics.session_data) : null,
        streak_data: analytics.streak_data ? JSON.parse(analytics.streak_data) : null
      })
    } else {
      // Return default values if no data exists
      res.json({
        user_id: req.params.userId,
        total_sessions: 45,
        average_accuracy: 78,
        average_session_time: 12,
        mastered_words: 234,
        progress_data: null,
        difficulty_data: null,
        session_data: null,
        streak_data: null
      })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics data' })
  }
})

app.post('/api/analytics/:userId', (req, res) => {
  try {
    const { total_sessions, average_accuracy, average_session_time, mastered_words, progress_data, difficulty_data, session_data, streak_data } = req.body
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_analytics 
      (user_id, total_sessions, average_accuracy, average_session_time, mastered_words, progress_data, difficulty_data, session_data, streak_data, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    stmt.run(
      req.params.userId,
      total_sessions,
      average_accuracy,
      average_session_time,
      mastered_words,
      progress_data ? JSON.stringify(progress_data) : null,
      difficulty_data ? JSON.stringify(difficulty_data) : null,
      session_data ? JSON.stringify(session_data) : null,
      streak_data ? JSON.stringify(streak_data) : null
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save analytics data' })
  }
})

// Spaced repetition endpoints
app.get('/api/spaced-repetition/:userId', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM user_spaced_repetition WHERE user_id = ?')
    const words = stmt.all(req.params.userId)
    res.json(words)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get spaced repetition data' })
  }
})

app.post('/api/spaced-repetition/:userId', (req, res) => {
  try {
    const words = req.body
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_spaced_repetition 
      (user_id, word_id, word, difficulty, repetitions, interval_days, ease_factor, next_review_date, last_reviewed_date, correct_count, incorrect_count, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    
    for (const word of words) {
      stmt.run(
        req.params.userId,
        word.word_id || word.id,
        word.word,
        word.difficulty,
        word.repetitions,
        word.interval,
        word.ease_factor,
        word.next_review ? new Date(word.next_review).toISOString() : null,
        word.last_reviewed ? new Date(word.last_reviewed).toISOString() : null,
        word.correct_count,
        word.incorrect_count
      )
    }
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save spaced repetition data' })
  }
})

// Reset endpoints for admin
app.post('/api/reset/:userId/:dataType', (req, res) => {
  try {
    const { userId, dataType } = req.params
    
    switch (dataType) {
      case 'gamification':
        db.prepare('DELETE FROM user_gamification WHERE user_id = ?').run(userId)
        break
      case 'achievements':
        db.prepare('DELETE FROM user_achievements WHERE user_id = ?').run(userId)
        break
      case 'analytics':
        db.prepare('DELETE FROM user_analytics WHERE user_id = ?').run(userId)
        break
      case 'spaced-repetition':
        db.prepare('DELETE FROM user_spaced_repetition WHERE user_id = ?').run(userId)
        break
      default:
        return res.status(400).json({ error: 'Invalid data type' })
    }
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset data' })
  }
})

// Serve static files from the Vue build
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

// Catch all handler: send back index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Start server
try {
  console.log('Attempting to start server...')
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Database path: ${DB_PATH}`)
  })
  console.log('Server startup initiated')
} catch (error) {
  console.error('Failed to start server:', error)
  process.exit(1)
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing database connection...')
  db.close()
  process.exit(0)
})