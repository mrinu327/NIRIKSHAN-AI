# SIH26095 — DoSJE Centralized Monitoring & Surprise Inspection Mobile App
## Antigravity Master Build Specification

> **Goal:** Build a polished, working mobile-first prototype for Smart India Hackathon 2026 Problem Statement **SIH26095**.
>
> The application should help DoSJE monitor scheme-supported NGOs/institutes/projects through real-time monitoring, CCTV integration, surprise inspections, random inspection assignment, geo-tagged evidence, video verification, and AI-assisted anomaly/attendance analytics.

---

# 1. PRODUCT VISION

Build a single centralized mobile application called:

**Project name:** `NIRIKSHAN AI`

**Tagline:** `Monitor. Verify. Act.`

The central idea is:

> Do not rely only on submitted reports. Combine live monitoring, surprise verification, geo-tagged evidence, CCTV/vision analytics, and AI-assisted risk detection so officials can verify what is actually happening on the ground.

The application must feel like a **real government field-monitoring product**, not a generic CRUD app.

---

# 2. IMPORTANT PRODUCT PRINCIPLES

1. **Verification over reporting**
2. **Surprise inspection over predictable inspection**
3. **Evidence over claims**
4. **AI assists officials; AI never makes the final enforcement decision**
5. **Every important field action should be traceable**
6. **The UI must clearly distinguish LIVE data from DEMO/MOCK data**
7. **Do not invent real government integrations or real CCTV credentials**
8. **Build a convincing prototype using mock data and integration interfaces where real infrastructure is unavailable**

---

# 3. USER ROLES

Implement role-based access.

## A. DoSJE Official

Can:
- View overall monitoring dashboard
- View all registered projects/institutes/NGOs
- View project details
- View CCTV feeds
- View camera health
- View alerts
- View attendance analytics
- View anomaly explanations
- Trigger/request surprise verification
- View inspection reports
- Review evidence
- Review beneficiary verification outcomes
- Assign/escalate inspections
- View district/state analytics
- View historical project timeline

## B. PMU / Inspection Team

Can:
- Receive inspection assignments
- View assigned project
- Navigate to project
- Verify GPS/geofence
- Start inspection
- Fill checklist
- Capture geo-tagged photos/videos
- Add notes and voice notes
- View project details
- Perform random video verification
- Submit inspection report
- Work in offline mode and sync later

## C. NGO / Institute / Project Incharge

Can:
- View project profile
- Submit attendance
- View inspection status
- Respond to video verification request
- View permitted CCTV status
- Upload required documents/evidence
- Receive inspection notifications

## D. Beneficiary

Can:
- Participate in authorized verification call
- Provide feedback
- Submit basic service feedback
- View only their permitted information

---

# 4. MAIN NAVIGATION

Use a bottom tab/navigation structure appropriate for each role.

### Official navigation

- Dashboard
- Projects
- Live Monitor
- Alerts
- Inspections
- Profile

### Inspector navigation

- Home
- Assignments
- Map
- Capture
- Reports
- Profile

### NGO navigation

- Home
- Attendance
- Verification
- CCTV
- Reports
- Profile

Use a clean, professional government-tech visual style.

---

# 5. AUTHENTICATION

Create a polished login screen.

Fields:
- Mobile/email
- Password

Options:
- Login
- Demo login
- Forgot password

For prototype/demo mode, provide role selection:

- DoSJE Official
- Inspector / PMU
- NGO / Institute
- Beneficiary

Use seeded demo accounts.

Do not expose passwords in production-looking UI.

After login, route the user to the appropriate dashboard.

---

# 6. OFFICIAL DASHBOARD

The dashboard is the most important screen for judges.

Show:

### KPI cards

- Total Projects
- Active Projects
- Projects Under Inspection
- Open Alerts
- High Risk Projects
- CCTV Cameras Online
- CCTV Cameras Offline
- Pending Verification

### Risk distribution

Show:

- Low
- Medium
- High
- Critical

Use a clean chart.

### Live alert feed

Examples:

- `Attendance mismatch detected`
- `CCTV unavailable during expected operating hours`
- `Repeated evidence detected`
- `Inspector GPS mismatch`
- `Inspection overdue`
- `Video verification missed`

