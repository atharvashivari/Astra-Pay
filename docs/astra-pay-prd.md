# Product Requirement Document (PRD): Astra-Pay

## 1. Executive Summary
**Astra-Pay** is a high-performance, event-driven financial ledger and P2P payment system. It is designed to demonstrate  architectural competence, focusing on high concurrency, idempotency, and asynchronous processing.

## 2. Problem Statement
Legacy payment systems frequently encounter structural limitations:
* **Synchronous Bottlenecks:** Direct, synchronous database persistence during high-throughput scenarios leading to connection timeouts.
* **Double-Spending:** Insufficient idempotency controls resulting in duplicate processing under adverse network conditions.
* **Monolithic Constraints:** Inability to independently scale isolated domains such as incentive calculation or ledger auditing.

## 3. Core Features (MVP)
* **Wallet Management:** Secure account provisioning with isolated Wallet IDs and encrypted balance records.
* **P2P Transaction Engine:** Asynchronous peer-to-peer transfers utilizing Kafka event streams to maximize throughput.
* **Incentive Engine:** Decoupled microservice that consumes transaction event streams to process rewards and cashbacks.
* **Transaction Ledger:** Persistent, immutable Event Sourced log containing all successful, pending, and failed operations.
* **Real-time Alerts:** Low-latency notifications for state changes via WebSocket or push notification channels.

## 4. Non-Functional Requirements
* **Idempotency:** Strict guarantee of exactly-once processing utilizing Redis distributed locking and unique transaction cryptographic keys.
* **Eventual Consistency:** Decoupling of services via the Transactional Outbox Pattern and Kafka to maintain data integrity without locking the primary API.
* **Security:** Robust JWT-based stateless authentication and comprehensive input validation for all financial endpoints.

## 5. Architectural Differentiators
Astra-Pay is engineered for resilience, gracefully handling transient failures and concurrency edge cases. It incorporates a **Dead Letter Queue (DLQ)** for unprocessable Kafka events and comprehensive **Redis-based** distributed locks to mitigate race conditions during high-velocity balance updates.