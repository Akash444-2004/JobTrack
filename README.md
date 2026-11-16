# JobTrack – Job Application Tracking System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://job-track-fy35.vercel.app)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2018-336791?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.2-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

> 🌐 **Live Application**: [https://job-track-fy35.vercel.app](https://job-track-fy35.vercel.app)

**JobTrack** is a production-deployed, full-stack career pipeline and interview tracking system built with **Java 21**, **Spring Boot**, **Spring Security (JWT)**, **Spring Data JPA / Hibernate**, **PostgreSQL 18**, and **React 19 (Vite)**.

---

## Key Features

- **Secure JWT Authentication & Authorization**: BCrypt password hashing, stateless JWT verification, and strict per-user ownership isolation across all applications, status history, and interviews.
- **Interactive Analytics Dashboard**: KPI cards (`Total Applications`, `Applied`, `Assessments`, `Interviews`, `Selected`, `Rejected`), pipeline response rate, Recharts donut chart for status distribution, 6-month application activity bar chart, recent applications, and upcoming interviews.
- **Full Application Lifecycle Management**: Create, inspect, edit, delete, and quick-update application stages with automatic **Status History Timeline** auditing.
- **Advanced Search, Filtering, Sorting & Pagination**: Server-side JPA Specifications supporting keyword search, status, job type, work mode, sortable columns, and pagination.
- **Interview Scheduling & Tracking**: Schedule interview rounds per application, track dates/times, interviewers, preparation notes, and outcomes (`SCHEDULED`, `RESCHEDULED`, `PENDING_FEEDBACK`, `PASSED`, `FAILED`, `CANCELLED`).
- **User Profile Management**: Update display name, email (with seamless JWT refresh), and account password.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Java 21, Spring Boot 4.1.2, Spring Web MVC, Spring Data JPA, Hibernate, Spring Security 7, JJWT 0.12.6, Jakarta Validation, Lombok, Maven |
| **Database** | PostgreSQL 18 (`jobtrack_db`), H2 (automated tests) |
| **Frontend** | React 19, Vite, React Router DOM 7, Axios, Bootstrap 5, Recharts, Lucide React |
| **Testing & Tooling** | JUnit 5, Mockito, Spring MockMvc, Postman API Collection, Docker & Docker Compose |

---

## Project Structure

```text
JobTrack/
├── backend/
│   ├── src/main/java/com/jobtrack/
│   │   ├── JobTrackApplication.java
│   │   ├── config/          # SecurityConfig, CorsConfig
│   │   ├── controller/      # Auth, User, JobApplication, Interview, Dashboard
│   │   ├── dto/             # Request & Response DTOs with Bean Validation
│   │   ├── entity/          # User, JobApplication, ApplicationStatusHistory, Interview + Enums
│   │   ├── exception/       # GlobalExceptionHandler & custom exceptions
│   │   ├── mapper/          # DTO <-> Entity mapping
│   │   ├── repository/      # Spring Data JPA repositories & Specifications
│   │   ├── security/        # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal
│   │   └── service/impl/    # Business logic & transactional services
│   ├── src/main/resources/application.properties
│   ├── src/test/java/com/jobtrack/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      # Sidebar, Navbar, DashboardCards, ApplicationTable, etc.
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # useAuth, useDebounce
│   │   ├── layouts/         # MainLayout
│   │   ├── pages/           # Login, Register, Dashboard, Applications, Add/Edit/Details, Interviews, Profile
│   │   ├── services/        # Axios client & REST API modules
│   │   ├── styles/          # Custom CSS design system
│   │   ├── utils/           # Constants & formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── postman/
│   └── JobTrack_API_Collection.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Local Setup & Running Instructions (Windows 10/11)

### 1. Prerequisites

- **Java 21 (JDK 21)**
- **Node.js 20+ & npm**
- **PostgreSQL 18**

### 2. Create the PostgreSQL Database

Open **pgAdmin** or **SQL Shell (`psql`)** and create the database:

```sql
CREATE DATABASE jobtrack_db;
```

Or in PowerShell:

```powershell
psql -U postgres -c "CREATE DATABASE jobtrack_db;"
```

### 3. Configure Environment Variables

In PowerShell (in the backend terminal session), set your PostgreSQL credentials and optional JWT secret:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/jobtrack_db"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "your_postgres_password"
$env:JWT_SECRET = "ReplaceWithYourStrong256BitJwtSecretKeyForProduction2026!"
```

*(See `.env.example` for all configurable environment variables.)*

### 4. Run the Spring Boot Backend

```powershell
cd JobTrack\backend
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

Backend runs at: **`http://localhost:8080`**

### 5. Run the React Frontend

Open a second PowerShell terminal:

```powershell
cd JobTrack\frontend
npm install
npm run dev
```

Frontend runs at: **`http://localhost:5173`**

---

## REST API Endpoints

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user & receive JWT | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | Public |
| `GET` | `/api/users/profile` | Get current user profile & counts | Bearer JWT |
| `PUT` | `/api/users/profile` | Update name, email, or password | Bearer JWT |
| `POST` | `/api/applications` | Create a job application | Bearer JWT |
| `GET` | `/api/applications` | List paginated/sorted applications | Bearer JWT |
| `GET` | `/api/applications/search` | Search & filter applications | Bearer JWT |
| `GET` | `/api/applications/{id}` | Get application details, history & interviews | Bearer JWT |
| `PUT` | `/api/applications/{id}` | Update application & log status change | Bearer JWT |
| `PATCH` | `/api/applications/{id}/status` | Quick-update application status | Bearer JWT |
| `DELETE` | `/api/applications/{id}` | Delete application (cascades history & interviews) | Bearer JWT |
| `GET` | `/api/dashboard/stats` | Get KPI counts, distribution & monthly activity | Bearer JWT |
| `GET` | `/api/dashboard/recent` | Get recent applications & upcoming interviews | Bearer JWT |
| `POST` | `/api/applications/{id}/interviews` | Schedule interview for an application | Bearer JWT |
| `GET` | `/api/applications/{id}/interviews` | List interviews for an application | Bearer JWT |
| `GET` | `/api/interviews` | List all user interviews (filter by outcome) | Bearer JWT |
| `PUT` | `/api/interviews/{id}` | Update interview details or outcome | Bearer JWT |
| `DELETE` | `/api/interviews/{id}` | Delete an interview | Bearer JWT |

---

## Testing

### Backend Unit & Integration Tests (JUnit 5 + Mockito + MockMvc)

```powershell
cd JobTrack\backend
.\mvnw.cmd test
```

### Postman API Collection

Import `postman/JobTrack_API_Collection.json` into Postman:
1. Run **Register User** or **Login User** — a Postman test script automatically saves the returned JWT into the `{{token}}` collection variable.
2. Execute any endpoint across User Profile, Job Applications, Interviews, and Dashboard.

---

## Deployment

### Option 1: Docker Compose (Recommended Full-Stack Deployment)

1. Copy `.env.example` to `.env` and set strong `DB_PASSWORD` and `JWT_SECRET` values.
2. Start PostgreSQL 18, Spring Boot backend, and Nginx-hosted React frontend:

```powershell
cd JobTrack
docker compose up --build -d
```

- Frontend: `http://localhost:3000` (Nginx proxies `/api/*` to the Spring Boot container)
- Backend API: `http://localhost:8080`
- PostgreSQL 18: `localhost:5432`

### Option 2: Cloud Hosting (Render / Railway / AWS / Vercel)

- **Backend**: Build executable JAR with `.\mvnw.cmd clean package -DskipTests` (`target/backend-0.0.1-SNAPSHOT.jar`) or deploy `backend/Dockerfile`. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `CORS_ALLOWED_ORIGINS` (your production frontend URL).
- **Frontend**: Set `VITE_API_BASE_URL=https://your-backend-domain/api` and run `npm run build`, then serve `frontend/dist` on Vercel, Netlify, or Nginx.