Each alert should have:
- Severity
- Project
- Timestamp
- Reason
- Recommended action

### Map

Display project locations.

Use markers:
- Green = normal
- Yellow = medium risk
- Orange = high risk
- Red = critical

Tapping a marker opens project summary.

---

# 7. PROJECT DETAILS SCREEN

For every NGO/institute/project display:

- Project name
- Project ID
- Scheme
- State
- District
- Address
- GPS coordinates
- Project in-charge
- Staff count
- Beneficiary count
- Reported attendance
- AI/rule risk score
- CCTV status
- Last inspection
- Next eligible inspection
- Open alerts
- Verification history

Tabs:

### Overview
Basic project information.

### CCTV
Camera list and feed.

### Attendance
Reported vs observed analytics.

### Inspections
Inspection history.

### Evidence
Photos/videos/documents.

### Alerts
Project-specific alerts.

### Timeline
Chronological history of:
- attendance submissions
- inspections
- CCTV events
- alerts
- verification calls
- officer actions

---

# 8. CCTV MODULE

Create a dedicated Live Monitor screen.

The source workflow specifies:

`CCTV / Mock Video Stream`
→ `Video Stream Service`
→ `Authorized Official`

Support both:

### DEMO MODE
Use mock/sample video streams or generated camera cards.

### REAL INTEGRATION INTERFACE
Create a clean service abstraction so an actual RTSP/HLS/WebRTC provider can later be connected.

Do NOT hardcode fake claims that the app is connected to government CCTV.

Each camera card should show:

- Camera name
- Location
- LIVE/OFFLINE
- Last heartbeat
- Stream quality
- People count if available
- Last detected activity

Example:

`Entrance Camera`
`LIVE`
`People detected: 8`

### Camera health

Detect/display:
- Online
- Offline
- No signal
- Delayed
- Unknown

Create a camera-health event that can generate an alert.

---

# 9. CCTV AI / COMPUTER VISION

Implement a prototype analytics layer.

Workflow:

`Video / Mock Stream`
→ `Periodic frame`
→ `People counting`
→ `Compare with submitted attendance`
→ `Mismatch calculation`
→ `Explainable alert`
→ `Official review`

Example:

Reported attendance: 42

Observed approximate people count: 25

Difference: 17

Mismatch: 40.5%

Generate:

`HIGH ATTENDANCE DISCREPANCY`

Important:
- Clearly label this as approximate computer-vision estimation.
- Do not claim identity recognition.
- Do not automatically accuse an NGO of fraud.
- The final decision belongs to a human official.

If real CV cannot run inside the mobile prototype, create a deterministic mock analytics service with clearly labelled demo data and an interface that can later call a real CV model.

---

# 10. ATTENDANCE ANALYTICS

Create an attendance screen.

Show:

- Reported attendance
- Observed approximate count
- Capacity
- Attendance percentage
- Historical trend
- Mismatch percentage

Detect examples:

### Rule 1
Attendance > registered capacity

### Rule 2
Same attendance repeatedly submitted

### Rule 3
Large mismatch between submitted attendance and CCTV estimate

### Rule 4
Sudden unexplained attendance spike/drop

Generate an explainable alert.

Example:

`Why was this flagged?`

- Reported attendance: 95
- Registered capacity: 80
- Report exceeds capacity by 18.75%

OR:

- Reported: 92%
- CCTV estimate: 61%
- Difference: 31 percentage points

---

# 11. AI ANOMALY ENGINE

Create a modular `AnomalyEngine`.

Input:

- Attendance data
- CCTV health
- Approximate people count
- Inspection GPS
- Inspection timing
- Evidence metadata
- Historical records
- Report submission patterns

Output:

```text
{
  riskScore,
  severity,
  anomalyType,
  explanation,
  evidence,
  recommendedAction
}
```

### Anomaly types

- ATTENDANCE_CAPACITY_EXCEEDED
- ATTENDANCE_CCTV_MISMATCH
- REPEATED_ATTENDANCE_PATTERN
- CCTV_OFFLINE_DURING_EXPECTED_HOURS
- INSPECTOR_GPS_MISMATCH
- DUPLICATE_EVIDENCE
- MISSED_VIDEO_VERIFICATION
- OVERDUE_INSPECTION
- SUDDEN_BEHAVIOR_CHANGE

