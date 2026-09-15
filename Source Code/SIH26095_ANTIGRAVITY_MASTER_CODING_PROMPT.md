# SIH26095 NIRIKSHAN AI — ANTIGRAVITY MASTER CODING PROMPT

## IMPORTANT

You are the lead full-stack/mobile engineer responsible for implementing our Smart India Hackathon 2026 project **SIH26095**.

We are building a **mobile-first centralized monitoring and surprise-inspection application for DoSJE**.

The project requirements and implementation plan are already present in this workspace. Read them before coding.

The core concept is:

> **MONITOR → DETECT → VERIFY → ACT**

The app must help authorized DoSJE officials monitor scheme-supported NGOs/institutes/projects, detect suspicious patterns, perform surprise verification, assign inspectors, capture geo-verified evidence, and review explainable AI-assisted alerts.

The solution must be a **working, polished prototype**, not a collection of static screens.

---

# 1. PRIMARY REQUIREMENT

Build a **mobile application** using:

- React Native
- Expo
- TypeScript
- Expo Router
- Zustand

Build a supporting backend using:

- Node.js
- Express
- TypeScript
- Prisma
- SQLite for local development
- PostgreSQL/Supabase-compatible schema for production

The application must be designed so real CCTV, AI, video calling, and government APIs can replace mock services later.

---

# 2. READ THESE FILES FIRST

Before changing code:

1. Read `SIH26095_Antigravity_Build_Spec.md`
2. Read the implementation plan supplied in the workspace
3. Inspect all existing source files
4. Inspect package.json files
5. Inspect configuration files

Do not blindly overwrite existing work.

If the workspace is empty, scaffold the project.

---

# 3. DO NOT ASK FOR UNNECESSARY CLARIFICATION

Make sensible engineering decisions from the specification.

If a real external integration is unavailable:

- implement a service interface
- implement a realistic mock provider
- clearly mark the UI as `DEMO MODE`
- keep the architecture ready for real integration

Do NOT stop development simply because government APIs, CCTV credentials, or production AI models are unavailable.

---

# 4. APPLICATION ROLES

Implement role-based authentication/navigation for:

## DoSJE Official

Features:
- Dashboard
- Projects
- Live CCTV monitor
- Alerts
- Inspections
- Risk analytics
- Attendance analytics
- Project timeline
- Evidence review
- Surprise inspection assignment
- Surprise video verification
- Audit trail

## PMU / Inspector

Features:
- Assigned inspections
- Project details
- Map
- GPS verification
- 100m geofence
- Inspection checklist
- Photo/video capture
- Voice note
- Geo-tagged evidence
- Evidence integrity/hash
- Inspection report
- Offline queue
- Sync

## NGO / Institute

Features:
- Dashboard
- Attendance submission
- Verification requests
- CCTV status
- Notifications
- Project information

## Beneficiary

Features:
- Video verification
- Feedback
- Basic service feedback

---

# 5. VISUAL DESIGN

The app must look like a professional government enterprise application.

Do NOT make it look like:
- a student CRUD project
- a generic admin template
- a social-media app

Use:
- clean cards
- professional typography
- status badges
- risk indicators
- charts
- map
- camera cards
- timeline
- clear icons
- subtle animations
- excellent spacing
- accessible touch targets

Use these design tokens consistently:

```ts
primary = "#123B5D"
secondary = "#1E6F8C"
success = "#2E7D32"
warning = "#ED8B00"
danger = "#C62828"
background = "#F5F7FA"
surface = "#FFFFFF"
border = "#E2E8F0"
```

Never rely on color alone for status.

---

# 6. CORE USER JOURNEY

The main judge journey must work end-to-end:

```text
Official Login
      ↓
Official Dashboard
      ↓
High-Risk Project
      ↓
Attendance/CCTV Anomaly
      ↓
AI Explanation
      ↓
Assign Surprise Inspection
      ↓
Random Eligible Inspector
      ↓
Inspector Notification
      ↓
Inspector Opens Assignment
      ↓
GPS Verification
      ↓
100m Geofence
      ↓
Inspection Checklist
      ↓
Capture Photo/Video
      ↓
GPS + Timestamp + Hash
      ↓
Submit Inspection
      ↓
Official Dashboard Updates
      ↓
Audit Trail
```

