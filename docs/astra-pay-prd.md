# Product Requirement Document (PRD): Astra-Pay

## 1. Executive Summary
**Astra-Pay** is a high-performance, event-driven financial ledger and P2P payment system. It is designed to demonstrate "Senior-Level" architectural competence for 15+ LPA roles, focusing on high concurrency, idempotency, and asynchronous processing.

## 2. Problem Statement
Most traditional payment apps suffer from:
* **Synchronous Bottlenecks:** Direct database updates during high traffic cause timeouts.
* **Double-Spending:** Lack of strict idempotency leads to duplicate charges on slow networks.
* **Monolithic Scaling:** Difficulty in scaling individual components like "Incentives" or "Transaction Logs".

## 3. Core Features (MVP)
* **Wallet Management:** User account creation with unique Wallet IDs and secure balance storage.
* **P2P Transaction Engine:** Asynchronous peer-to-peer transfers utilizing Kafka to ensure high throughput.
* **Incentive Engine:** A secondary microservice that listens to transaction streams and applies cashbacks/rewards.
* **Transaction Ledger:** A persistent, immutable log of all successful and failed payments.
* **Real-time Alerts:** Notifying users of balance changes via WebSocket or push notifications.

## 4. Non-Functional Requirements
* **Idempotency:** Every transaction request must have a unique ID to prevent double-charging.
* **Eventual Consistency:** Using Kafka to ensure the ledger is eventually synced without locking the main API.
* **Security:** JWT-based authentication and secure handling of balance-update endpoints.

## 5. The "Moat" (Differentiator)
Unlike a basic CRUD app, Astra-Pay handles "failure states" gracefully. It includes a **Dead Letter Queue (DLQ)** for failed Kafka messages and a **Redis-based** distributed lock to handle race conditions.