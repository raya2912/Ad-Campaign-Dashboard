# AdVision Insights: Full-Stack Ad Campaign Management & Metrics Dashboard

AdVision Insights is a full-stack, single-page application (SPA) designed to help users manage ad campaigns, track key marketing metrics, and review automated performance suggestions. This project is built using React on the frontend, Node.js and Express on the backend, and PostgreSQL for relational data storage.

---

## 💡 Project Highlights
*   **Full-Stack Integration:** Built a unified client-server application connecting a React frontend to a Node.js/Express backend and a PostgreSQL database.
*   **Stateless Token Security:** Implemented stateless authentication using JSON Web Tokens (JWT) and `bcryptjs` password salting to guard secure routes.
*   **User-Level Row Filtering:** Designed an access control system ensuring advertisers can only fetch and edit campaigns matching their specific user ID.
*   **Database Cascade Integrity:** Configured foreign key constraints with database-level cascading deletions (`onDelete: Cascade`) on campaigns to prevent orphaned database records.
*   **Calculated Analytics Engine:** Built custom backend calculations to dynamically aggregate raw metrics into key performance indicators (CTR, CPC, Conversion Rate, and ROAS).
*   **Interactive Metrics Charts:** Integrated Recharts inside the React client to render responsive charts comparing marketing spend against sales revenue.
*   **Interviewer Bypass Mode:** Created quick-bypass login triggers in the user interface to support rapid, 1-click feature auditing during technical reviews.

---

## 🛠️ Key Technical Skills Demonstrated

*   **REST API Development:** Engineered a structured Express server with modular routing, custom middlewares, and controllers.
*   **Authentication & Authorization:** Configured secure token-based user sessions using JWTs and headers.
*   **Role-Based Access Control (RBAC):** Restructured endpoints to enforce Advertiser-level query filters and Admin-level auditing.
*   **PostgreSQL Database Design:** Formulated a relational schema involving one-to-one and one-to-many model associations.
*   **Prisma ORM:** Managed database migrations, schemas, relationships, and queries using a type-safe client.
*   **React Query:** Synced frontend state with the Express backend using asynchronous query caching and mutations.
*   **State Management:** Structured a global client authentication store using Zustand.
*   **Data Visualization:** Constructed interactive linear and bar charts with Recharts.
*   **KPI Analytics:** Implemented analytical formulas to aggregate and calculate performance ratios.
*   **TypeScript Development:** Enforced strict, end-to-end interface declarations across both client and server codebases.

---

## 📋 Business Problem & Solution

### The Business Problem
Modern digital advertisers deploy campaigns across multiple channels, scattering campaign performance data across separate platforms. Consolidating this raw data to calculate critical marketing ratios like Click-Through Rate (CTR), Cost-Per-Click (CPC), Conversion Rate (CVR), and Return on Ad Spend (ROAS) is historically manual and error-prone, delaying vital budget allocation adjustments.

### The Solution
AdVision Insights resolves this by offering a centralized dashboard:
*   **Unified Aggregations:** The backend automatically consolidates campaign metrics (impressions, clicks, spend, conversions, revenue) into calculated KPIs.
*   **Data Security:** Restricts campaign access by role, keeping advertiser datasets isolated.
*   **Performance Suggestions:** Simulates an automated recommendation engine that flags campaign budget inefficiencies and suggests budget or demographic adjustments.

---

## 💻 Technology Stack

| Layer | Technology | Architectural Choice Justification |
| :--- | :--- | :--- |
| **Frontend UI** | React 19 + TypeScript + Vite 8 | Enforces strict type-safety and provides fast native ES-module hot reloading (HMR) during development. |
| **Styling** | Tailwind CSS v4 + Shadcn UI | Delivers utility styling mapped to HSL tokens, maintaining a clean visual system without zero-runtime utility bloat. |
| **Client Caching** | TanStack React Query v5 | Separates local client state from server state, utilizing query caching to eliminate redundant backend requests. |
| **State Management** | Zustand 5 | A hook-based, lightweight state store ideal for tracking active user credentials without the complex boilerplate of Redux. |
| **Backend API** | Node.js + Express 5 + TS | Single-threaded, non-blocking event-driven runtime environment, ideal for lightweight REST API operations. |
| **Database ORM** | Prisma ORM + PostgreSQL | Handles relational mapping and schema migrations, generating local TS interfaces to catch queries issues at compile time. |
| **Validation** | Zod | Implements schema validations to parse environment variables during server boot. |

---

## ⚙️ System Architecture

AdVision Insights is structured around a decoupled Client-Server architecture:

```
[ Advertiser Client (React UI) ]
          │
          │  Outbound Requests (Axios with Bearer Token Interceptor)
          ▼
[ Express API Gateway (Backend Server) ]
          │
          │  1. config/env.ts validates env variables using Zod
          │  2. authMiddleware.ts verifies incoming JWT signature
          │  3. Role-based controllers validate query inputs
          ▼
[ Prisma Client (ORM Query Layer) ]
          │
          │  Enforces { where: { userId } } campaign filters
          ▼
[ PostgreSQL Engine (Database) ]
```