A second journey:

```text
Official
 ↓
Start Surprise Verification
 ↓
Random In-charge / Staff / Beneficiary
 ↓
Video Verification UI
 ↓
Answered / Missed
 ↓
Feedback
 ↓
Risk/verification status update
```

---

# 7. DASHBOARD

Create an impressive official dashboard.

Show:

- Total Projects
- Active Projects
- Under Inspection
- Open Alerts
- High-Risk Projects
- CCTV Online
- CCTV Offline
- Pending Verification

Risk distribution:

- Low
- Medium
- High
- Critical

Live alert feed.

Examples:

```text
HIGH
Attendance discrepancy
Demo Welfare Institute
Reported: 92
Observed: 61
```

```text
MEDIUM
CCTV unavailable
Demo Rehabilitation Centre
Camera: Dormitory-02
```

```text
HIGH
Possible duplicate evidence
Demo Institute
Similarity: 94%
```

Every alert must explain WHY it was generated.

---

# 8. PROJECT SCREEN

Project list must support:

- search
- state filter
- district filter
- risk filter
- status filter

Project details should contain:

### Overview
- project
- NGO
- scheme
- location
- capacity
- beneficiaries
- staff
- status

### CCTV
- cameras
- status
- heartbeat
- people estimate

### Attendance
- reported
- observed
- mismatch
- trend

### Inspections
- history
- status
- inspector
- location verification

### Evidence
- photos
- videos
- hashes
- GPS

### Alerts
- anomaly history
- severity
- action

### Timeline
Chronological activity.

---

# 9. CCTV MODULE

Create a Live Monitor screen.

Every camera card should display:

- Camera name
- Location
- LIVE/OFFLINE
- Last heartbeat
- Stream quality
- Approximate people count
- Last activity

Use a `CCTVProvider` abstraction.

Create:

```ts
interface CCTVProvider {
  getStreamUrl(cameraId: string): Promise<string>;
  getHealth(cameraId: string): Promise<{
    status: string;
    lastHeartbeat: Date;
    latencyMs: number;
  }>;
  getPeopleCountEstimate(cameraId: string): Promise<{
    count: number;
    confidence: number;
  }>;
}
```

Implement:

```text
MockCCTVProvider
```

and leave a clean adapter for:

```text
RTSP/HLS/WebRTC
```

Do NOT claim that the prototype is connected to actual government cameras.

Use:

`DEMO CCTV`

badges for mock feeds.

---

# 10. ATTENDANCE + AI

Implement a modular anomaly engine.

### Rule-based anomalies

Detect:

1. Attendance > capacity
2. Reported attendance significantly different from CCTV estimate
3. Identical attendance repeatedly submitted
4. Sudden attendance drop
5. CCTV offline during expected hours
6. Previous unresolved anomaly

Risk score must be transparent.

Example:

```text
Risk Score: 82 / 100
HIGH
```

Breakdown:

```text
+25 Attendance mismatch
+20 CCTV unavailable
+15 Repeated attendance pattern
+22 Previous unresolved alert
```

Do not create a mysterious AI score.

If there is insufficient historical data:

```text
Analysis mode: RULE-BASED
```

If sufficient historical data exists:

```text
Analysis mode: HISTORICAL ANOMALY MODEL
```

AI is assistive only.

Never automatically:
- declare fraud
- suspend an NGO
- impose penalties

The official must review the evidence.

---

# 11. SURPRISE INSPECTION ASSIGNMENT

Implement:

```text
Priority
+
Inspector eligibility
+
Controlled randomness
```

Do not assign every inspection purely randomly.

High-risk projects should have higher inspection priority.

The selected inspector must:

- be active
- be authorized
- not have a conflicting assignment

Show:

