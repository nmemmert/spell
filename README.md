# Spelling Hub

A modern spelling practice application built with Vue 3, TypeScript, and Vite.

## Features

- **Secure Authentication**: Password-based login with bcrypt hashing and role-based access
- **Cross-Device Data Persistence**: SQLite database with volume mounting for persistent storage
- Spelling practice games with spaced repetition
- **Wordlist Management**: Teachers can create and assign wordlists to students
- **AWANA T&T Bible Typing**: Practice all 35 Truth & Training verses (ESV Translation)
- Gamification system with points, badges, and achievements
- Progress tracking and analytics
- Dashboard with user stats
- Admin panel for user management
- Progressive Web App (PWA) support
- Responsive design

## Authentication

The application uses secure password-based authentication with role-based access control.

### Default Users
The application comes pre-configured with the following default users:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `admin@school.edu` | `password123` | Admin | Full system access, user management |
| `teacher@school.edu` | `password123` | Teacher | Create wordlists, assign to students, view progress |
| `student@school.edu` | `password123` | Student | Practice spelling, Bible typing, view personal progress |
| `student2@school.edu` | `password123` | Student | Additional student account for testing |

### User Roles
- **Admin**: Complete system access including user management and all features
- **Teacher**: Create and manage wordlists, assign to students, monitor progress
- **Student**: Access assigned wordlists, practice games, Bible typing, view achievements

### Security Features
- Passwords are hashed using bcrypt with salt rounds
- Secure API endpoints for authentication
- Session persistence across browser restarts
- Role-based access control throughout the application

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Docker Deployment

### Production Deployment with Docker Compose
```bash
# Build and start the application in production
docker-compose up --build

# Or run in background (recommended for production)
docker-compose up -d --build

# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Pull from GitHub Container Registry
```bash
# Pull the pre-built container
docker pull ghcr.io/nmemmert/spell:latest

# Run with data persistence
docker run -p 3000:3000 -v spell-data:/app/data ghcr.io/nmemmert/spell:latest
```

The application will be available at `http://localhost:3000`.

### Docker Configuration
- **Single Stage Build**: Node.js application with Express server and SQLite database
- **SQLite Database**: File-based database with volume persistence (`./data:/app/data`)
- **Volume Mount**: Database persists across container restarts and deployments
- **Port 3000**: Application runs on port 3000 with both API and static file serving
- **Cross-Device Persistence**: Any device accessing the container shares the same data

## GitHub Releases

### Beta Release (v0.0.0-beta)
The application has been successfully containerized and released as a beta version on GitHub.

**Release Features:**
- ✅ Complete authentication system with role-based access (Admin/Teacher/Student)
- ✅ **Cross-Device Data Persistence**: SQLite database with volume mounting
- ✅ Wordlist management with student assignments
- ✅ Dual game modes: Practice and Test with full wordlist completion
- ✅ AWANA T&T Bible typing with all 35 ESV verses
- ✅ Comprehensive gamification system with points, badges, and achievements
- ✅ Progress tracking and analytics dashboard
- ✅ Docker containerization for production deployment
- ✅ PWA support for offline functionality

**Data Persistence:** 🟢 Cross-device persistence with SQLite database and volume mounting
**Deployment Status:** 🟢 Production-ready container with persistent database

## AWANA T&T Bible Typing

This application includes a comprehensive Bible typing practice feature specifically designed for AWANA's Truth & Training (T&T) program. Students can practice typing all 35 official T&T verses to improve both typing skills and Scripture memorization.

### Features:
- **35 Complete T&T Verses**: From John 3:16 to Revelation 4:11 (ESV Translation)
- **Two Practice Modes**:
  - Full Verse: Type the entire verse from memory
  - Progressive Reveal: Text appears word-by-word as you type correctly
- **Real-time Feedback**: Character-by-character accuracy highlighting
- **Performance Tracking**: Accuracy percentage and words-per-minute
- **Gamification**: Earn points and badges for perfect typing
- **Scripture Master Badge**: Awarded for 100% accuracy on any verse

## Wordlist Management

The spelling game uses wordlists that teachers create and assign to students:

### For Teachers:
- Create custom wordlists with any vocabulary
- Assign wordlists to specific students
- Organize by weeks, themes, or difficulty levels
- Track student progress on assigned words

### For Students:
- Practice words from assigned wordlists
- Use spaced repetition for optimal learning
- Get detailed results showing correct/incorrect answers
- Earn points and badges for progress

### Default Behavior:
- Students see words from all their assigned wordlists
- If no wordlists are assigned, default practice words are provided
- Teachers can access the Wordlists page to manage assignments

## Data Persistence

The application uses a SQLite database with volume mounting for **cross-device persistent storage**:

### Architecture
- **Backend API**: Express.js server with RESTful API endpoints
- **Database**: SQLite with file-based storage in container volume
- **Volume Mounting**: Database persists across container restarts and deployments
- **Cross-Device Access**: Any device accessing the container shares the same data

### What Gets Saved:
- **User Accounts**: All registered users with their roles and information
- **Wordlists**: Custom wordlists created by teachers, including student assignments
- **Data Persistence**: Survives container restarts, updates, and server reboots

### Volume Configuration:
- **Mount Point**: `./data:/app/data` (host directory to container)
- **Database Path**: `/app/data/app.db` inside container
- **Backup**: Copy `./data/app.db` to backup the entire database

### API Endpoints:
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/wordlists` - Get all wordlists
- `POST /api/wordlists` - Create new wordlist
- `PUT /api/wordlists/:id` - Update wordlist
- `DELETE /api/wordlists/:id` - Delete wordlist

## Technologies Used

- Vue 3 with Composition API
- TypeScript
- Vite
- Vue Router
- Vite PWA plugin
