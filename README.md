# Support Ticket Workflow (Spring Boot 3 + Camunda 7)

REST API for support tickets whose lifecycle is driven by a BPMN process
(`src/main/resources/processes/ticket-process.bpmn`), run by the embedded Camunda engine.

**Stack:** Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA, Camunda 7.23, PostgreSQL 16, Docker Compose, Maven.

## Process
Start -> Set OPEN -> Urgent? -> (URGENT: user task for `senior-agents` | other: user task for `support-agents`
with a 24h non-interrupting timer that escalates) -> Set RESOLVED -> user task `admins` validates -> Set CLOSED -> End.

## Run
```
docker compose up -d          # PostgreSQL on localhost:5434
mvn spring-boot:run           # API on http://localhost:8080
```
Open the `.bpmn` file in Camunda Modeler (free) to see and edit the diagram.

## Angular frontend (folder `frontend/`)
Login, ticket creation and list, and a task screen with Claim / Complete. Needs Node.js 18.19+ or 20+.
```
cd frontend
npm install
npm start                     # opens http://localhost:4200
```
`proxy.conf.json` forwards `/api` to `http://localhost:8080`, so the backend must be running (no CORS setup needed).
Customer sees Tickets only; agent, senior and admin also see Tasks.

## Simple test console
Without Node you can still open http://localhost:8080 (static page served by Spring Boot).

## Users (HTTP Basic, demo only)
customer/customer, agent/agent, senior/senior, admin/admin

## Endpoints
| Method | URL | Who | Purpose |
|---|---|---|---|
| POST | /api/tickets | any user | create ticket and start the process. Body: `{"title":"VPN down","description":"...","priority":"URGENT"}` (LOW, HIGH, URGENT) |
| GET | /api/tickets | any user | list tickets and their status |
| GET | /api/tasks?group=support-agents | agent, senior, admin | open tasks (also `senior-agents`, `admins`) |
| POST | /api/tasks/{id}/claim | agent, senior, admin | take a task, ticket becomes IN_PROGRESS |
| POST | /api/tasks/{id}/complete | agent, senior, admin | finish the task, process moves on |

## Try it
1. customer creates an URGENT ticket.
2. senior: GET /api/tasks?group=senior-agents, claim, complete -> status RESOLVED.
3. admin: GET /api/tasks?group=admins, complete -> status CLOSED.
