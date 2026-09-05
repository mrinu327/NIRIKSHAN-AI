# SIH26095 — NIRIKSHAN AI
## DoSJE Centralized Monitoring & Surprise Inspection Mobile App

> **Tagline:** Monitor. Verify. Act.  
> **Core Principle:** An evidence-driven verification platform that connects real-time monitoring, surprise inspection, geo-verified field evidence, CCTV analytics, and explainable AI so officials can verify what is actually happening on the ground.

---

## 1. Project Structure

```text
SIH/
├── packages/
│   └── shared-types/             # Shared TypeScript enums, models, DTOs & service interfaces
├── backend/                      # Node.js + Express + TypeScript API with Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma         # 10 core entities (SQLite/PostgreSQL compatible)
│   │   └── seed.ts               # Synthetic seed with 12 projects, 5 users, 10 CCTV, 15 alerts
│   └── src/
│       ├── config/               # App configuration & environment parsing
│       └── index.ts              # Express API bootstrap & health endpoint
├── mobile/                       # React Native (Expo SDK 52) with Expo Router
│   ├── app/                      # File-based role routing
│   ├── assets/                   # App icons, splash, and brand assets
│   └── src/
│       ├── constants/theme.ts    # Government enterprise design tokens (#123B5D primary)
│       └── types/                # Domain type re-exports
├── SIH26095_Antigravity_Build_Spec.md
└── package.json                  # Workspace script runner
```

---

## 2. Quick Start & Execution Commands

### Prerequisites
- Node.js v20+ (Node v24 tested)
- npm v10+

### Step 1: Install Dependencies
```bash
# Install shared-types dependencies and build types
npm --prefix packages/shared-types install
npm --prefix packages/shared-types run build

# Install backend dependencies
npm --prefix backend install

# Install mobile dependencies
npm --prefix mobile install
```

### Step 2: Database Setup & Synthetic Seeding
```bash
# Sync database schema with SQLite (dev.db)
npm --prefix backend run prisma:push

# Populate 12 synthetic projects, 5 users, 15 explainable alerts & telemetry
npm --prefix backend run prisma:seed
```

### Step 3: Run the Backend API Server
```bash
# Start backend in development mode on port 5000
npm --prefix backend run dev

# Or build and start in production mode
npm --prefix backend run build
npm --prefix backend run start
```
- Health Check: `http://localhost:5000/health`
- API Index: `http://localhost:5000/api`

### Step 4: Run the Mobile Application
```bash
# Start Expo development server (scan QR via Expo Go or run on Android/iOS/Web)
npm --prefix mobile run start

# Launch on Web browser
npm --prefix mobile run web
```

### Step 5: Full Project Type-Check
```bash
# Run strict TypeScript validation across shared-types, backend, and mobile
npm run type-check
```

---

## 3. Seeded Demo Accounts

| Role | Name | Identifier / Email | Phone |
|---|---|---|---|
| **DoSJE Official** | Dr. Rajesh Sharma | `official@dosje.gov.in` | `+919876543210` |
| **Field Inspector** | Priya Verma | `inspector@pmu.gov.in` | `+919876543211` |
| **Inspection Lead** | Vikramjit Singh | `vikram.singh@pmu.gov.in` | `+919876543214` |
| **NGO In-charge** | Amit Sundaram | `incharge@welfaretrust.org` | `+919876543212` |
| **Beneficiary** | Ramesh Kumar | `ramesh.kumar@beneficiary.in` | `+919876543213` |

---

## 4. Design System Tokens
- **Primary:** `#123B5D` (Deep Government Navy)
- **Secondary:** `#1E6F8C` (Teal Slate)
- **Success:** `#2E7D32` (Verified Green)
- **Warning:** `#ED8B00` (Amber Alert)
- **Danger:** `#C62828` (High Risk Crimson)
- **Background:** `#F5F7FA` (Slate Off-White)
