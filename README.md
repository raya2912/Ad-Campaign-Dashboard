# AdVision Insights: Full-Stack Ad Campaign Management & Metrics Dashboard

AdVision Insights is a full-stack, single-page application (SPA) designed to help advertisers manage marketing campaigns, track key performance indicators (KPIs), and review automated performance suggestions. This project is engineered with a modular, type-safe architecture using React on the frontend, Node.js and Express on the backend, and PostgreSQL for persistent relational data storage.

---

## 📋 Business Problem & Solution

### The Business Problem
Modern digital marketers use multiple advertising channels (e.g., search, social, display), which scatters marketing performance metrics across separate platforms. Consolidating this raw data to calculate critical ratios like Click-Through Rate (CTR), Cost-Per-Click (CPC), Conversion Rate (CVR), and Return on Ad Spend (ROAS) is historically slow, highly manual, and error-prone. This delays vital budget allocation decisions and limits advertising efficiency.

### The Solution
AdVision Insights provides a centralized campaign management and analytics suite:
*   **Metric Consolidation:** A unified backend aggregates raw campaign performance data (impressions, clicks, spend, conversions, revenue) into clear, computed KPIs.
*   **Role-Based Security:** Protects multi-tenant data, ensuring advertisers only view their own campaigns while system administrators can audit cross-campaign activity logs.
*   **Relational Recommendations:** An automated relational rules system flags campaign budget inefficiencies and displays actionable alerts (alerts, trends, recommendations) linked directly to active campaigns.

---

## 🌟 Key Features

*   **Secure Session Authentication:** Stateless JWT token-based login and registration, with secure salted password hashing using `bcryptjs`.
*   **Role-Based Access Control (RBAC):** Restricts data views based on roles. Advertisers can only read and mutate campaigns matching their own user ID, while Admins have full read access for auditing.
*   **Computed Marketing Metrics Engine:** Backend aggregations dynamically calculate and serve CTR, CPC, Conversion Rate, and Return on Ad Spend (ROAS) from raw relational metrics.
*   **Interactive Analytics Dashboard:** Responsive line and bar visualizers built with Recharts, displaying budget spend vs. sales and clicks vs. conversions.
*   **Campaign CRUD Manager:** Fully interactive table allowing advertisers to draft, launch, edit, schedule, and delete campaigns.
*   **Relational Database Cascade Purging:** Leverages PostgreSQL cascade deletes on foreign keys, ensuring all metric and suggestion tables are instantly purged upon parent campaign deletion to maintain database integrity.
*   **Direct Developer Bypass Logins:** Built-in "Advertiser" and "Admin" direct login buttons that automatically bypass credentials to facilitate rapid, 1-click feature auditing during technical presentations.

---

## 💻 Technology Stack

| Layer | Technology | Architectural Choice Justification |
| :--- | :--- | :--- |
| **Frontend UI** | React 19 + TypeScript + Vite 8 | Fast native ES-module hot reloading (HMR) and strict compile-time interface enforcement over legacy Webpack templates. |
| **Styling** | Tailwind CSS v4 + Shadcn UI | Atomic, zero-runtime utility styling mapped directly to custom HSL layout tokens to ensure high performance and accessibility. |
| **Client Caching** | TanStack React Query v5 | Decoupled client and server state. Employs caching, retry caps, and window refetch suppression to minimize redundant API requests. |
| **State Management** | Zustand 5 | A hook-based, ultra-lightweight state store that manages authentication sessions without the heavy boilerplate of Redux. |
| **Backend API** | Node.js + Express 5 + TS | Asynchronous, event-driven architecture with clean separation of routes, middlewares, controllers, and database configurations. |
| **Database ORM** | Prisma ORM + PostgreSQL | Secure, relational database storage. Prisma handles schema migrations and generates local types, eliminating object-relational mapping bugs. |
| **Validation** | Zod | Implements runtime variable parsing to prevent server execution on invalid or missing properties. |

---

## ⚙️ System Architecture & Data Flow

AdVision Insights utilizes a standard decoupled Client-Server architecture:

```
[ Advertiser UI (React SPA) ]
          │
          │  Outbound HTTPS Requests (Axios Client)
          │  Enforces Bearer JWT inside Request Interceptors
          ▼
[ Express REST Server (API Gateway) ]
          │
          │  1. env.ts validates process.env via Zod (Fail-Fast)
          │  2. authMiddleware.ts verifies JWT signature
          │  3. Role-based controllers run request validators
          ▼
[ Prisma Client (Type-Safe Query Layer) ]
          │
          │  Enforces { where: { userId: req.user.id } } Row Isolation
          ▼
[ PostgreSQL Engine (Data Persistence) ]
```

---

## 📊 Database Design

The relational database is configured in PostgreSQL using Prisma. High-priority foreign keys enforce cascading deletions at the database level:

```mermaid
erDiagram
    User ||--o{ Campaign : "owns (1-to-N)"
    User ||--o{ ActivityLog : "generates (1-to-N)"
    Campaign ||--|| Metric : "has metrics (1-to-1 Cascade)"
    Campaign ||--o{ AIInsight : "receives insights (1-to-N Cascade)"

    User {
        string id PK
        string email UNIQUE
        string password
        string name
        Role role "ADMIN | ADVERTISER"
        datetime createdAt
    }

    Campaign {
        string id PK
        string name
        float budget
        CampaignStatus status "DRAFT | ACTIVE | PAUSED | COMPLETED | DELETED"
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

## 🔌 API Architecture

All data endpoints are grouped logically and guarded securely:

### 1. Authentication (`/api/auth`)
*   `POST /signup` - Registers a new user. Enforces email uniqueness and bcrypt password salting.
*   `POST /login` - Validates credentials and returns a signed JWT token.
*   `GET /me` - Fetches authenticated user profile credentials. (Requires JWT validation).

### 2. Campaign Manager (`/api/campaigns`)
*(All endpoints below require JWT validation and enforce Row-Level advertiser filtering)*
*   `GET /` - Retrieves campaigns owned by the active user (includes linked campaign metrics).
*   `GET /:id` - Retrieves detailed stats for a single campaign (includes metrics and insights).
*   `POST /` - Creates a campaign and initializes empty child metrics.
*   `PUT /:id` - Modifies campaign budget, dates, and status.
*   `DELETE /:id` - Deletes a campaign (triggers cascade purges on database metrics).

### 3. Aggregated Analytics (`/api/analytics`)
*   `GET /dashboard` - Enforces user-level campaign filtering, dynamically calculating total spend, revenue, impressions, clicks, CTR, CPC, Conversion Rate, and Return on Ad Spend (ROAS).

---

## 📷 Dashboard Preview
*(Insert screenshot of your dashboard interface here)*
![Login Screen Interface Screenshot](frontend/src/assets/hero.png)

---

## 🛠️ Installation & Local Setup

Ensure you have **Node.js (v18+)** and a local **PostgreSQL** database server running.

### 1. Backend Installation & Migration
1. Go into the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env` file in the `/backend` folder:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ad_campaign_dashboard?schema=public"
   JWT_SECRET="YOUR_SECRET_JWT_SIGNING_KEY_FOR_LOCAL_DEV"
   JWT_EXPIRES_IN="7d"
   ```
4. Run the Prisma database migrations to create physical tables in PostgreSQL:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the database with calculated campaign and metrics mock data:
   ```bash
   npx tsx src/utils/mockData.ts
   ```
6. Start the API development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Installation & Startup
1. Open a **second terminal window** and go into the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the local address (typically **http://localhost:5173**).

---

## 👤 Demo Credentials (1-Click Login Enabled)
To bypass typing passwords during technical reviews, use the built-in bypass buttons or enter these credentials:
*   **Advertiser Account:** `advertiser@example.com` / `user123`
*   **Admin Account:** `admin@example.com` / `admin123`

---

## 🔮 Future Improvements

1.  **Database Level Indexing:** Add composite indexes in the Prisma schema on foreign keys (`userId`, `campaignId`) to reduce query complexity from linear $O(N)$ scans to logarithmic $O(\log N)$ searches as campaigns grow.
2.  **Database Aggregate Queries:** Migrate the in-memory JavaScript analytical calculations into PostgreSQL aggregate views (`SUM`, `AVG`) to reduce server RAM overhead.
3.  **Third-Party AI Integration:** Integrate a real-time LLM API (such as Google Gemini or OpenAI) to generate dynamic, contextual campaign optimization suggestions instead of using math simulation tables.
4.  **Unit & Integration Tests:** Write Jest backend controller tests and React Testing Library frontend tests to ensure complete API coverage.

---

## 👨‍💻 My Contribution

As the lead developer on this project, I architected and built this system from scratch:
*   Designed the **PostgreSQL relational database schema** and configured Prisma migrations with cascade integrity.
*   Built the **Express REST API** utilizing strict Zod variable schemas and JWT auth middleware guards.
*   Developed the **dynamic analytics controller** to aggregate raw metrics into calculated advertising indicators.
*   Created the **database seeder** to simulate realistic click-through-rates and conversion ratios.
*   Designed the responsive, dark **glassmorphic React dashboard** utilizing Recharts, Zustand state stores, and TanStack React Query clients.

---

## 📩 Contact & Author Information

*   **Author Name:** Raya
*   **GitHub Repository:** [raya2912/Ad-Campaign-Dashboard](https://github.com/raya2912/Ad-Campaign-Dashboard)
*   **Email:** rayads2013@gmail.com
