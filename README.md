# Support Ticket Workflow

A support ticket management application where each ticket's lifecycle is driven by a **BPMN process** executed by **Camunda 7** inside a **Spring Boot 3** REST API, with an **Angular** front end.

A customer opens a ticket, the process routes it by priority, agents handle it, an SLA timer escalates late tickets, and an admin validates the resolution before closing.

> Personal project built to practice Java, Spring Boot, BPM (Camunda) and Angular in a Full DevOps style setup (Docker, Maven, Git).

## Screenshots


## Features

- Create tickets with a priority (`LOW`, `HIGH`, `URGENT`)
- BPMN workflow: routing by priority, user tasks per team, 24h SLA escalation, admin validation
- Task inbox per candidate group, with claim and complete actions
- Ticket status kept in sync by the process: `OPEN`, `IN_PROGRESS`, `ESCALATED`, `RESOLVED`, `CLOSED`
- Role-based access with Spring Security (HTTP Basic, demo users)
- Angular UI with login, route guards and an HTTP interceptor

## The process

```
Ticket created -> Set OPEN -> Urgent? --yes--> Handle urgent ticket (senior-agents) --+
                                  |                                                    |
                                  no                                                   v
                                  +--> Handle ticket (support-agents) ----------> Set RESOLVED
                                            |                                          |
                                     24h timer (non-interrupting)                      v
                                            |                              Validate resolution (admins)
                                            v                                          |
                                    Escalate ticket -> End                             v
                                                                              Set CLOSED -> End
```

The diagram itself is in `src/main/resources/processes/ticket-process.bpmn`. Open it with [Camunda Modeler](https://camunda.com/download/modeler/) to view or edit it.

## Tech stack

| Layer | Technology |
|---|---|
| Back end | Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA, Bean Validation |
| BPM | Camunda 7.23 (embedded engine), BPMN 2.0 |
| Database | PostgreSQL 16 |
| Front end | Angular 18 (standalone components, signals, router guards) |
| Tooling | Maven, Docker Compose, Git |

## Getting started

**Prerequisites:** JDK 17+, Maven 3.9+, Docker, Node.js 18.19+ (for the Angular app).

```bash
# 1. Start PostgreSQL (localhost:5434)
docker compose up -d

# 2. Start the API (http://localhost:8080)
mvn spring-boot:run

# 3. Start the front end (http://localhost:4200), in another terminal
cd frontend
npm install
npm start
```

Without Node.js, a minimal test page is served by Spring Boot at http://localhost:8080.

### Demo users

| User | Password | Role |
|---|---|---|
| `customer` | `customer` | creates tickets |
| `agent` | `agent` | handles tickets (`support-agents`) |
| `senior` | `senior` | handles urgent tickets (`senior-agents`) |
| `admin` | `admin` | validates resolutions (`admins`) |

> These credentials are for local demo only.

### Try it

1. Log in as `customer` and create an `URGENT` ticket.
2. Log in as `senior`, open **Tasks**, claim the task (ticket becomes `IN_PROGRESS`), then complete it (`RESOLVED`).
3. Log in as `admin`, complete the validation task. The ticket is now `CLOSED`.
4. Create a `LOW` ticket and handle it as `agent` to see the standard path.

## REST API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/tickets` | any user | Create a ticket and start the process |
| GET | `/api/tickets` | any user | List tickets and their status |
| GET | `/api/tasks?group=` | agent, senior, admin | Open tasks for a group (`support-agents`, `senior-agents`, `admins`) |
| POST | `/api/tasks/{id}/claim` | agent, senior, admin | Claim a task |
| POST | `/api/tasks/{id}/complete` | agent, senior, admin | Complete a task |

Example request body for `POST /api/tickets`:

```json
{ "title": "VPN down", "description": "Cannot connect since this morning", "priority": "URGENT" }
```

## Project structure

```
.
├── docker-compose.yml
├── pom.xml
├── src/main
│   ├── java/com/yosr/tickets
│   │   ├── config/        Spring Security configuration
│   │   ├── model/         Ticket entity
│   │   ├── repository/    Spring Data JPA repository
│   │   ├── service/       Ticket creation, starts the Camunda process
│   │   ├── web/           REST controller
│   │   └── workflow/      Beans called by the BPMN service tasks
│   └── resources
│       ├── processes/     ticket-process.bpmn
│       ├── static/        minimal test page
│       └── application.yml
└── frontend/              Angular application
```

## Possible improvements

- JWT authentication instead of HTTP Basic, with roles mapped to Camunda groups
- Unit and integration tests (JUnit 5, Mockito, process tests)
- CI pipeline (build, tests, Docker image)
- Camunda Cockpit and Tasklist for process monitoring
- Notifications (email) in the escalation step

## Author

**Yousser Bouguerra**, Software Engineer
[LinkedIn](https://www.linkedin.com/) | [GitHub](https://github.com/)
