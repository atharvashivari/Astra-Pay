# Tech Stack Document: Astra-Pay

## 1. Backend (The Engine)
* **Framework:** Spring Boot 3.x (Java 17/21) — Chosen for enterprise stability and native Kafka support.
* **Database:** PostgreSQL — Ensuring ACID compliance for all financial data.
* **Caching:** Redis — Used for session management and distributed locking for transaction integrity.
* **Messaging:** Apache Kafka — Decouples the Transaction Service from the Incentive and Notification services.

## 2. Frontend (The Interface)
* **Framework:** React — Fast, component-based UI for the dashboard.
* **Styling:** Tailwind CSS — For a minimalist, "Fintech-Chic" dark mode design.
* **State Management:** TanStack Query (React Query) — Efficiently syncing the Activity Feed with the backend.

## 3. Developer Tools (The Workflow)
* **IDE:** Antigravity — Leveraging Google’s agent-first environment for rapid "Vibe Coding".
* **OS Environment:** WSL2 (Ubuntu) — Running a clean Linux kernel for high-performance Docker and Kafka instances.
* **Testing:** JUnit 5 & Mockito — Ensuring 80%+ code coverage for the core ledger logic.
* **Code Review:** CodeRabbit AI — Automated bug detection and performance auditing before every push.

## 4. Authentication & Security
* **Auth:** Spring Security + JWT — Handling secure stateless sessions.
* **Validation:** Hibernate Validator — Strict schema enforcement for all incoming transaction JSONs.