### Risk score

Generate a transparent score from 0–100.

Example:

`82 / 100 — HIGH`

Show why:

- +25 attendance mismatch
- +20 CCTV unavailable
- +15 repeated attendance pattern
- +22 previous unresolved alert

Never show only a mysterious AI number.

---

# 12. RULE-BASED FALLBACK

The workflow specifically allows a rule-based score when insufficient historical data exists.

Implement:

```text
IF historicalData < threshold
    use RuleBasedRiskEngine
ELSE
    use AnomalyDetectionEngine
```

This makes the prototype robust.

The UI should say:

`Analysis mode: Rule-based`
or
`Analysis mode: Historical anomaly model`

Do not pretend a machine-learning model exists if it is not actually implemented.

---

# 13. SURPRISE INSPECTION ENGINE

Create a dedicated inspection assignment engine.

Workflow:

`Select institute/project`
→ `Check inspection priority`
→ `Randomly assign eligible inspector`
→ `Notify inspector`
→ choose:
   - Physical inspection
   - Random video verification
→ verification
→ update dashboard

### Eligibility checks

Inspector must:
- be active
- be authorized
- not already have conflicting assignment
- belong to allowed region/area where applicable

### Randomness

Use secure/random selection among eligible inspectors.

But do NOT use purely random selection for every case.

Use:

`Priority + eligibility + controlled randomness`

Example:

High-risk projects:
- higher chance of surprise verification

Normal projects:
- random periodic selection

This preserves the surprise nature while making the system useful.

---

# 14. INSPECTION ASSIGNMENT SCREEN

Show:

- Project
- Risk score
- Reason for inspection
- Assigned inspector
- Assignment time
- Deadline
- Inspection type

Buttons:

`Assign Random Inspector`

`Start Surprise VC`

`View Project`

`Escalate`

---

# 15. INSPECTOR MOBILE WORKFLOW

When inspector receives an assignment:

### Screen 1
Assignment notification

### Screen 2
Project details

### Screen 3
Navigate to location

### Screen 4
`Verify My Location`

Use device location.

### Screen 5
Geofence check

If within configured radius:

`LOCATION VERIFIED`

If outside:

`LOCATION MISMATCH`

Do not allow silent bypass.

### Screen 6
Start inspection

### Screen 7
Checklist

Example:

- Project operational
- Staff present
- Beneficiaries present
- Required facilities available
- Records maintained
- CCTV operational
- Services being delivered
- Safety/compliance checks

### Screen 8
Capture evidence

- Photo
- Video
- Document
- Voice note
- Text note

### Screen 9
Review

### Screen 10
Submit report

---

# 16. GEO-TAGGED EVIDENCE

Every field evidence item should contain:

- latitude
- longitude
- timestamp
- inspector ID
- project ID
- inspection ID
- media type
- optional device metadata

Display:

`Captured at 11:42 AM`

`GPS: 11.xxxxxx, 76.xxxxxx`

`Location: VERIFIED`

Important:
- Request actual location permission in mobile.
- If permission is denied, show a clear state.
- Do not fabricate GPS coordinates and call them real.

For demo mode, provide controlled mock GPS data and label it `DEMO LOCATION`.

---

# 17. EVIDENCE INTEGRITY

Create a simple evidence metadata/hash mechanism.

When an evidence file is submitted:
- generate a file hash
- store timestamp
- store GPS metadata
- store inspection ID

Show:

`Evidence integrity: VERIFIED`

This demonstrates anti-tampering architecture.

---

# 18. DUPLICATE EVIDENCE DETECTION

Create a prototype duplicate detector.

Compare:
- file hash
- perceptual image hash if available
- metadata
- upload history

If same/similar evidence is reused:

`POSSIBLE DUPLICATE EVIDENCE`

Show:
- current evidence
- previous evidence
- dates
- projects
- similarity score

Do not call it confirmed fraud.

---

# 19. RANDOM VIDEO CONFERENCING

