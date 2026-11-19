# JobTrack – Job Application Tracking System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel)](https://job-track-fy35.vercel.app)
![Database](https://img.shields.io/badge/Database-PostgreSQL%2018-336791?style=flat-square&logo=postgresql&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.2-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)

**Live app:** https://job-track-fy35.vercel.app

JobTrack keeps track of a job search in one place. You add each application, move it through the hiring stages, schedule interview rounds, and see how the search is going on a dashboard.

Each user only sees their own data. The app is a React frontend, a Spring Boot API, and a PostgreSQL database.

## Features

**Accounts**

- Register and log in with email and password.
- Passwords hashed with BCrypt and stateless JWT authentication.
- Every application, status change and interview is scoped to the logged-in user.
- Profile page for updating display name, email and password. Changing the email issues a new token.

**Applications**

- Add an application with company, role, location, job type, work mode, status, salary, job link and notes.
- View, edit and delete applications.
- Quick status update from the list view.
- Every status change is written to a history timeline on the application.
- Filter by status, job type and work mode, search by keyword, sort any column, and page through results. All of it runs on the server through JPA Specifications.

**Interviews**

- Schedule rounds for an application with date, time, interviewer, mode and preparation notes.
- Track outcomes: `SCHEDULED`, `RESCHEDULED`, `PENDING_FEEDBACK`, `PASSED`, `FAILED`, `CANCELLED`.
- A separate interviews page lists everything, filterable by outcome.

**Dashboard**

- KPI cards for total applications, applied, assessments, interviews, selected and rejected.
- Response rate for the pipeline.
- Donut chart for status distribution and a bar chart for the last six months of activity.
- Recent applications and upcoming interviews.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Backend | Java 21, Spring Boot 4.1.2, Spring Web MVC, Spring Data JPA, Hibernate, Spring Security 7, JJWT 0.12.6 |
| Database | PostgreSQL 18 in production, H2 in memory for tests |
| Frontend | React 19, Vite, React Router 7, Axios, Bootstrap 5, Recharts, Lucide |
| Build and deploy | Maven, npm, Docker, Docker Compose, Nginx, Vercel |
| Tools | JUnit 5, Mockito, MockMvc, Postman |

## Project structure

```text
JobTrack/
├── backend/
│   ├── src/main/java/com/jobtrack/
│   │   ├── config/        # security and CORS
│   │   ├── controller/    # auth, user, application, interview, dashboard
│   │   ├── dto/           # request and response records with validation
│   │   ├── entity/        # user, application, status history, interview
│   │   ├── exception/     # global error handler
│   │   ├── mapper/        # entity to DTO mapping
│   │   ├── repository/    # JPA repositories and specifications
│   │   ├── security/      # JWT provider, JWT filter, rate limiter
│   │   └── service/       # business logic
│   ├── src/test/java/com/jobtrack/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/    # sidebar, navbar, cards, tables, charts
│   │   ├── context/       # auth context
│   │   ├── hooks/         # useAuth, useDebounce
│   │   ├── layouts/       # main layout
│   │   ├── pages/         # login, register, dashboard, applications, interviews, profile
│   │   ├── services/      # axios client and API modules
│   │   ├── styles/        # CSS design system
│   │   └── utils/         # constants and formatters
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json        # SPA fallback for React Router
│   └── package.json
├── postman/
│   └── JobTrack_API_Collection.json
├── docker-compose.yml
└── .env.example
```

## Running locally

You need Java 21, Node 20 or newer, and PostgreSQL 18.

Create the database:

```sql
CREATE DATABASE jobtrack_db;
```

Set the environment variables in the backend terminal. Only `DB_PASSWORD` and `JWT_SECRET` really need changing:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/jobtrack_db"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "your_postgres_password"
$env:JWT_SECRET = "a_long_random_secret_of_at_least_256_bits"
```

Start the backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8080`

The frontend reads `VITE_API_BASE_URL` and appends `/api` if it is missing, so both `http://localhost:8080` and `http://localhost:8080/api` work.

The schema is created by Hibernate on startup (`ddl-auto=update`), so there are no migration files to run.

## Environment variables

### Backend

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/jobtrack_db` | JDBC URL |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | empty | Database password |
| `JWT_SECRET` | development default | Token signing key, at least 256 bits |
| `JWT_EXPIRATION` | `86400000` | Token lifetime in milliseconds (24 hours) |
| `SERVER_PORT` | `8080` | HTTP port |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Allowed frontend origins |
| `RATE_LIMIT_MAX_ATTEMPTS` | `15` | Login and register attempts per minute per IP |
| `HIKARI_MAX_POOL_SIZE` | `10` | Connection pool size |
| `HIKARI_MIN_IDLE` | `2` | Idle connections kept open |
| `JPA_SHOW_SQL` | `false` | Log SQL statements |

### Frontend

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | API base URL |

## API

All endpoints below return JSON. Protected routes expect `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register and receive a token |
| `POST` | `/api/auth/login` | Log in and receive a token |
| `GET` | `/api/users/profile` | Current profile with counts |
| `PUT` | `/api/users/profile` | Update name, email or password |
| `POST` | `/api/applications` | Create an application |
| `GET` | `/api/applications` | List applications, paginated and sorted |
| `GET` | `/api/applications/search` | Search and filter applications |
| `GET` | `/api/applications/{id}` | Application with history and interviews |
| `PUT` | `/api/applications/{id}` | Update an application and log status changes |
| `PATCH` | `/api/applications/{id}/status` | Quick status update |
| `DELETE` | `/api/applications/{id}` | Delete an application and its history and interviews |
| `POST` | `/api/applications/{id}/interviews` | Schedule an interview |
| `GET` | `/api/applications/{id}/interviews` | Interviews for one application |
| `GET` | `/api/interviews` | All interviews, filterable by outcome |
| `PUT` | `/api/interviews/{id}` | Update an interview or its outcome |
| `DELETE` | `/api/interviews/{id}` | Delete an interview |
| `GET` | `/api/dashboard/stats` | KPI counts, distribution and monthly activity |
| `GET` | `/api/dashboard/recent` | Recent applications and upcoming interviews |

The auth controller also accepts the same routes without the `/api` prefix (`/auth/login`, `/auth/register`).

## Security

- Passwords are hashed with BCrypt; the API never returns them.
- Tokens are signed with HMAC-SHA256 and expire after 24 hours by default.
- The JWT filter loads the user from the database on each request, so ownership checks use the current account, not just the token payload.
- CORS only allows the configured origins.
- Login and register are limited to 15 requests per minute per IP and return `429` with `Retry-After` when exceeded.
- Request bodies are validated with Bean Validation before they reach the service layer.

## Testing

Backend tests run against an in-memory H2 database in PostgreSQL mode, so no local database is needed:

```powershell
cd backend
.\mvnw.cmd test
```

That runs 21 tests: integration tests for the main flows, plus service tests for auth, applications, interviews, dashboard and users, and unit tests for the rate limiter.

Postman collection:

1. Import `postman/JobTrack_API_Collection.json`.
2. Run **Register User** or **Login User**. The collection script saves the token to `{{token}}`.
3. Call any other endpoint.

The frontend has no automated test suite yet.

## Deployment

### Docker Compose

1. Copy `.env.example` to `.env` and set `DB_PASSWORD` and `JWT_SECRET`.
2. Start everything:

```powershell
docker compose up --build -d
```

That gives you PostgreSQL on `5432`, the API on `8080`, and the built frontend on `3000`, where Nginx proxies `/api/*` to the backend container.

### Cloud

- **Backend:** build the jar with `.\mvnw.cmd clean package -DskipTests`, or deploy `backend/Dockerfile`. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` and `CORS_ALLOWED_ORIGINS` to the frontend URL.
- **Frontend:** set `VITE_API_BASE_URL` to the deployed API URL, run `npm run build`, and serve `dist` on Vercel or Netlify. The included `vercel.json` handles React Router routes.
- **Database:** any managed PostgreSQL works. The schema is created on first start.

## Known limitations

- The JWT is kept in `localStorage`, so an XSS bug would expose it. HttpOnly cookies with CSRF protection would be the next step.
- Rate-limit counters are held in memory, so they apply per API instance.
- Schema changes use Hibernate `ddl-auto=update` rather than versioned migrations.
- No email verification or password reset.
