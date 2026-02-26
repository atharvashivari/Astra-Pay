# Architectural Tech Stack: Astra-Pay

## 1. Backend Infrastructure
* **Framework:** Spring Boot 3.x (Java 21) — Selected for enterprise-grade scalability, virtual threads, and seamless Kafka integration.
* **Database:** PostgreSQL — Guaranteeing ACID compliance and relational integrity for core financial records.
* **Caching & Distributed Locks:** Redis — Employed for strict idempotency enforcement and high-performance session management.
* **Event Streaming:** Apache Kafka — Facilitating asynchronous microservice decoupling and high-throughput transaction auditing.

## 2. Frontend Architecture
* **Framework:** React — Delivering a highly responsive, component-driven user interface.
* **Styling:** Tailwind CSS — Enabling a clean, modern, and highly maintainable design system.
* **State Management:** TanStack Query (React Query) — Optimizing server-state synchronization and caching for real-time financial feeds.

## 3. DevOps & Quality Engineering
* **IDE & Agent Tools:** Antigravity — Utilizing an agent-first environment for rapid, AI-assisted development and system architecture design.
* **Containerization OS:** WSL2 (Ubuntu) — Providing a robust Linux ecosystem for container orchestration and Kafka/Redis instances.
* **Testing Suite:** JUnit 5 & Mockito — Enforcing strict code coverage thresholds for mission-critical ledger operations.
* **Continuous Inspection:** CodeRabbit AI — Automating static analysis and security vulnerability detection during the CI pipeline.

## 4. Security & Compliance
* **Authentication:** Spring Security + JWT — Architecting secure, stateless authorization mechanisms.
* **Input Validation:** Hibernate Validator — Enforcing stringent payload validation against malicious or malformed transaction models.