Create a verification call feature.

Official can choose:

`Project Incharge`
`Staff`
`Beneficiary`

Or:

`Random Participant`

Flow:

`Select project`
→ `Randomly select eligible person`
→ `Send VC request`
→ `Call`
→ if answered:
    `Verified interaction`
→ if missed:
    `Log missed verification`
    `Escalate / schedule follow-up`

For prototype:
- build an in-app video-call style UI
- use WebRTC/Jitsi-compatible architecture if practical
- otherwise provide a mock VC mode with a clearly labelled demo call

Never imply an actual government person is connected.

---

# 20. BENEFICIARY FEEDBACK

After verification call, official can record:

- Service received?
- Staff available?
- Facilities available?
- Frequency of service
- Satisfaction
- Free-text feedback

Add simple sentiment analysis:

`Positive`
`Neutral`
`Negative`

Display this as an assistive signal, not a final judgement.

---

# 21. OFFLINE MODE

This is important for field inspectors.

The inspector app should continue to work when network connectivity is poor.

Offline-capable:

- Assignment details
- Inspection checklist
- GPS capture
- Photos/videos
- Notes
- Draft report

When connectivity returns:

`Pending sync: 4 items`

Button:

`Sync Now`

Status:

`Synced successfully`

Implement a local queue abstraction.

---

# 22. NOTIFICATIONS

Create notification events for:

- New inspection assignment
- High-risk alert
- CCTV offline
- Video verification request
- Inspection overdue
- Report submitted
- Evidence rejected
- Follow-up required

Use Firebase Cloud Messaging architecture if available.

For prototype, use local/mock notifications where required.

---

# 23. MAP MODULE

Use a map library suitable for React Native.

Map should show:

- all projects
- risk status
- inspector location
- inspection locations
- alerts

Project marker tap:

`Project`
`Risk: HIGH`
`Last inspection: 3 days ago`
`Open alerts: 2`

Inspector can use:

`Navigate`

and

`Verify location`

---

# 24. ALERT CENTER

Create an attractive alert center.

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

Each alert:

```text
HIGH
Attendance discrepancy

ABC Institute
Reported: 92%
Observed: 61%

2 hours ago
```

Actions:

`View Evidence`

`Assign Inspection`

`Dismiss as False Positive`

`Escalate`

---

# 25. HUMAN-IN-THE-LOOP

This is mandatory in the architecture.

AI must never directly:
- declare fraud
- punish an institute
- suspend a project
- make final compliance decisions

Instead:

`AI detects`
→ `AI explains`
→ `Official reviews evidence`
→ `Official confirms/rejects`
→ `System records decision`

This should be visible in the UI.

---

# 26. AUDIT TRAIL

Every important action should create an audit event.

Examples:

- Official viewed CCTV
- Inspector assigned
- Inspection started
- GPS verified
- Evidence uploaded
- Alert generated
- Alert reviewed
- Alert marked false positive
- Inspection escalated
- Report submitted

Audit screen:

`Who`
`What`
`When`
`Where`
`Result`

---

# 27. DESIGN SYSTEM

Visual style:

- professional
- modern
- trustworthy
- minimal
- government enterprise feel
- not childish
- not overloaded

Use:
- cards
- badges
- status chips
- clean charts
- maps
- bottom navigation
- readable typography
- accessible contrast
- clear error states
- loading skeletons

Use a consistent design token system.

Recommended visual hierarchy:

Primary:
`#123B5D`

Secondary:
`#1E6F8C`

Success:
`#2E7D32`

Warning:
`#ED8B00`

Danger:
`#C62828`

Background:
`#F5F7FA`

Use colors consistently and do not rely on color alone to communicate status.

---

# 28. RECOMMENDED TECH STACK

Use:

### Mobile
- React Native
- Expo
- TypeScript
- Expo Router

### State
- Zustand or Redux Toolkit

### Backend
- Node.js
- Express
- TypeScript

### Database
Prefer PostgreSQL/Supabase for a prototype.

### Authentication
Supabase Auth or Firebase Auth.

### Storage
Supabase Storage or Firebase Storage.

### Maps/GPS
- Expo Location
- React Native Maps / MapLibre-compatible solution