```text
Surprise Inspection
Project: Demo Welfare Institute
Risk: HIGH
Reason: Attendance discrepancy
Inspector: Randomly assigned
```

Notify the inspector.

---

# 12. INSPECTOR APP

Inspector Home:

- today's assignments
- pending
- completed
- overdue
- offline sync count

Assignment screen:

- project
- risk
- reason
- deadline
- inspection type
- navigation

GPS screen:

```text
Registered site
Current location
Distance
Geofence radius: 100m
```

If inside:

```text
✓ LOCATION VERIFIED
43m from registered site
```

If outside:

```text
⚠ OUTSIDE GEOFENCE
340m from registered site
```

Do not permit normal report submission while outside the geofence unless an explicit authorized override exists.

---

# 13. REAL MOBILE GPS

Use Expo Location.

Request permission properly.

Never fabricate actual GPS data.

For judge demonstration, provide:

```text
DEMO LOCATION
```

toggle so the demo can simulate entering the geofence.

Clearly distinguish:

```text
LIVE LOCATION
```

from:

```text
DEMO LOCATION
```

---

# 14. EVIDENCE CAPTURE

Use the actual mobile camera where possible.

Support:

- photo
- video
- voice note
- document

For every evidence item store:

```text
inspectionId
projectId
latitude
longitude
capturedAt
inspectorId
file type
SHA-256 hash
```

Display:

```text
Captured: 11:42 AM
GPS: VERIFIED
Integrity: VERIFIED
SHA-256: ...
```

Use `expo-crypto` for hashing.

---

# 15. DUPLICATE EVIDENCE

Implement:

```text
SHA-256 checksum
+
perceptual/similarity abstraction
```

If an evidence item matches a historical item:

```text
POSSIBLE DUPLICATE EVIDENCE
Similarity: 94%
```

Show a comparison UI.

Never call it confirmed fraud automatically.

Allow official actions:

- Review
- False Positive
- Assign Inspection
- Escalate

---

# 16. RANDOM VIDEO VERIFICATION

Create an attractive video verification screen.

Official clicks:

```text
START SURPRISE VERIFICATION
```

System selects:

- Project In-charge
- Staff
- Beneficiary

using controlled pseudo-random selection.

Show:

- participant
- call timer
- camera
- microphone
- end call
- verification checklist

Outcomes:

```text
VERIFIED INTERACTION
MISSED VERIFICATION
UNREACHABLE
```

Missed verification can increase review priority but must not automatically mean fraud.

Add feedback:

```text
Positive
Neutral
Negative
```

---

# 17. OFFLINE-FIRST INSPECTION

Inspectors may lose connectivity.

Cache locally:

- assignments
- checklists
- drafts
- GPS
- captured evidence metadata
- media

Show:

```text
OFFLINE
3 PENDING SYNC
```

After reconnect:

```text
Sync Now
```

Then:

```text
3/3 synced successfully
```

Use AsyncStorage or SQLite appropriately.

Do not lose evidence because of network failure.

---

# 18. MAP

Implement project map.

Show:

- project markers
- risk levels
- inspector location
- inspection locations

Tapping a marker shows:

```text
Project
Risk
Last inspection
Open alerts
```

Inspector map should show the registered project location and current device location.

---

# 19. ALERT CENTER

Filters:

- All
- Critical
- High
- Medium
- Low
- Attendance
- CCTV
- GPS
- Evidence
- Inspection

Alert detail must show:

```text
What happened?
Why was it flagged?
Evidence
Risk score
Recommended action
History
```

Actions:

```text
Assign Inspection
Escalate
False Positive
Dismiss
```

---

# 20. AUDIT TRAIL

Log important actions:

- CCTV viewed
- alert opened
- inspection assigned
- GPS verified
- evidence captured
- evidence submitted
- anomaly generated
- anomaly reviewed
- VC started
- VC missed
- inspection escalated

Show:

```text
WHO
WHAT
WHEN
WHERE
RESULT
```

---

# 21. DATABASE

Use Prisma.

Required models:

```text
User
Project
Attendance
Camera
Inspection
Evidence
Anomaly
VideoVerification
Notification
AuditLog
```

Use the existing specification's relationships and enums.

Seed at least:

- 12 synthetic projects
- 4 demo users
- 15 alerts
- 8 cameras

Include:
- low risk
- medium risk
- high risk
- critical
- attendance mismatch
- CCTV offline
- duplicate evidence
- GPS mismatch

All data must be clearly synthetic/demo data.

---

# 22. BACKEND API

Implement at minimum:

```text
POST /api/auth/login

GET /api/dashboard/summary
GET /api/dashboard/alerts
GET /api/dashboard/risk-distribution

GET /api/projects
GET /api/projects/:id

GET /api/projects/:id/cameras
GET /api/projects/:id/attendance

GET /api/cameras/:id/stream
GET /api/cameras/:id/health

POST /api/inspections/assign-random
GET /api/inspections/my-assignments
POST /api/inspections/:id/start
POST /api/inspections/:id/location
POST /api/inspections/:id/evidence
POST /api/inspections/:id/submit

GET /api/anomalies
GET /api/anomalies/:id
POST /api/anomalies/:id/review

POST /api/video-verification/request
POST /api/video-verification/:id/respond

GET /api/audit-logs
```

Use:
- Zod validation
- authentication middleware
- role guard
- structured errors
- proper HTTP status codes

---

# 23. SERVICE ABSTRACTIONS

Keep these services independent:

```text
AnomalyEngine
RuleBasedRiskEngine
InspectionAssignmentEngine
CCTVProvider
MockCCTVProvider
LocationVerifier
EvidenceIntegrityService
DuplicateDetector
VideoCallProvider
NotificationService
AuditService
OfflineSyncService
```

Do not put all logic inside React components.

---

# 24. PROJECT STRUCTURE

Use:

```text
SIH/
├── mobile/
├── backend/
├── packages/
│   └── shared-types/
├── docs/
├── SIH26095_Antigravity_Build_Spec.md
└── README.md
```

Mobile:

```text
mobile/
├── app/
├── src/
│   ├── components/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── constants/
│   └── utils/
├── assets/
└── package.json
```

Backend:

```text
backend/
├── prisma/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── utils/
└── package.json
```

---

# 25. DEMO MODE

Create a prominent but professional:

```text
DEMO MODE
```

indicator.

Provide a demo scenario launcher.

## Scenario 1 — Attendance discrepancy

Set:

```text
Reported attendance = 92
CCTV observed = 61
```

Generate:

```text
HIGH ATTENDANCE DISCREPANCY
```

Then allow:

```text
Assign Surprise Inspection
```

## Scenario 2 — CCTV failure

Camera heartbeat stops.

Generate:

```text
CCTV OFFLINE DURING EXPECTED HOURS
```

## Scenario 3 — Duplicate evidence

Generate:

```text
POSSIBLE DUPLICATE EVIDENCE
```

## Scenario 4 — Surprise beneficiary VC

Official starts verification.

System randomly chooses beneficiary.

Show call UI.

---

# 26. JUDGE DEMO MUST BE SMOOTH

The judge must be able to understand the complete value in approximately 5–7 minutes.

Demo:

```text
LOGIN
↓
DASHBOARD
↓
HIGH-RISK PROJECT
↓
ATTENDANCE MISMATCH
↓
CCTV
↓
AI EXPLANATION
↓
SURPRISE INSPECTION
↓
RANDOM INSPECTOR
↓
INSPECTOR MOBILE APP
↓
GPS
↓
GEOFENCE
↓
PHOTO/VIDEO EVIDENCE
↓
HASH + GPS + TIMESTAMP
↓
SUBMIT
↓
OFFICIAL DASHBOARD UPDATE
↓
RANDOM VC
↓
AUDIT TRAIL
```

---

# 27. ERROR HANDLING

Every screen needs:

- loading state
- empty state
- error state
- retry
- permission-denied state
- offline state where applicable

