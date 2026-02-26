# Astra-Pay: Implementation Roadmap

## Phase 1: The Foundation
- [ ] **Boilerplate Generation:** Use Claude in Antigravity to generate the multi-module Spring Boot structure based on `docs/`.
- [ ] **Dependency Sync:** Ensure `pom.xml` includes Kafka, Spring Data JPA, Redis, and Spring Security.
- [ ] **Docker Compose:** Generate a `docker-compose.yml` for local PostgreSQL, Kafka, and Redis instances.
- [ ] **Git Checkpoint:** Initial commit with the base structure.

## Phase 2: Core Microservices (Wallet & Identity)
- [ ] **User/Wallet Entity:** Implement the core JPA entities for users and their balances.
- [ ] **Auth Layer:** Set up JWT-based authentication using Spring Security.
- [ ] **Wallet API:** Create endpoints for `GET /balance` and `POST /onboard`.

## Phase 3: The Transaction Engine (Kafka & Idempotency)
- [ ] **Transaction Producer:** API endpoint `POST /transfer` that pushes events to the `astra-transactions` topic.
- [ ] **Idempotency Logic:** Implement a Redis-backed check to ensure every `transactionId` is processed exactly once.
- [ ] **Ledger Consumer:** Create a service to consume Kafka events and update PostgreSQL balances atomically.

## Phase 4: Frontend & Production Polish
- [ ] **React Setup:** Initialize the frontend with Vite + Tailwind CSS.
- [ ] **Dashboard UI:** Build the frontend view for balance and recent activity.
- [ ] **CodeRabbit Review:** Run the final AI audit for security vulnerabilities before the "Production" push.