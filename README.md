<div align="center">

# ResQgrid

**Offline-first disaster response & relief coordination grid.**
*When networks fail, the grid still responds.*

Built at the [WeMakeDevs × AWS Hackathon](https://www.wemakedevs.org/aws) — Bengaluru, India

![Angular](https://img.shields.io/badge/Angular-22-dd0031?logo=angular)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6db33f?logo=springboot)
![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![AWS](https://img.shields.io/badge/AWS-Amplify%20%7C%20ECS%20%7C%20RDS-ff9900?logo=amazonaws)

</div>

## The problem

During floods, cyclones and earthquakes, connectivity is the first thing to fail — exactly when people most need to ask for help. Requests get lost, duplicated, or reach responders too late.

## The solution

ResQgrid connects **residents**, **relief camp workers** and **district / national coordinators** in one system that keeps working with no internet. Requests are stored securely on the device and sync automatically the moment any connection returns.

## Features

| Area | What it does |
|---|---|
| **Offline-ready SOS** | Requests are queued in the browser and auto-dispatched when back online (manual "Sync Now" too). |
| **Resident help desk** | No login needed to ask for help; optional sign-in to track tickets. GPS detection, landmark, people count, special needs (infants, elderly, pregnant, injured, medication). |
| **Disaster triage** | Flood, earthquake, cyclone, landslide, wildfire, heatwave, tsunami, cloudburst, industrial hazard, or custom. Priority levels and optional reference photo. |
| **Emergency directory** | One-tap dial/copy for 112, 108, 101, 1070 and the ResQgrid dispatch desk. |
| **Coordinator command centre** | Role-protected dashboard to move requests Pending → Accepted → Dispatched → Delivered. |
| **Camp worker portal** | Camps raise supply requests (food, water, medicine, shelter) for coordinators to fulfil. |
| **Feedback system** | Community ratings and suggestions at `/feedback`. |
| **Polished UI** | Responsive, dark/light theme, accessible focus states, reduced-motion support. |

## Architecture

```
┌────────────────────┐   HTTPS/REST   ┌──────────────────────┐      ┌──────────────┐
│  Angular 22 SPA    │ ─────────────▶ │  Spring Boot 4 API   │ ───▶ │  MySQL (RDS) │
│  Tailwind CSS 4    │                │  Java 21, JPA        │      └──────────────┘
│  AWS Amplify       │ ◀───────────── │  AWS ECS Fargate+ALB │
└────────────────────┘                └──────────────────────┘
  localStorage queue (offline)
```

## Repository layout

```
resqgrid/
├── amplify.yml                     # AWS Amplify build spec (frontend)
├── resqgrid-frontend/resqgrid-app/ # Angular app
│   ├── public/                     # logo, mark, favicon
│   └── src/app/
│       ├── pages/                  # user, coordinator(+login), camp-worker, create-request, feedback
│       ├── services/               # api, auth, requests, help-requests, feedback, theme
│       └── guards/                 # coordinator route guard
└── resqgrid-backend/               # Spring Boot API
    └── src/main/java/com/solostack/resqgrid/
        ├── controller/             # Auth, HelpRequest, SupplyRequest, Feedback
        └── config/                 # CORS, security, demo account seeding
```

## Frontend routes

| Route | Purpose |
|---|---|
| `/user` | Resident help desk (landing page) |
| `/feedback` | Feedback & suggestions |
| `/coordinator-login` → `/coordinator` | Coordinator sign-in and command dashboard (guarded) |
| `/camp-worker`, `/create-request` | Relief camp portal and supply requests |

## Getting started

**Prerequisites:** Node 22+, Java 21, Maven, MySQL 8.

### Backend
```bash
cd resqgrid-backend
mvn spring-boot:run
```
Runs on `http://localhost:8080`. Configuration via environment variables:

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | local MySQL `aidlinkx` DB | JDBC URL |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / — | Database credentials |
| `SEED_DEMO_USERS` | `true` | Seed demo coordinator accounts — **set `false` in production** |

### Frontend
```bash
cd resqgrid-frontend/resqgrid-app
npm install
npm start          # dev server on http://localhost:4200
npm run build      # production build
```
The API base URL is set in `src/app/services/api.config.ts`.

## Demo accounts

Available on the coordinator login page with one-click fill (seeded when `SEED_DEMO_USERS=true`):

| Role | Email |
|---|---|
| National coordinator | `national@aidlinkx.demo` |
| District coordinator | `district@aidlinkx.demo` |
| Field coordinator | `field@aidlinkx.demo` |

> The demo emails and password still carry the legacy `aidlinkx` name because the backend seeds them. They are for demonstration only.

## Deployment

- **Frontend:** AWS Amplify, configured by `amplify.yml` (output: `dist/resqgrid-app`).
- **Backend:** Docker image on AWS ECS Fargate behind an Application Load Balancer, with Amazon RDS MySQL. `GET /api/requests` and `/api/help-requests` are open for ALB health checks. CORS allows the Amplify domain and local development.

## Author

Developed by **Naiyar Hasnain** for the WeMakeDevs × AWS Hackathon, Bengaluru.
