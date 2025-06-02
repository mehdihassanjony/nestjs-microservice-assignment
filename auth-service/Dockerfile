FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN apk add --no-cache python3 make g++ && \
    npm install --legacy-peer-deps

# Copy source files
COPY . .

# Build and expose
RUN npm run build
EXPOSE 3000  

# Use node directly for production, or nodemon for dev
CMD ["npm", "run", "start:dev"]