### Video
- WebRTC/Jitsi-compatible architecture
- Mock mode for demo if real integration is unavailable

### Charts
- React Native SVG/chart library

### AI
Create a separate service layer:
- rule-based engine first
- optional Python/FastAPI ML service later
- CV service interface for YOLO/OpenCV integration

Do not make the entire application depend on an unavailable external AI API.

---

# 29. DATABASE MODEL

Create these entities:

### users
- id
- name
- role
- phone
- email
- state
- district
- active

### projects
- id
- name
- scheme
- type
- organization
- address
- latitude
- longitude
- state
- district
- capacity
- beneficiary_count
- staff_count
- risk_score
- risk_level
- status

### attendance
- id
- project_id
- date
- reported_count
- observed_count
- source
- mismatch_percentage
- created_at

### cameras
- id
- project_id
- name
- location
- stream_url
- status
- last_heartbeat

### inspections
- id
- project_id
- inspector_id
- type
- assigned_at
- started_at
- completed_at
- status
- latitude
- longitude
- location_verified
- report

### evidence
- id
- inspection_id
- project_id
- type
- file_url
- latitude
- longitude
- captured_at
- hash
- integrity_status

### anomalies
- id
- project_id
- type
- severity
- risk_score
- explanation
- evidence_ids
- status
- created_at
- reviewed_by

### video_verifications
- id
- project_id
- participant_type
- participant_id
- requested_at
- answered_at
- status
- result

### notifications
- id
- user_id
- type
- title
- message
- read
- created_at

### audit_logs
- id
- actor_id
- action
- entity_type
- entity_id
- metadata
- timestamp

---

# 30. API DESIGN

Create APIs similar to:

```text
POST   /auth/login

GET    /projects
GET    /projects/:id

GET    /projects/:id/cameras
GET    /cameras/:id/stream
GET    /cameras/:id/health

GET    /dashboard/summary
GET    /dashboard/alerts
GET    /dashboard/risk-distribution

POST   /inspections/assign-random
GET    /inspections/my-assignments
POST   /inspections/:id/start
POST   /inspections/:id/location
POST   /inspections/:id/evidence
POST   /inspections/:id/submit

GET    /attendance/:projectId
POST   /attendance

POST   /anomaly/analyze
GET    /anomalies
POST   /anomalies/:id/review

POST   /video-verification/request
POST   /video-verification/:id/respond

GET    /audit-logs
```

Add proper validation and error handling.

---

# 31. DEMO DATA

Seed at least:

### 12 projects

Spread across multiple:
- states
- districts
- project types

Use realistic but clearly synthetic names.

Examples:

`Demo Rehabilitation Centre - Coimbatore`

`Demo Welfare Institute - Chennai`

Do not use real government credentials or claim real affiliation.

Include:
- normal projects
- medium-risk projects
- high-risk projects
- CCTV-offline project
- attendance mismatch project
- duplicate evidence project
- GPS mismatch inspection

This lets judges immediately see the system responding to anomalies.

---

# 32. DEMO SCENARIO FOR JUDGES

Build a one-click `Demo Scenario` button.

When pressed:

### Scenario

Project:
`Demo Welfare Institute`

Reported attendance:
`92`

CCTV observed:
`61`

System calculates mismatch.

Then:

`AI / Rule Engine`
→ creates `HIGH ATTENDANCE DISCREPANCY`
→ official receives alert
→ official opens evidence
→ official chooses `Assign Surprise Inspection`
→ system randomly selects eligible inspector
→ inspector receives assignment
→ inspector verifies GPS
→ captures evidence
→ submits report
→ dashboard updates

This complete end-to-end scenario is the primary demonstration.

---

# 33. SECOND DEMO SCENARIO — CCTV FAILURE

Create:

`Camera 04 unexpectedly offline`

System:

`Camera health monitor`
→ detects missing heartbeat
→ creates alert
→ official sees alert
→ official opens project
→ sees camera health history
→ can initiate verification

---

# 34. THIRD DEMO SCENARIO — DUPLICATE EVIDENCE

Create:

`Evidence image reused from previous inspection`

System:

