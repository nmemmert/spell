# Spelling Hub

A modern spelling practice application built with Vue 3, TypeScript, and Vite.

## Features

- User authentication (login/register)
- Spelling practice games with spaced repetition
- **Wordlist Management**: Teachers can create and assign wordlists to students
- **AWANA T&T Bible Typing**: Practice all 35 Truth & Training verses (ESV Translation)
- Gamification system with points, badges, and achievements
- Progress tracking and analytics
- Dashboard with user stats
- Admin panel for user management
- Progressive Web App (PWA) support
- Responsive design

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

### Build and Run with Docker Compose
```bash
# Build and start the application
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### Manual Docker Build
```bash
# Build the image
docker build -t spelling-hub .

# Run the container
docker run -p 80:80 spelling-hub
```

The application will be available at `http://localhost`.

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

- `src/views/` - Page components
- `src/components/` - Reusable components
- `src/router/` - Vue Router configuration
- `public/` - Static assets

## Technologies Used

- Vue 3 with Composition API
- TypeScript
- Vite
- Vue Router
- Vite PWA plugin