Examples:

```text
Location permission denied
Please enable location access to verify inspection site.
```

```text
CCTV unavailable
Last heartbeat: 2 minutes ago
```

```text
No pending inspections
You're all caught up.
```

---

# 28. SECURITY

Never hardcode:

- API secrets
- database passwords
- JWT secrets
- CCTV credentials

Create:

```text
.env.example
```

Use:

```text
DATABASE_URL=
JWT_SECRET=
API_BASE_URL=
```

Do not commit `.env`.

---

# 29. IMPLEMENTATION ORDER

Implement in this exact order.

## PHASE 1
Inspect workspace and existing code.

## PHASE 2
Scaffold mobile + backend + Prisma.

## PHASE 3
Authentication + role navigation.

## PHASE 4
Official dashboard + project screens.

## PHASE 5
Inspector workflow + GPS + geofence.

## PHASE 6
Evidence capture + hashing.

## PHASE 7
CCTV + camera health.

## PHASE 8
Attendance analytics + anomaly engine.

## PHASE 9
Surprise inspection assignment.

## PHASE 10
Video verification.

## PHASE 11
Offline queue + sync.

## PHASE 12
Notifications + audit trail.

## PHASE 13
Demo scenarios.

## PHASE 14
Polish + testing.

After each phase:
- run type check
- run lint
- run tests where available
- fix errors
- verify the app still starts

---

# 30. CRITICAL ANTIGRAVITY RULE

Do not generate the entire project in one uncontrolled operation.

For each phase:

1. Explain what you are going to change.
2. Implement the phase.
3. Run checks.
4. Fix errors.
5. Show the result.
6. Continue to the next phase only after the current phase is stable.

Because this is a large SIH project, preserve working functionality while adding features.

---

# 31. FIRST COMMAND TO ANTIGRAVITY

Start with exactly this instruction:

> Read `SIH26095_Antigravity_Build_Spec.md` and the current implementation plan completely.
>
> Inspect the entire workspace.
>
> We are implementing SIH26095 as a mobile-first React Native + Expo + TypeScript application with a Node.js/Express/Prisma backend.
>
> Do not modify application files yet.
>
> First compare the current workspace against the specification and report:
>
> 1. What already exists
> 2. What is missing
> 3. Any architecture problems
> 4. Required dependencies
> 5. Recommended implementation order
> 6. Potential technical risks
>
> Then wait for my approval.

---

# 32. AFTER APPROVAL

Use this:

> Implement the next approved phase completely.
>
> Before coding, inspect existing files and preserve working functionality.
>
> After coding:
> - run TypeScript checks
> - run lint
> - run available tests
> - fix errors
> - verify the app launches
> - summarize files changed
> - summarize what is now functional
>
> Do not implement future phases until the current phase is stable.

---

# 33. FINAL ACCEPTANCE CRITERIA

The project is complete only when:

- Official can log in
- Inspector can log in
- NGO can log in
- Dashboard works
- Projects work
- Risk scoring works
- Alerts work
- CCTV demo works
- Camera health works
- Attendance mismatch works
- Surprise assignment works
- Inspector workflow works
- Real GPS works on supported device
- Geofence works
- Evidence capture works
- Evidence hash works
- Duplicate detection abstraction works
- Video verification UI works
- Offline queue works
- Sync works
- Audit trail works
- Demo scenarios work
- App does not crash during judge flow
- README explains setup and demo

---

# 34. FINAL PRODUCT MESSAGE

The product must communicate this clearly:

> **NIRIKSHAN AI is not just a monitoring app. It is an evidence-driven verification platform.**
>
> It connects:
>
> **Real-time Monitoring**
> +
> **AI-assisted Detection**
> +
> **Surprise Inspection**
> +
> **GPS-verified Field Evidence**
> +
> **CCTV Analytics**
> +
> **Video Verification**
> +
> **Offline Field Operations**
>
> into one centralized DoSJE workflow.

## Final tagline

**MONITOR. VERIFY. ACT.**

Build the product around this principle.