`Hash/similarity check`
→ possible duplicate detected
→ alert generated
→ official compares evidence
→ official marks:
  - False positive
  - Needs inspection
  - Escalate

---

# 35. FOURTH DEMO SCENARIO — RANDOM VC

Official:

`Start Surprise Verification`

System randomly chooses:

`Beneficiary`

Then:

`VC request sent`

If answered:

`Verification active`

Official completes short checklist.

If missed:

`Missed verification`
→ follow-up task.

---

# 36. UI SCREENS TO IMPLEMENT

At minimum implement these screens:

1. Splash
2. Login
3. Role selection/demo login
4. Official Dashboard
5. Project List
6. Project Details
7. Live CCTV Monitor
8. Camera Details
9. Alert Center
10. Alert Details
11. Risk Analytics
12. Attendance Analytics
13. Inspection Assignment
14. Inspector Home
15. Inspector Assignment Details
16. GPS Verification
17. Inspection Checklist
18. Evidence Capture
19. Evidence Review
20. Inspection Report
21. Video Verification
22. Beneficiary Feedback
23. Map
24. Notifications
25. Audit Trail
26. Profile
27. NGO Dashboard
28. Attendance Submission
29. NGO Verification
30. Offline Sync Queue

---

# 37. PERFORMANCE AND QUALITY

The generated application must:

- avoid unnecessary re-renders
- use loading states
- use error states
- handle network failures
- handle location permission denial
- handle camera permission denial
- validate forms
- show empty states
- support scrolling
- avoid crashes on missing data
- use reusable components
- keep API logic separate from UI
- keep AI logic separate from UI
- keep CCTV logic separate from UI

---

# 38. SECURITY

Implement prototype-level security:

- role-based access
- authenticated API requests
- authorization checks
- input validation
- no secrets committed to source code
- `.env.example`
- safe file upload validation
- audit logging
- do not expose private CCTV credentials
- do not store sensitive beneficiary information unnecessarily

---

# 39. IMPORTANT MOCK/REAL INTEGRATION ARCHITECTURE

Create interfaces so real hardware/services can be connected later.

For example:

```ts
interface CCTVProvider {
  getStream(cameraId: string): Promise<string>;
  getHealth(cameraId: string): Promise<CameraHealth>;
}

interface AttendanceAnalyzer {
  analyze(projectId: string): Promise<AttendanceAnalysis>;
}

interface LocationVerifier {
  verify(
    currentLatitude: number,
    currentLongitude: number,
    projectLatitude: number,
    projectLongitude: number
  ): LocationVerificationResult;
}

interface InspectionAssignmentEngine {
  assign(projectId: string): Promise<InspectionAssignment>;
}
```

Then provide:

```text
MockCCTVProvider
MockAttendanceAnalyzer
MockLocationVerifier
RandomInspectionAssignmentEngine
```

This makes it possible to replace mock services with real implementations later.

---

# 40. HARDWARE INTEGRATION READINESS

The system should be software-first but hardware-ready.

Potential hardware integrations:

### CCTV/IP camera
RTSP/HLS/WebRTC adapter.

### Mobile GPS
Real device GPS through Expo Location.

### Mobile camera
Real photo/video capture.

### Optional biometric/attendance device
Create an attendance ingestion API/interface.

### Optional IoT/camera gateway
Create a generic device heartbeat API.

Do not require the SIH demo to physically install government hardware.

Instead demonstrate:

`Real mobile GPS + Real mobile camera`
+
`Mock CCTV stream`
+
`Hardware integration interface`
+
`AI analytics`

---

# 41. GEO-FENCING

Use a configurable radius.

Example:

`Allowed inspection radius = 100 meters`

Calculation:

distance between:
- registered project coordinates
- inspector's current coordinates

If:

`distance <= radius`

then:

`LOCATION VERIFIED`

Else:

`OUTSIDE GEOFENCE`

Show distance.

Example:

`You are 43 m from the registered site`

---

# 42. OFFLINE-FIRST INSPECTION DATA

Use local persistence.

When offline:

```text
Inspection Draft
Evidence: 3
GPS: captured
Status: Waiting for sync
```

When online:

