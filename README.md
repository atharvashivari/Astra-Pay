# Astra-Pay Monorepo

Welcome to the Astra-Pay project. This repository is structured as a monorepo containing both the backend and frontend.

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed and running:
- **Java 21**: Microsoft OpenJDK 21 or equivalent.
- **Docker Desktop**: To run backing services.
- **PostgreSQL**: `localhost:5432/astrapay` (via Docker)
- **Redis**: `localhost:6379` (via Docker)
- **Kafka**: `localhost:9092` (via Docker)

### 2. Infrastructure Setup
Start the backing services using Docker Compose:
```bash
docker-compose up -d
```
This will pull and start Postgres, Redis, and Kafka in the background.

### 3. Backend (Spring Boot)
The backend handles authentication, wallet management, and transaction ledger.
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
*Port: 8080*

### 3. Frontend (React + Vite)
The frontend provides a dashboard UI for users to manage their wallets.
```bash
cd frontend
npm install
npm run dev
```
*Port: 5173 (default Vite port)*

## 📂 Project Structure
- `backend/`: Java Spring Boot application.
- `frontend/`: React + Tailwind CSS dashboard.
- `docs/`: Design system, todo lists, and other documentation.
