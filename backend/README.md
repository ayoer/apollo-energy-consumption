# Apollo Energy Monitoring Platform — Backend

## Overview

Energy monitoring backend for enterprise customers. Organizations manage users and energy meters. Meters send index readings, and the system computes consumption from the difference between consecutive readings.

---

## Architecture

Layered architecture with dependency injection:

```
Controller → Service → Repository → Database
```

I chose a pragmatic layered approach over Onion/Clean Architecture because the domain complexity here doesn't justify the extra abstraction. Each module owns its own controller, service, repository, entity, DTO and routes. DI is handled via `typedi`.

### Project Structure

```
src/
├── config/
│   ├── database.ts
│   ├── env.ts
│   └── swagger.ts
├── shared/
│   ├── helpers/
│   │   └── api-response.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── authorization.middleware.ts
│   │   ├── validate-dto.middleware.ts
│   │   ├── rate-limiter.middleware.ts
│   │   └── error-handler.middleware.ts
│   └── exceptions/
│       └── index.ts
├── modules/
│   ├── auth/
│   ├── organization/
│   ├── user/
│   ├── meter/
│   ├── meter-reading/
│   └── report/
├── __tests__/
├── database/
│   ├── migrations/
│   └── seeds/
└── app.ts
```

---

## Database Schema

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meter_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    index_kwh NUMERIC(15, 4) NOT NULL,
    consumption_kwh NUMERIC(15, 4),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_meters (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, meter_id)
);
```

Indexes on `meter_readings(meter_id, timestamp DESC)`, `meters(organization_id)`, `users(email)`.

### Seed Data

Migration seeds a default admin:
- **Email:** admin@example.com
- **Password:** admin123

---

## Tech Stack

| Layer          | Technology                            |
|----------------|---------------------------------------|
| Runtime        | Node.js + TypeScript                  |
| Framework      | Express.js                            |
| DI Container   | typedi                                |
| ORM            | TypeORM                               |
| Validation     | class-validator + class-transformer   |
| Auth           | jsonwebtoken + bcryptjs               |
| Rate Limiting  | express-rate-limit                    |
| API Docs       | Swagger (swagger-jsdoc)               |
| Database       | PostgreSQL                            |
| Testing        | Jest                                  |
| Container      | Docker + Docker Compose               |

---

## Auth & Authorization

- JWT-based authentication
- Two roles: `admin` (full access) and `user` (org-scoped)
- Meter-level access control via `user_meters` join table
- Auto-assignment: new users get all existing org meters, new meters get assigned to all org users

---

## Consumption Calculation

1. New reading arrives with `meterId`, `timestamp`, `index_kwh`
2. Fetch latest reading for the same meter (`SELECT ... FOR UPDATE` to prevent race conditions)
3. No previous reading → `consumption_kwh = NULL`
4. Previous exists → `consumption_kwh = new_index - previous_index`
5. `new_index < previous_index` → reject with 400

An initial reading (0 kWh) is created automatically when a meter is added.

---

## API Response Format

All endpoints use a standardized response via `ApiResponse` helper:

```json
{ "status": "success", "data": { ... } }
{ "status": "success", "message": "Deleted" }
{ "status": "error", "message": "Something went wrong" }
```

---

## API Endpoints

| Method | Endpoint                            | Access        | Description                    |
|--------|-------------------------------------|---------------|--------------------------------|
| POST   | /auth/login                         | Public        | Login, returns JWT             |
| GET    | /organizations                      | Admin         | List organizations             |
| POST   | /organizations                      | Admin         | Create organization            |
| DELETE | /organizations/:id                  | Admin         | Delete organization            |
| GET    | /users                              | Admin         | List users                     |
| GET    | /users/:id                          | Admin         | User detail + assigned meters  |
| POST   | /users                              | Admin         | Create user                    |
| DELETE | /users/:id                          | Admin         | Delete user                    |
| GET    | /meters                             | Authenticated | List meters (filtered by role) |
| POST   | /meters                             | Admin         | Create meter                   |
| DELETE | /meters/:id                         | Admin         | Delete meter                   |
| POST   | /meters/:meterId/assign/:userId     | Admin         | Assign meter to user           |
| DELETE | /meters/:meterId/unassign/:userId   | Admin         | Unassign meter from user       |
| POST   | /meter-readings                     | Public        | Submit meter reading (IoT)     |
| GET    | /report                             | Authenticated | Consumption report (24h)       |
| GET    | /api-docs                           | Public        | Swagger UI                     |

`/meter-readings` has no auth — data comes from IoT devices. A dedicated rate limiter (2 req/min) is applied.

`/report` accepts optional `meterIds` query param (comma-separated). Admins see everything, users see only their org's data.

---

## Setup & Run

### Docker

Backend and frontend use separate Docker Compose files on a shared network.

```bash
cd backend
docker compose up -d

cd ../frontend
docker compose up -d
```

| Service     | URL                            |
|-------------|--------------------------------|
| Backend API | http://localhost:3000           |
| Swagger     | http://localhost:3000/api-docs/ |
| Frontend    | http://localhost:8080           |
| PostgreSQL  | localhost:5432                  |

### Local

```bash
cd backend
npm install
cp .env.example .env
npm run migration:run
npm run dev
```

---

## Tests

```bash
npm test
```

Unit tests cover:
- Consumption calculation (normal, first reading, backwards index, decimal precision, pessimistic locking)
- Auth flow (valid login, wrong email, wrong password, JWT payload)
- User creation (duplicate email, validation, auto-assign org meters)
- Meter creation (initial reading, auto-assign org users)

---

## Time Spent

| Task                  | Hours |
|-----------------------|-------|
| Planning & Design     |       |
| Backend Development   |       |
| Frontend Development  |       |
| Testing               |       |
| Documentation         |       |
| **Total**             |       |

---

## Trade-offs

- **No soft delete.** Deletes cascade. Production would need soft deletes.
- **No token refresh.** Fixed JWT expiration. A refresh token flow would be added.
- **In-memory rate limiting.** Multi-instance deployments would need Redis-backed limiting.
- **No pagination.** List endpoints return all records.
- **Timestamp ordering assumed.** Out-of-order readings from IoT devices are not handled.
