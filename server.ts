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

// Database setup
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'app.db')

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

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

// Seed initial data if tables are empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
if (userCount.count === 0) {
  console.log('Seeding database...')
  const saltRounds = 10
  const defaultPassword = 'password123' // Default password for all initial users

  const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds)
  console.log('Generated hash for password123:', hashedPassword)

  const insertUser = db.prepare('INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, ?, ?)')

  const users = [
    { email: 'admin@school.edu', name: 'Admin User', role: 'admin' },
    { email: 'teacher@school.edu', name: 'Teacher User', role: 'teacher' },
    { email: 'student@school.edu', name: 'Student User', role: 'student' },
    { email: 'student2@school.edu', name: 'Student Two', role: 'student' }
  ]

  for (const user of users) {
    insertUser.run(user.email, user.name, user.role, hashedPassword)
  }

  const insertWordlist = db.prepare(`
    INSERT INTO wordlists (name, description, words, assigned_students, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const wordlists = [
    {
      name: 'Basic Words',
      description: 'Common everyday words for beginners',
      words: JSON.stringify(['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honey', 'ice', 'jam']),
      assignedStudents: JSON.stringify([3]),
      createdBy: 2,
      createdAt: '2025-10-01T00:00:00.000Z'
    },
    {
      name: 'Advanced Vocabulary',
      description: 'Challenging words for advanced learners',
      words: JSON.stringify(['ubiquitous', 'serendipity', 'ephemeral', 'quintessential', 'labyrinthine', 'perspicacious', 'pulchritude', 'ebullient', 'mellifluous', 'quiescent']),
      assignedStudents: JSON.stringify([]),
      createdBy: 2,
      createdAt: '2025-10-15T00:00:00.000Z'
    },
    {
      name: 'Week 1: Colors & Shapes',
      description: 'Basic colors and shapes vocabulary',
      words: JSON.stringify(['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'circle', 'square', 'triangle', 'rectangle']),
      assignedStudents: JSON.stringify([3, 4]),
      createdBy: 2,
      createdAt: '2025-10-20T00:00:00.000Z'
    },
    {
      name: 'Week 2: Animals',
      description: 'Common animal names',
      words: JSON.stringify(['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'chicken', 'duck']),
      assignedStudents: JSON.stringify([3, 4]),
      createdBy: 2,
      createdAt: '2025-10-21T00:00:00.000Z'
    },
    {
      name: 'Week 3: Family',
      description: 'Family member vocabulary',
      words: JSON.stringify(['mother', 'father', 'brother', 'sister', 'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin', 'baby']),
      assignedStudents: JSON.stringify([3, 4]),
      createdBy: 2,
      createdAt: '2025-10-22T00:00:00.000Z'
    },
    {
      name: 'Week 4: Food',
      description: 'Common food items',
      words: JSON.stringify(['bread', 'milk', 'cheese', 'butter', 'egg', 'rice', 'pasta', 'soup', 'salad', 'fruit']),
      assignedStudents: JSON.stringify([3, 4]),
      createdBy: 2,
      createdAt: '2025-10-23T00:00:00.000Z'
    },
    {
      name: 'Week 5: Numbers',
      description: 'Numbers and counting',
      words: JSON.stringify(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']),
      assignedStudents: JSON.stringify([3, 4]),
      createdBy: 2,
      createdAt: '2025-10-24T00:00:00.000Z'
    }
  ]

  for (const wordlist of wordlists) {
    insertWordlist.run(
      wordlist.name,
      wordlist.description,
      wordlist.words,
      wordlist.assignedStudents,
      wordlist.createdBy,
      wordlist.createdAt
    )
  }
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

// Serve static files from the Vue build
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

// Catch all handler: send back index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Start server
try {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Database path: ${DB_PATH}`)
  })
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