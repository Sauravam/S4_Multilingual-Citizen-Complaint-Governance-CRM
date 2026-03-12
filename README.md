# 🏛️ GovTech CRM — Multilingual Citizen Complaint Portal

A production-ready, AI-powered governance platform built to bridge the gap between citizens and local authorities across India's diverse linguistic landscape. 

This CRM allows citizens to submit civic complaints (e.g., potholes, water supply issues, electricity cuts) in their **native language**. The system uses AI to translate, categorize, assess severity, and automatically route the issue to the correct government department. It features strict **Role-Based Access Control (RBAC)** across three distinct portals: Citizens, Officers, and Administrators.

---

## ✨ Core Features

1. **Multilingual UI & AI Translation:**
   - The UI natively supports **9 Indian Languages** (English, Hindi, Marathi, Tamil, Bengali, Telugu, Punjabi, Gujarati, Kannada) using a custom React Context provider. The site theme (colors/gradients) dynamically shifts to match the cultural context of the selected language.
   - When a citizen submits a complaint in a regional language, the backend AI automatically translates the text to English for unified officer processing.
2. **AI Classification & Routing:**
   - The AI engine reads the complaint and assigns a Category (e.g., Roads, Health), Department, and initial Severity rating (Low to Critical).
   - Complaints are automatically assigned to the relevant department dashboard, removing manual triage bottlenecks.
3. **Advanced Accountability Mechanisms:**
   - **Duplicate Detection:** AI flags similar complaints within a 10km radius to prevent spam and link related issues.
   - **SLA Breach Tracking:** Admin dashboards flag complaints that exceed specific resolution timeframes (e.g., > 3 days old).
   - **Citizen Escalation:** Allowed for citizens if issues are ignored past SLA limits.
4. **Secure RBAC Pipeline:**
   - **Citizens:** Can only submit and track their own complaints.
   - **Officers:** See only complaints routed to their specific department. They can update statuses and add official remarks.
   - **Admins:** Have a god's-eye view. They can monitor site-wide metrics, oversee all users, and directly edit, delete, or forcibly reassign any complaint in the system.
5. **Evidence Uploads:** Citizens can attach photographic evidence during submission, which is securely hosted via Supabase Storage and rendered on the dashboards.

---

## 🛠️ Technology Stack & Architecture

This project is built using a modern decoupled architecture: a robust Python API for heavy data processing and a lightning-fast React frontend for the user experience.

### 1. Frontend: Next.js (React)
- **Framework:** Next.js (App Router) provides server-side rendering, API proxying (to avoid CORS issues), and optimized routing.
- **Styling:** Vanilla CSS (`globals.css`) with CSS Variables to power the dynamic theming system, glassmorphism UI elements, and complex gradient animations without external bloat.
- **Security:** Uses Next.js Edge `middleware.ts` to read HTTP-only cookies and strictly redirect users away from unauthorized dashboards (e.g., bouncing citizens out of the `/admin` portal).

### 2. Backend: FastAPI (Python)
- **Framework:** FastAPI is chosen for its extreme speed and native handling of asynchronous operations, which is crucial when waiting for AI inferencing.
- **Security:** `passlib` and `bcrypt` are used to cryptographically hash user passwords upon registration. `HTTPException` rules enforce that endpoints strictly check the requester's Role before mutating database states.

### 3. Database & Storage: Supabase (PostgreSQL)
- **Database:** Supabase acts as our hosted PostgreSQL instance. We maintain strict schemas for `users` and `complaints`.
- **Storage:** The `evidence` bucket handles image uploads, taking Base64 strings from the frontend and returning public CDNs.

### 4. Artificial Intelligence: Google Gemini
- **NLP Engine:** The `google-genai` SDK is used in the backend `ai_service.py` to process incoming complaint text, extracting structured JSON regarding translation, severity, and category match.

---

## 📂 Project Structure & File Index

The repository is split into two primary folders: `client/` (Next.js) and `server/` (FastAPI).

### `client/` (Frontend)
```text
client/
├── app/
│   ├── layout.tsx         # The root layout wrapping the app in the LanguageContext
│   ├── page.tsx           # The Homepage (Hero, Stats, Features)
│   ├── globals.css        # The core styling engine, CSS variables, and animations
│   ├── middleware.ts      # Next.js Edge security barrier enforcing RBAC routes
│   ├── login/             # User Authentication Flow
│   ├── register/          # New Citizen Onboarding
│   ├── submit/            # The Multi-step Complaint Submission Wizard
│   ├── track/             # Public/Citizen Complaint Status Tracker
│   ├── user/              # The Citizen's personal dashboard
│   ├── officer/           # The Department Officer's dashboard
│   ├── admin/             # The Root Administrator's control suite
│   │   ├── dashboard/     # High-level analytics
│   │   ├── complaints/    # God-mode table allowing edits & deletions
│   │   └── users/         # System user registry
│   └── components/
│       ├── Navbar.tsx     # Smart Navigation (Hides tools based on role + Language Dropdown)
│       └── ClientProviders.tsx # Context Wrapper
├── context/
│   └── LanguageContext.tsx # Manages the active translation state and UI theme switching
└── utils/
    └── translations.ts     # The massive 9-language UI string dictionary
```

### `server/` (Backend)
```text
server/
├── main.py                # FastAPI entry point, connects routers and handles CORS
├── database.py            # Initializes the Supabase python client connecton
├── schema.sql             # Reference SQL script containing table architectures (Users, Complaints)
├── requirements.txt       # Python dependency lockfile
├── routers/               # API Endpoints
│   ├── auth.py            # Handles Bcrypt hashing, session tokens, and database user validation
│   ├── complaints.py      # Core CRUD logic. Validates roles, triggers AI ingestion, handles uploads
│   └── analytics.py       # Aggregates system metrics (protected Admin-only route)
└── services/
    └── ai_service.py      # Interfaces with Google Gemini to structure citizen-submitted text
```
## 🧱 System Architecture

```mermaid
flowchart TD

A[Citizen / Officer / Admin]

A --> B[Frontend Layer<br/>Next.js + React + TypeScript]

B --> C[REST API Communication]

C --> D[FastAPI Backend]

D --> E[AI Processing Layer<br/>Translation<br/>Categorization<br/>Analytics]

E --> F[Database Layer<br/>Supabase / PostgreSQL]

F --> G[Admin Dashboard]

F --> H[Citizen Complaint Tracking]

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (3.12+)
- A Supabase Project (Database + Public "evidence" bucket)
- Google Gemini API Key

### 1. Backend Initialization
```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Create a `server/.env` file:
```env
SUPABASE_URL="your-project-url"
SUPABASE_KEY="your-anon-or-service-key"
GEMINI_API_KEY="your-gemini-key"
```
Run the FastApi Server:
```bash
python3 -m uvicorn main:app --reload
```

### 2. Frontend Initialization
```bash
cd client
npm install
```
Run the Next.js Client:
```bash
# This will spin up on localhost:3000
# The frontend automatically proxies /api calls to FastAPI running on 8000
npm run dev
```

### 3. Database Schema
Execute the contents of `server/schema.sql` inside your Supabase project's SQL Editor to instantiate the required relational tables before launching the app.

---

> Built with 🤖 AI & ❤️ for transparent, accelerated civic governance.
