FROM node:20-bullseye-slim

# Add support for native modules and file watching
RUN apt-get update && \
    apt-get install -y python3 make g++ inotify-tools && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Install nodemon globally for better watching
RUN npm install -g nodemon

# Copy all source files
COPY . .

# Build the application (optional for dev, but good to have)
RUN npm run build

EXPOSE 3001

# Start in development mode with enhanced watching
CMD ["nodemon", "--exec", "npm", "run", "start:dev", "--watch", "src"]