# Astra-Pay

A high-performance, event-driven financial ledger and P2P payment system designed for extreme scale, concurrency, and reliability.

## 🚀 Overview
Astra-Pay is engineered to demonstrate architectural excellence in the fintech space. It focuses on solving common digital payment challenges such as synchronous bottlenecks, double-spending, and monolithic constraints.

## 🛠️ Tech Stack
- **Framework:** Spring Boot 3.3 (Java 21)
- **Runtime:** JVM with Virtual Threads (Project Loom) enabled
- **Database:** PostgreSQL (ACID compliant)
- **Caching & Locks:** Redis (Distributed locking & Idempotency)
- **Event Streaming:** Apache Kafka (Asynchronous decoupling)
- **Security:** Spring Security + JWT
- **Build Tool:** Maven

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

## 🚦 Getting Started

### Prerequisites
- Java 21+
- Maven 3.9+
- PostgreSQL
- Redis
- Kafka (for event-driven features)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/atharvashivari/Astra-Pay.git
   cd Astra-Pay
   ```
2. Configure environment variables in `src/main/resources/application.properties`.
3. Build the project:
   ```bash
   mvn clean install
   ```
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## 🔒 Security
- JWT-based stateless authentication.
- Hibernate Validator for stringent payload checks.
- Redis-based distributed locks for concurrent critical sections.
