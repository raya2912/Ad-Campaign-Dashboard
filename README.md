# 🌟 AdVision: Full-Stack Ad Campaign Analytics Dashboard

A production-grade marketing intelligence platform designed for advertisers to launch campaigns, track performance metrics, and receive automated performance insights. This repository demonstrates professional software engineering practices including type-safety, database cascade integrity, secure multi-tenant row isolation, stateless token authorization, and dynamic frontend caching.

---

## 🎨 Preview of visual assets
The dashboard includes an ultra-premium, dark glassmorphic interface with reactive statistics:
*   **Key Performance Indicators Grid:** Highlights total budget, spend, revenue, CTR, CPC, CVR, and Return on Ad Spend (ROAS).
*   **Performance Analytics charts:** Custom graphs visualizing campaign spend vs. sales and conversion flows.
*   **Campaign Manager:** An inline CRUD panel allowing active campaign launching, status badge scheduling, editing, and deletion.
*   **Developer Direct Login Bypass:** Feature specifically designed to allow 1-click bypass login as a Demo Advertiser or Demo Admin to easily showcase functionality in under 3 seconds.

---

## 🚀 Core Features

*   **Stateless Authentication & Authorization:** Implements secure JWT-based stateless user sessions. Password hashes are stored securely using `bcryptjs` with salt rounds.
*   **Multi-Tenant Row Isolation:** Express middleware guards endpoints, decoding JWT signatures to inject `req.user`. Prisma queries dynamically filter results matching `where: { userId: req.user.id }` to guarantee advertisers can never view or mutate competitor datasets.
*   **Mathematical Aggregation Engine:** Dynamic backend controller aggregates raw metric database columns to calculate portfolio-wide CTR, CPC, Conversion Rate, and ROAS ratios on the fly.
*   **Relational Database Cascade Integrity:** Relational schema uses `onDelete: Cascade` at the database engine level, ensuring campaign metrics and AI insight tables are automatically purged when campaigns are deleted to prevent database orphans.
*   **Twelf-Factor App Configurations:** Strict runtime environment parsing via `Zod` schemas. If variables (e.g. `DATABASE_URL` or `JWT_SECRET`) are missing or misconfigured, the server fails fast with descriptive logs.
*   **Asynchronous Frontend Data Caching:** Implements `@tanstack/react-query` to decouple local state (managed by Zustand) from asynchronous server state, ensuring efficient query caching, custom retry intervals, and focus-refetch suppression to prevent server bottlenecks.

---

## 🛠️ Technology Stack & Justification

| Layer | Technology | Technical Justification |
| :--- | :--- | :--- |
| **Frontend Core** | **React 19 + TypeScript + Vite 8** | Rapid ES-module building, immediate Hot Module Replacement (HMR) and compile-time type-safety over standard legacy Webpack setups. |
| **Styling** | **Tailwind CSS v4 + Shadcn UI** | High-performance atomic utility styling paired with accessible primitive components (Radix UI) copied directly into the workspace, avoiding bundle bloating. |
| **Client Caching** | **TanStack React Query v5** | Seamless declarative server-state synchronization with 1-retry default queries, preventing duplicated outbound network hits. |
| **Client State** | **Zustand 5** | Lightweight, hook-based global state manager that avoids heavyweight Redux boilerplate, perfectly suited for reactive session tracking. |
| **Backend API** | **Node.js + Express 5 + TS** | Extremely lightweight, fast asynchronous event loop architecture, fully typed to share request-response boundaries. |
| **Database ORM** | **Prisma ORM + PostgreSQL** | Complete programmatic type-safety from database schema models to server client requests, with migrations handled natively. |
| **Validation** | **Zod** | Enforces fail-fast startup variable formatting. |

---

## 📂 Database Schema Design

The relational database is constructed in PostgreSQL with the following relations:

```mermaid
erDiagram
    User ||--o{ Campaign : owns
    User ||--o{ ActivityLog : generates
    Campaign ||--|| Metric : has-one
    Campaign ||--o{ AIInsight : receives

    User {
        string id PK
        string email UNIQUE
        string password
        string name
        Role role
        datetime createdAt
    }

    Campaign {
        string id PK
        string name
        float budget
        CampaignStatus status
        datetime startDate
        datetime endDate
        string userId FK
        datetime createdAt
    }

    Metric {
        string id PK
        string campaignId FK "onDelete: Cascade"
        int impressions
        int clicks
        float spend
        int conversions
        float revenue
    }

    AIInsight {
        string id PK
        string campaignId FK "onDelete: Cascade"
        string type "ALERT | RECOMMENDATION | TREND"
        string message
        datetime createdAt
    }

    ActivityLog {
        string id PK
        string userId FK
        string action
        string details
        datetime createdAt
    }
```

---

## ⚙️ Getting Started & Local Setup

Ensure you have **Node.js (v18+)** and a **PostgreSQL** database server running locally.

### 1. Backend Configuration
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install all node packages:
   ```bash
   npm install
   ```
3. Configure your environmental settings. Create a `.env` file inside `/backend`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://YOUR_POSTGRES_USER:YOUR_POSTGRES_PASSWORD@localhost:5432/ad_campaign_dashboard?schema=public"
   JWT_SECRET="YOUR_SECURE_JWT_SIGNING_KEY_HERE"
   JWT_EXPIRES_IN="7d"
   ```
4. Run the Prisma database migrations to create the physical database tables:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the database with highly realistic ad performance mock data (custom CTR, CPC, spend, and sales conversions calculations):
   ```bash
   npx tsx src/utils/mockData.ts
   ```
6. Start the API development server (listening on port `5000`):
   ```bash
   npm run dev
   ```

---

### 2. Frontend Configuration
1. Open a **second terminal window** and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install all node packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Click the local server address (typically **http://localhost:5173**) to explore the application!

---

## 👨‍💻 Quick Demo Login
To test the full suite of the analytics aggregator without registering:
*   Click **"Advertiser Role"** on the landing screen to instantly review simulated performance cards, Recharts aggregations, and recommendations.
*   Click **"Admin Role"** to explore aggregated analytics with cross-advertiser security logs.
