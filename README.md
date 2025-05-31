# Microservices Assignment

## System Overview
Two microservices (Auth and Product) communicating via RabbitMQ.

## Prerequisites
- Docker
- Docker Compose

## Setup
1. Clone the repository
2. Create `.env` files in both service directories based on `.env.example`
3. Run `docker-compose up --build`

## Services
- Auth Service: http://localhost:3000
- Product Service: http://localhost:3001
- RabbitMQ Management: http://localhost:15672 (guest/guest)

## API Endpoints

### Auth Service
- POST /auth/register - User registration
- POST /auth/login - User login
- POST /auth/logout - User logout
- POST /auth/refresh - Refresh access token

### Product Service
- GET /products - List user's products
- POST /products - Create new product
- PUT /products/:id - Update product
- DELETE /products/:id - Delete product