```text
Syncing...
3/3 uploaded
Inspection submitted
```

Never lose captured field evidence just because connectivity disappears.

---

# 43. ACCESSIBILITY

Support:

- large touch targets
- readable fonts
- clear labels
- screen-reader-friendly buttons
- icon + text status
- meaningful error messages

---

# 44. PROJECT STRUCTURE

Use a clean structure similar to:

```text
apps/
  mobile/

services/
  api/
  ai/

packages/
  types/
  ui/
  config/

database/
  migrations/
  seed/

docs/
  architecture/
  api/
```

If a monorepo is unnecessarily complex for the generated prototype, use:

```text
mobile/
backend/
ai-service/
```

and keep boundaries clear.

---

# 45. README REQUIREMENTS

Generate a complete README containing:

- Project overview
- Problem statement
- Features
- Architecture
- Tech stack
- Setup
- Environment variables
- Database setup
- Demo accounts
- Demo scenarios
- CCTV mock setup
- AI architecture
- Offline mode
- Future hardware integrations
- Limitations
- SIH demo instructions

---

# 46. ANTIGRAVITY EXECUTION PLAN

IMPORTANT:

Do NOT attempt to generate the entire application blindly in one giant step.

Follow these phases.

## Phase 1 — Analyze & plan
Inspect workspace.

Create:
- architecture
- folder structure
- database model
- API contracts
- navigation plan

Do not write application code until the plan is clear.

## Phase 2 — Scaffold
Create:
- React Native/Expo app
- backend
- shared types
- environment configuration
- database schema

## Phase 3 — Authentication & roles
Implement login and role-based navigation.

## Phase 4 — Official dashboard
Implement:
- KPIs
- project list
- map
- alerts
- risk analytics

## Phase 5 — Inspector workflow
Implement:
- assignment
- GPS
- geofence
- checklist
- evidence capture
- report submission

## Phase 6 — CCTV
Implement:
- camera list
- mock stream
- camera health
- stream service abstraction

## Phase 7 — AI analytics
Implement:
- rule engine
- attendance mismatch
- anomaly engine
- explainable alerts
- risk score

## Phase 8 — Surprise verification
Implement:
- random inspector assignment
- random VC
- missed verification
- follow-up

## Phase 9 — Offline mode
Implement:
- local queue
- evidence queue
- sync mechanism

## Phase 10 — Polish
Add:
- loading states
- empty states
- error states
- animations
- accessibility
- responsive layouts
- demo scenario

## Phase 11 — Test
Run:
- type checks
- lint
- unit tests
- API tests
- mobile build
- complete demo flow

Fix all blocking errors.

---

# 47. ANTIGRAVITY AGENT RULES

When working on this project:

1. First inspect existing files before modifying them.
2. Never overwrite working code unnecessarily.
3. Prefer reusable components.
4. Keep secrets out of source control.
5. Never invent real government APIs.
6. Clearly label mock data.
7. Never claim mock CCTV is real CCTV.
8. Never claim mock AI is a trained production model.
9. Keep AI decisions explainable.
10. Keep a human official in the decision loop.
11. Do not remove requested features just because implementation is difficult.
12. If a real integration is unavailable, implement a clean adapter/mock interface.
13. Run tests after major changes.
14. Fix errors before moving to the next phase.
15. Keep the application demo-ready at every phase.

---

# 48. FIRST ANTIGRAVITY PROMPT

Paste the following into Antigravity first:

