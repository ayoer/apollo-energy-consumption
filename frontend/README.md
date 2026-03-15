# Apollo Energy Monitoring Platform — Frontend

## Overview

React SPA for the energy monitoring platform. Provides separate interfaces for admin and regular user roles.

---

## Tech Stack

| Layer           | Technology                |
|-----------------|---------------------------|
| Framework       | React 19 + TypeScript     |
| Build Tool      | Vite                      |
| UI Library      | Ant Design 6              |
| State           | Redux Toolkit             |
| HTTP Client     | Axios                     |
| Routing         | React Router DOM 7        |
| Container       | Docker + Nginx             |

---

## Project Structure

```
src/
├── components/
│   └── ProtectedRoute.tsx
├── helpers/
│   └── notify.ts
├── layouts/
│   ├── AdminLayout.tsx
│   └── UserLayout.tsx
├── pages/
│   ├── Login.tsx
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── Organizations.tsx
│   │   ├── Users.tsx
│   │   ├── UserDetail.tsx
│   │   ├── Meters.tsx
│   │   └── Reports.tsx
│   └── user/
│       └── Dashboard.tsx
├── service/
│   └── index.ts
├── store/
│   ├── index.ts
│   ├── hooks.ts
│   ├── types.ts
│   ├── spinner/
│   ├── auth/
│   ├── organization/
│   ├── user/
│   ├── meter/
│   └── report/
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

Each store module follows the same structure: `action-types.ts`, `actions.ts`, `reducer.ts`, `selectors.ts`, `index.ts`.

---

## Setup

```bash
npm install
npm run dev           # port 5173

# Docker
docker compose up -d  # Nginx on port 8080
```

---

## Notes

**State management:** Currently all API responses go through `createAsyncThunk` and are stored in Redux. In a real project, not every piece of data needs to live in global state — page-level data could stay in component state with a simpler async wrapper instead of `createAsyncThunk`. I kept this approach here to demonstrate the Redux Toolkit module pattern consistently.

**Other intentional omissions:**
- No route-based code splitting (`React.lazy`) — would be needed at scale
- No separate form validation library (using Ant Design's built-in validation)
- No i18n support
