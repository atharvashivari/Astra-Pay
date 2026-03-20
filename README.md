# Astra-Pay Monorepo

Welcome to the Astra-Pay project. This repository is structured as a monorepo containing both the backend and frontend.

A high-performance, event-driven financial ledger and P2P payment system designed for extreme scale, concurrency, and reliability.

## 🚀 Overview
Astra-Pay is engineered to demonstrate architectural excellence in the fintech space. It focuses on solving common digital payment challenges such as synchronous bottlenecks, double-spending, and monolithic constraints.

## 🛠️ Tech Stack
- **Framework:** Spring Boot 3.3 (Java 21) & React + Tailwind CSS (Vite)
- **Runtime:** JVM with Virtual Threads (Project Loom) enabled
- **Database:** PostgreSQL (ACID compliant)
- **Caching & Locks:** Redis (Distributed locking & Idempotency)
- **Event Streaming:** Apache Kafka (Asynchronous decoupling)
- **Security:** Spring Security + JWT
- **Build Tool:** Maven & npm

## ✨ Core Features
- **Wallet Management:** Secure account provisioning and isolated balance records.
- **P2P Transaction Engine:** Asynchronous transfers via Kafka event streams.
- **Incentive Engine:** Decoupled service for rewards and cashbacks.
- **Event Sourced Ledger:** Persistent, immutable log of all operations.
- **Optimistic Concurrency Control:** Version-based locking to prevent race conditions during balance updates.

## 🏗️ Architecture
Astra-Pay utilizes modern architectural patterns to ensure high availability and data integrity:
- **Transactional Outbox Pattern**: Ensures atomicity between database updates and event publishing.
- **Idempotency Guard**: Redis-backed middleware to guarantee exactly-once processing.
- **Virtual Threads**: Maximizes throughput for I/O bound operations.

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed and running:
- **Java 21**: Microsoft OpenJDK 21 or equivalent.
- **Docker Desktop**: To run backing services.
- **PostgreSQL**: `localhost:5432/astrapay` (via Docker)
- **Redis**: `localhost:6379` (via Docker)
- **Kafka**: `localhost:9092` (via Docker)
- **Node.js**: v18+ for frontend.

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
mvn clean install
mvn spring-boot:run
```
*Port: 8080*

### 4. Frontend (React + Vite)
The frontend provides a dashboard UI for users to manage their wallets.
```bash
cd frontend
npm install
npm run dev
```
*Port: 5173 (default Vite port)*

## 🔒 Security
- JWT-based stateless authentication.
- Hibernate Validator for stringent payload checks.
- Redis-based distributed locks for concurrent critical sections.

## 🌟 Key Highlights
- **Atomic Transfers**: Guaranteed state consistency using Spring Data JPA and Postgres ACID transactions.
- **Race Condition Immunity**: Implements version-based Optimistic Locking on all wallet operations.
- **Idempotency Shield**: Custom Redis-backed middleware ensuring no transaction is processed twice.
- **Loom Powered**: Utilizes Virtual Threads to handle thousands of concurrent payment requests with minimal overhead.

## 📂 Project Structure
- `backend/`: Java Spring Boot application.
- `frontend/`: React + Tailwind CSS dashboard.
- `docs/`: Design system, todo lists, and other documentation.