> You are the lead engineer for our Smart India Hackathon 2026 project SIH26095.
>
> We are building a mobile-first centralized DoSJE monitoring and surprise inspection platform called NIRIKSHAN AI.
>
> I have provided the project requirements/workflow documents in the workspace.
>
> FIRST: inspect the entire workspace and the provided requirements.
>
> Do not start by blindly generating the entire application.
>
> Produce a concrete implementation plan covering:
> 1. mobile architecture
> 2. backend architecture
> 3. database schema
> 4. authentication and role-based access
> 5. CCTV integration abstraction
> 6. GPS/geofencing
> 7. inspection workflow
> 8. random inspection assignment
> 9. random video verification
> 10. attendance analytics
> 11. anomaly/risk engine
> 12. evidence integrity
> 13. duplicate evidence detection
> 14. offline-first inspection workflow
> 15. notifications
> 16. audit trail
> 17. demo data
> 18. judge demonstration flow
>
> Use React Native + Expo + TypeScript for mobile.
>
> Use Node.js + TypeScript for the backend.
>
> Use PostgreSQL/Supabase unless the existing workspace requires another compatible choice.
>
> Keep AI, CCTV, GPS, and inspection assignment as modular services/interfaces so real integrations can replace mock services later.
>
> The prototype must clearly distinguish DEMO/MOCK data from live data.
>
> The AI must be assistive and explainable. It must never make a final fraud/compliance decision.
>
> After creating the plan, wait for my approval before implementing Phase 2.

---

# 49. SECOND PROMPT AFTER PLAN APPROVAL

After reviewing the plan, send:

> Implement Phase 2 now.
>
> Scaffold the project according to the approved architecture.
>
> Create the mobile app, backend, shared types, environment configuration, database schema, seed data, and basic navigation.
>
> Make sure the project runs successfully.
>
> After implementation:
> - run type checking
> - run linting
> - run available tests
> - fix all blocking errors
> - provide exact commands to start the mobile app and backend
>
> Do not implement later phases yet.

---

# 50. FINAL JUDGE DEMO FLOW

The ideal 5–7 minute demonstration should be:

```text
LOGIN
  ↓
OFFICIAL DASHBOARD
  ↓
SHOW HIGH-RISK PROJECT
  ↓
OPEN ATTENDANCE MISMATCH
  ↓
SHOW CCTV / MOCK LIVE FEED
  ↓
SHOW AI EXPLANATION
  ↓
ASSIGN SURPRISE INSPECTION
  ↓
RANDOM INSPECTOR SELECTED
  ↓
INSPECTOR MOBILE APP
  ↓
GPS / GEOFENCE VERIFIED
  ↓
CAPTURE PHOTO + VIDEO
  ↓
GEO-TAGGED EVIDENCE
  ↓
SUBMIT REPORT
  ↓
DASHBOARD UPDATES
  ↓
SHOW AUDIT TRAIL
  ↓
SHOW RANDOM VC VERIFICATION
  ↓
SHOW RISK TIMELINE
```

---

# 51. CORE DIFFERENTIATOR

The project should NOT be presented as:

> "An app that monitors NGOs."

Present it as:

> **"An evidence-driven verification platform that connects real-time monitoring, surprise inspection, geo-verified field evidence, CCTV analytics and explainable AI so officials can detect discrepancies and decide where human verification is needed."**

The key message:

## MONITOR → DETECT → VERIFY → ACT

That should appear throughout the product and presentation.

---

# 52. ACCEPTANCE CRITERIA

The prototype is considered complete when a judge can perform this without developer assistance:

1. Login as official.
2. View projects.
3. See risk score.
4. Open an anomaly.
5. Understand why it was flagged.
6. Open CCTV/mock live monitor.
7. Assign surprise inspection.
8. See random eligible inspector selected.
9. Login as inspector.
10. Open assignment.
11. Verify GPS/geofence.
12. Capture evidence.
13. See GPS + timestamp metadata.
14. Submit inspection.
15. Return to official dashboard.
16. See updated status.
17. Initiate random VC verification.
18. View attendance analytics.
19. View audit trail.
20. Demonstrate an offline inspection draft and later sync.

---

# 53. DO NOT DO THESE

Do NOT:
- build only a dashboard
- build only a CCTV viewer
- build only an attendance app
- build only a random assignment algorithm
- make AI a black box
- claim fake government integrations
- hardcode everything into one screen
- ignore offline field conditions
- ignore GPS verification
- ignore evidence integrity
- allow AI to make final enforcement decisions

The strength of the solution is the **end-to-end integration**.

---

# 54. SUCCESS DEFINITION

A successful prototype should make the judge understand within 60 seconds:

> "A DoSJE official can see what is happening, identify something suspicious, verify the evidence, send a surprise inspection, receive geo-tagged proof from the field, and make an informed human decision — all from one centralized platform."

Build for that outcome.
