# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Install SQLite development libraries
RUN apk add --no-cache sqlite-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]