---

## 📊 Database Design

The relational database is configured in PostgreSQL. Foreign key constraints enforce database-level cascading deletions to maintain structural integrity:

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

Backend endpoints are structured logically:

### 1. Authentication (`/api/auth`)
*   `POST /signup` - Registers a new user account, hashing password credentials using `bcryptjs`.
*   `POST /login` - Checks user credentials and signs an authentication JWT.
*   `GET /me` - Fetches the user profile details. (Requires active JWT validation).

### 2. Campaign Manager (`/api/campaigns`)
*(All endpoints below require JWT validation and enforce Advertiser-level query filters)*
*   `GET /` - Fetches campaigns owned by the logged-in user (includes related campaign metrics).
*   `GET /:id` - Fetches single campaign details (includes metrics and insights).
*   `POST /` - Creates a campaign and maps empty child metrics.
*   `PUT /:id` - Updates campaign budget, schedule, and status.
*   `DELETE /:id` - Deletes a campaign (triggers cascade purges on database metrics).

### 3. Aggregated Analytics (`/api/analytics`)
*   `GET /dashboard` - Computes total spend, revenue, impressions, clicks, CTR, CPC, Conversion Rate, and ROAS.

---

## 📷 Dashboard Preview
*(A screenshot of the dashboard interface)*
![Login Screen Interface Screenshot](frontend/src/assets/hero.png)

---

## 🛠️ Installation & Local Setup

Ensure you have **Node.js (v18+)** and a local **PostgreSQL** database server running.

### 1. Backend Installation & Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the `/backend` folder:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ad_campaign_dashboard?schema=public"
   JWT_SECRET="YOUR_SECRET_JWT_SIGNING_KEY_FOR_LOCAL_DEV"
   JWT_EXPIRES_IN="7d"
   ```
4. Run the database migrations to build tables in PostgreSQL:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the database with calculated campaign and metrics mock data:
   ```bash
   npx tsx src/utils/mockData.ts
   ```
6. Start the Express API server:
   ```bash
   npm run dev
   ```

### 2. Frontend Installation & Startup
1. Open a **second terminal window** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the local address (typically **http://localhost:5173**).

---

## 👤 Demo Credentials
To bypass typing passwords during technical reviews, use the built-in direct login buttons in the UI:
*   **Advertiser Account:** `advertiser@example.com` / `user123`
*   **Admin Account:** `admin@example.com` / `admin123`

---

## 🔮 Future Improvements

1.  **AI Campaign Optimization Engine:** Integrate a real-time LLM API (such as Google Gemini or OpenAI) to generate dynamic, contextual campaign suggestions instead of mathematical simulation tables.
2.  **Campaign Performance Forecasting:** Add predictive models to estimate future CTR, CVR, and ROAS trends based on historical campaign metrics.
3.  **Anomaly Detection & Budget Recommendations:** Implement automated checks to flag unexpected spikes in CPC or drops in conversion rates, recommending budget shifts in real-time.
4.  **Database Query Optimization:** Add composite database indexes on foreign keys (`userId`, `campaignId`) to reduce query lookup overhead as the campaign table grows.
5.  **Database-Side Aggregations:** Migrate analytical aggregations into PostgreSQL aggregate views (`SUM`, `AVG`) rather than doing loop-calculations in Express server memory.
6.  **Containerized Deployment (Docker):** Standardize environments by dockerizing the React client, Express API, and PostgreSQL database.
7.  **Cloud Deployment (AWS):** Deploy the application services using AWS ECS (Fargate) or Elastic Beanstalk, with PostgreSQL hosted on RDS.
8.  **CI/CD Pipelines:** Set up GitHub Actions to automate linting, type-checking, and server builds on every pull request.

---

## 👨‍💻 My Contribution

I developed this portfolio application to gain hands-on experience building full-stack TypeScript systems:
*   **Database Design:** Designed the PostgreSQL relational database schema, mapping models and configuring cascading deletions using Prisma.
*   **API Development:** Built the Express REST API, implementing routes, input validation via Zod, and security controllers using JWT.
*   **Calculations & Seeders:** Programmed the backend analytics metrics engine and designed the mathematical database seeder script to populate realistic click and conversion metrics.
*   **Frontend Development:** Created the responsive React dashboard interface, styling components with Tailwind CSS and Shadcn UI, integrating Recharts graphs, and setting up Zustand global stores.
*   **AI-Assisted Workflow:** Utilized generative AI tools (such as Gemini/Copilot) to accelerate coding iterations, debug TypeScript interfaces, and refine CSS layouts.

---

## 📩 Contact & Author Information

*   **Author Name:** Raya
*   **GitHub Repository:** [raya2912/Ad-Campaign-Dashboard](https://github.com/raya2912/Ad-Campaign-Dashboard)
*   **Email:** rayads2013@gmail.com
