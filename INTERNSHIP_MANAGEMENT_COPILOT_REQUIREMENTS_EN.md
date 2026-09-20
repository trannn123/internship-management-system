# COPILOT REQUIREMENTS — INTERNSHIP MANAGEMENT SYSTEM

## 1. Purpose

This document is the main requirements guide for GitHub Copilot / AI when modifying the current **Internship Management System** project.

**Important:** Do not rebuild the project from scratch. Read the existing codebase first, keep the parts that are already working correctly, and refactor/extend the system according to the updated business workflow below.

The goal is to move the current system from the old internship workflow to the complete workflow described in this document.

```text
ADMIN
  ↓
Internship Period
  ↓
Admin assigns Lecturer(s)
  ↓
COMPANY creates Internship Opportunity
  ↓
STUDENT applies to Opportunity
  ↓
COMPANY reviews application
  ↓
LECTURER reviews application
  ↓
IN_PROGRESS
  ↓
Work Plan → Tasks → Internship Logs
  ↓
Company Evaluation + Lecturer Evaluation
  ↓
Final Score = Company 80% + Lecturer 20%
  ↓
COMPLETED
```

---

# 2. Current Technology Stack

The project currently uses:

- Frontend: React + TypeScript + Vite
- UI framework: **Bootstrap 5**
- Backend: Java 21 + Quarkus
- Database: PostgreSQL 16
- Authentication / Authorization: Keycloak
- Docker / Docker Compose
- Microservices architecture

Main services:

1. `user-service`
2. `internship-service`
3. `evaluation-service`
4. `frontend`

Keycloak realm:

```text
internship-management
```

Keycloak client:

```text
internship-management-app
```

Available roles:

```text
STUDENT
COMPANY
LECTURER
ADMIN
```

---

# 3. UI / UX REQUIREMENTS

## 3.1. Bootstrap

The frontend must use **Bootstrap 5** as the primary UI framework.

Use Bootstrap components and utilities for:

- Layout
- Grid system
- Spacing
- Buttons
- Forms
- Cards
- Tables
- Alerts
- Badges
- Dropdowns
- Modals
- Navigation
- Responsive behavior

Do not introduce another major UI framework such as Tailwind, Material UI, Ant Design, or Chakra UI unless explicitly requested.

Keep custom CSS limited to cases where Bootstrap does not provide the required visual behavior.

---

## 3.2. Modern SaaS UI Design

The entire frontend should follow a **Modern SaaS UI** style.

The design should feel like a modern professional web application rather than a basic CRUD page.

Use these design principles:

### Layout

Prefer:

```text
Sidebar
    +
Top Header / Topbar
    +
Main Content Area
```

The exact layout can be adapted for each role, but it should remain consistent throughout the application.

### Visual language

Use:

- Clean white or very light backgrounds
- Spacious layouts
- Consistent Bootstrap spacing
- Rounded cards and containers
- Subtle borders and shadows
- Clear visual hierarchy
- Professional typography
- Consistent icon usage
- Status badges
- Well-structured data tables
- Responsive design for desktop, tablet, and smaller screens

Avoid:

- Excessive gradients
- Excessive shadows
- Extremely large text
- Crowded layouts
- Random colors
- Inconsistent button styles
- Unnecessary animations
- Raw browser-default HTML tables/forms as the final UI

### Dashboard style

Dashboards should contain:

- Summary cards
- Important statistics
- Recent activities
- Current status
- Relevant quick actions
- Clear primary action buttons

Example:

```text
┌───────────────────────────────────────────────────────┐
│ Welcome back                                          │
│ Short contextual description                          │
├─────────────┬─────────────┬─────────────┬─────────────┤
│ Active      │ Pending     │ Completed   │ Average     │
│ Internships │ Applications│ Internships │ Score       │
├─────────────┴─────────────┴─────────────┴─────────────┤
│ Recent Activity                                       │
│                                                     │
├───────────────────────────────────────────────────────┤
│ Recent Internships / Applications / Tasks             │
└───────────────────────────────────────────────────────┘
```

### Status display

Use Bootstrap badges consistently.

Example:

```text
PENDING_COMPANY   → warning badge
PENDING_LECTURER  → info badge
IN_PROGRESS       → primary badge
COMPLETED         → success badge
REJECTED_*        → danger badge
OPEN              → success badge
CLOSED            → secondary badge
```

The exact colors can use Bootstrap semantic classes such as:

```text
bg-primary
bg-success
bg-warning
bg-danger
bg-secondary
bg-info
```

Do not create a different visual language for every page.

### Forms

Forms should:

- Use Bootstrap form controls
- Have clear labels
- Show validation messages near the relevant field
- Group related fields logically
- Use proper loading/disabled states
- Use consistent submit/cancel buttons
- Prevent accidental duplicate submissions

### Tables

Tables should:

- Use Bootstrap table styles
- Have readable column spacing
- Support horizontal scrolling on small screens when necessary
- Use badges for status
- Use action buttons consistently
- Show an empty state when there is no data
- Show a loading state when data is being fetched

### Responsive design

The frontend must work reasonably well on:

- Desktop
- Laptop
- Tablet
- Smaller screens

Use Bootstrap responsive utilities and grid classes instead of writing unnecessary custom media queries.

---

# 4. IMPORTANT RULES FOR COPILOT

Before changing code:

1. Read the existing project.
2. Understand the current architecture.
3. Find existing entities, DTOs, repositories, services, controllers, and frontend API modules.
4. Identify which parts are already implemented and working.
5. Only then modify the code.

Do not immediately perform a large blind refactor.

After each logical phase:

```text
Build
→ Fix compilation errors
→ Run the relevant API/tests
→ Report the result
```

---

# 5. PARTS THAT ARE ALREADY IMPLEMENTED — DO NOT REMOVE WITHOUT REASON

## 5.1. Keycloak Authentication / Authorization

The project already has:

- Keycloak realm `internship-management`
- Client `internship-management-app`
- Roles:
  - STUDENT
  - COMPANY
  - LECTURER
  - ADMIN
- React login using `keycloak-js`
- Backend JWT authentication
- `@RolesAllowed`
- JWT role mapping through `realm_access.roles`
- MicroProfile JWT configuration
- Frontend role-based dashboard routing

Do not replace the existing authentication architecture with a custom login system.

---

# 6. USER SERVICE — ALREADY IMPLEMENTED

## 6.1. User

User Service currently manages business user data:

```text
User
├── id
├── keycloakUserId
├── fullName
└── email
```

A User can have one corresponding business profile:

```text
User
 ├── Student
 ├── Lecturer
 └── Company
```

## 6.2. Student Profile

Current Student profile fields:

```text
studentCode
major
className
phone
```

## 6.3. Lecturer Profile

Current Lecturer profile fields:

```text
lecturerCode
department
phone
```

## 6.4. Company Profile

Current Company profile fields:

```text
companyName
taxCode
address
phone
```

---

# 7. `/api/users/me` — ALREADY IMPLEMENTED

The User Service already has logic to:

- Read `keycloakUserId` from JWT
- Read the current user's information
- Automatically create the business User record if it does not exist
- Create the corresponding profile based on the role
- Return `MeResponse`

Current `MeResponse` contains:

```text
id
keycloakUserId
fullName
email
role
profile
```

---

# 8. IMPORTANT USER ACCOUNT ARCHITECTURE DECISION

**Keycloak owns account creation and role assignment.**

The frontend must **not** create Keycloak accounts through User Service.

Keycloak owns:

- username
- email
- password
- role assignment

User Service owns:

- business User record
- Student profile
- Lecturer profile
- Company profile
- business data associated with the user

The frontend has already removed its `createUser()` API function.

If the backend still contains legacy user CRUD endpoints, do not remove them blindly. First inspect their dependencies and usage. Preserve compatibility where reasonable and only remove or deprecate them deliberately.

---

# 9. INTERNSHIP SERVICE — CURRENT STATE

The current internship-service already contains several working features.

It currently has concepts such as:

```text
Internship
InternshipLog
Task
WorkPlan
```

It also has:

- JWT authentication
- role-based authorization
- `CurrentUserService`
- HTTP communication with User Service
- repositories/services/controllers for internship features

---

# 10. IMPORTANT: THE OLD INTERNSHIP MODEL IS NO LONGER THE FINAL BUSINESS WORKFLOW

The old `Internship` entity contains fields similar to:

```text
studentId
companyId
lecturerId
position
description
startDate
endDate
status
```

The old workflow allowed a Student to create an Internship directly.

That old workflow is **not the final business model**.

Do not continue building the system around:

```text
Student
  ↓
POST /api/internships
  ↓
student sends companyId
student sends lecturerId
```

The new workflow must be based on:

```text
InternshipPeriod
        ↓
InternshipPeriodLecturer
        ↓
InternshipOpportunity
        ↓
InternshipRegistration
```

The existing old Internship code should be refactored carefully rather than blindly deleted.

---

# 11. CURRENT WORK PLAN FEATURE — ALREADY IMPLEMENTED

Current entity:

```text
WorkPlan
```

Existing fields include:

```text
id
internshipId
title
description
startDate
endDate
```

Existing behavior includes:

- Company can create a Work Plan
- Work Plan can be retrieved
- Company ownership is checked

This functionality should be preserved while adapting its reference to the new internship/registration model.

---

# 12. CURRENT TASK FEATURE — ALREADY IMPLEMENTED

Current entity:

```text
Task
```

Existing fields include:

```text
id
workPlanId
title
description
startDate
dueDate
status
```

Current statuses:

```text
TODO
IN_PROGRESS
COMPLETED
```

Current transition logic:

```text
TODO → IN_PROGRESS
IN_PROGRESS → COMPLETED
COMPLETED → cannot change
```

Current behavior:

- Company can create tasks
- Student can update task status
- Ownership checks already exist through the internship/work-plan chain

Keep this logic unless the new domain model requires a reference change.

---

# 13. CURRENT INTERNSHIP LOG FEATURE — ALREADY IMPLEMENTED

Current entity:

```text
InternshipLog
```

Current fields include:

```text
id
internshipId
logDate
content
result
note
```

Existing behavior has been tested for:

- Student creates a log
- Student views logs
- Company views logs
- Lecturer views logs

Keep the functionality and adapt the underlying reference if the new domain model requires it.

---

# 14. EVALUATION SERVICE — ALREADY IMPLEMENTED

## 14.1. Company Evaluation

Existing `CompanyEvaluation` contains information similar to:

```text
internshipId
companyId
score
comment
evaluatedAt
```

Score range:

```text
0 → 10
```

Company can create an evaluation.

Duplicate evaluation is already prevented.

---

## 14.2. Lecturer Evaluation

Existing `LecturerEvaluation` contains information similar to:

```text
internshipId
lecturerId
score
comment
evaluatedAt
```

Score range:

```text
0 → 10
```

Lecturer can create an evaluation.

Duplicate evaluation is already prevented.

---

## 14.3. Final Score

The current evaluation logic already uses:

```text
Final Score = Company Score × 80% + Lecturer Score × 20%
```

Example:

```text
Company = 8.5
Lecturer = 9.0

Final = 8.5 × 0.8 + 9.0 × 0.2
      = 8.8
```

An Evaluation Summary API already exists.

The final architecture should attach evaluations to the new official internship registration/internship record rather than continuing to depend on the obsolete application flow.

---

# 15. FRONTEND — CURRENT STATE

The frontend is React + TypeScript + Vite.

Installed packages include:

```text
keycloak-js
react-router-dom
bootstrap
```

The current frontend contains modules/pages similar to:

```text
src/
├── api/
│   ├── api-client.ts
│   ├── user-api.ts
│   ├── internship-api.ts
│   └── evaluation-api.ts
├── components/
│   └── layout/
│       └── MainLayout.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── StudentDashboard.tsx
│   ├── CompanyDashboard.tsx
│   ├── LecturerDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── UsersPage.tsx
├── routes/
│   └── AppRoutes.tsx
├── keycloak.ts
├── App.tsx
└── main.tsx
```

Current frontend already supports:

- Keycloak login
- JWT retrieval
- Bearer token API requests
- Role-based routing
- Role-based dashboards
- Basic admin user listing
- User / Internship / Evaluation API clients

The existing dashboards are basic and still reflect the old internship model. They must be redesigned according to the new workflow and the Modern SaaS UI requirements.

---

# 16. NEW BUSINESS WORKFLOW — MUST BECOME THE MAIN WORKFLOW

This is the most important section.

The system must introduce the concept of:

```text
Internship Period
```

This represents an official internship period/semester.

Examples:

```text
Internship Semester 1 - Academic Year 2026-2027
Summer Internship 2027
```

A Student must not directly create an internship without going through an Internship Opportunity and Registration.

---

# 17. INTERNSHIP PERIOD

Create:

```text
InternshipPeriod
```

Suggested fields:

```text
id
name
description
registrationStartDate
registrationEndDate
internshipStartDate
internshipEndDate
status
createdAt
updatedAt
```

Suggested status:

```text
DRAFT
OPEN
CLOSED
IN_PROGRESS
COMPLETED
```

Meaning:

- `DRAFT`: configured but not open
- `OPEN`: available for internship registration
- `CLOSED`: registration is closed
- `IN_PROGRESS`: internship execution period is active
- `COMPLETED`: period has ended

---

# 18. ADMIN CREATES THE INTERNSHIP PERIOD

Required workflow:

```text
ADMIN
  ↓
Create Internship Period
```

Admin can manage:

- Period name
- Description
- Registration start/end dates
- Internship start/end dates
- Period status

Student cannot create an Internship Period.

Company cannot create an Internship Period.

---

# 19. ADMIN ASSIGNS LECTURER(S)

After creating the Internship Period:

```text
ADMIN
  ↓
Assign Lecturer(s)
  ↓
Internship Period
```

Create:

```text
InternshipPeriodLecturer
```

Suggested fields:

```text
id
periodId
lecturerId
```

Add a unique constraint:

```text
UNIQUE(periodId, lecturerId)
```

One Internship Period may have one or multiple assigned lecturers.

**Students must never choose lecturers themselves.**

---

# 20. IMPORTANT RULE FOR MULTIPLE LECTURERS

If a period has multiple lecturers, the system needs a clear assignment rule for which lecturer handles which Student/Registration.

Possible implementation:

```text
Admin assigns a Lecturer to a specific Registration
```

or:

```text
System assigns a Lecturer based on a predefined rule
```

The exact rule can be selected based on the existing project design, but:

**Student must never choose the Lecturer.**

Do not invent an arbitrary lecturer assignment algorithm without checking the existing requirements first.

---

# 21. COMPANY CREATES INTERNSHIP OPPORTUNITY

When an Internship Period is available for companies, a Company can create:

```text
InternshipOpportunity
```

Example:

```text
Internship Period
    ↓
Company ABC
    ↓
Java Backend Developer
    ↓
3 positions
```

Suggested fields:

```text
id
periodId
companyId
position
description
requirements
location
quantity
status
createdAt
updatedAt
```

Status:

```text
OPEN
CLOSED
```

---

# 22. COMPANY OPPORTUNITY RULES

A Company may only create an Opportunity when:

- the selected Internship Period exists
- the period is valid for company opportunity creation
- the Company is authenticated
- the Company owns the Opportunity

The backend must derive:

```text
companyId
```

from the authenticated JWT/current user.

Do not trust a client-supplied `companyId`.

---

# 23. STUDENT VIEWS OPEN OPPORTUNITIES

Student workflow:

```text
View Internship Periods
        ↓
View Internship Opportunities
        ↓
Choose Opportunity
        ↓
Apply / Register
```

Students should see:

- Internship Period
- Company
- Position
- Description
- Requirements
- Location
- Available quantity
- Registration status
- Relevant dates

---

# 24. STUDENT REGISTRATION

Create:

```text
InternshipRegistration
```

Suggested fields:

```text
id
periodId
opportunityId
studentId
companyId
lecturerId
status
registeredAt
approvedByCompanyAt
approvedByLecturerAt
completedAt
```

When the Student registers:

```text
studentId
```

must be taken from the JWT.

The Student request should contain only what the Student is allowed to choose, for example:

```json
{
  "opportunityId": 1
}
```

The backend should derive:

```text
studentId
companyId
periodId
lecturerId
```

from trusted server-side sources.

---

# 25. STUDENT MUST NOT SUBMIT OWNERSHIP IDS

The Student must not control:

```text
companyId
lecturerId
periodId
```

in the registration request.

The backend must determine:

```text
studentId
    ← JWT

opportunityId
    ← request

companyId
    ← Opportunity

periodId
    ← Opportunity

lecturerId
    ← InternshipPeriodLecturer / assignment rule
```

This is a core security and integrity requirement.

---

# 26. REGISTRATION BUSINESS RULES

A registration is only allowed when:

```text
Opportunity.status = OPEN
```

and:

```text
Internship Period is accepting registrations
```

The backend must reject invalid situations such as:

- Opportunity does not exist
- Opportunity is CLOSED
- Internship Period does not exist
- Internship Period is not open for registration
- Student is not authenticated as STUDENT
- Registration is duplicated
- Opportunity belongs to an invalid/inactive period

---

# 27. PREVENT DUPLICATE REGISTRATION

At minimum, add:

```text
UNIQUE(studentId, opportunityId)
```

A Student must not register for the same Opportunity more than once.

Also evaluate the business rule:

```text
A Student may have only one active internship in the same Internship Period.
```

If this rule applies to the final project, enforce it on the backend and, where appropriate, at the database level.

---

# 28. COMPANY APPROVAL

After Student registration:

```text
status = PENDING_COMPANY
```

The Company can view registrations belonging to its Opportunities.

Company actions:

```text
Approve
Reject
```

On reject:

```text
REJECTED_COMPANY
```

On approve:

```text
PENDING_LECTURER
```

Company authorization rule:

```text
authenticated companyId
    =
registration.companyId
```

A Company must never approve a registration belonging to another Company.

---

# 29. LECTURER APPROVAL

After Company approval:

```text
PENDING_LECTURER
```

The assigned Lecturer reviews the registration.

Lecturer actions:

```text
Approve
Reject
```

On reject:

```text
REJECTED_LECTURER
```

On approve:

```text
IN_PROGRESS
```

Authorization rule:

The Lecturer must actually be assigned to the Internship Period / Registration.

A Lecturer who is not assigned to the relevant Internship Period must receive:

```text
403 Forbidden
```

or an equivalent authorization response.

---

# 30. FINAL REGISTRATION STATUS FLOW

The main workflow should be:

```text
PENDING_COMPANY
        ↓
        ├── REJECTED_COMPANY
        │
        └── PENDING_LECTURER
                  ↓
                  ├── REJECTED_LECTURER
                  │
                  └── IN_PROGRESS
                           ↓
                       COMPLETED
```

Other statuses may be added only when justified by the business requirements.

Do not allow arbitrary client-side status changes.

---

# 31. WORK PLAN MUST FOLLOW THE NEW REGISTRATION MODEL

Once the Lecturer approves:

```text
InternshipRegistration
        ↓
IN_PROGRESS
        ↓
WorkPlan
```

The Work Plan should be associated with the official internship/registration record.

A clean target model is:

```text
WorkPlan
    ↓
registrationId
```

or an equivalent official internship identifier if the architecture deliberately keeps an `Internship` aggregate.

The important point is that the reference must identify the **approved official internship**, not a client-created arbitrary record.

---

# 32. DO NOT CREATE DUPLICATE DOMAIN CONCEPTS WITHOUT A REASON

There are currently both old Internship concepts and the new Registration concept.

Before creating additional entities, inspect the existing design.

A clean target model can be:

```text
InternshipPeriod
        ↓
InternshipOpportunity
        ↓
InternshipRegistration
```

and then:

```text
InternshipRegistration
        ↓
WorkPlan
        ↓
Task
        ↓
InternshipLog
```

If the existing `Internship` entity can be safely repurposed as the official internship record, explain that design before changing it.

Do not create:

```text
Internship
OfficialInternship
InternshipApplication
InternshipRegistration
InternshipAssignment
```

all at once without a clear reason.

Avoid duplicate concepts.

---

# 33. TASK FEATURE AFTER THE REFACTOR

Keep the existing Task workflow:

```text
TODO
 ↓
IN_PROGRESS
 ↓
COMPLETED
```

Company:

- Creates tasks
- Edits tasks where the existing requirements allow it

Student:

- Updates task status

Backend must verify the full ownership chain.

For example:

```text
Task
 ↓
WorkPlan
 ↓
InternshipRegistration
 ↓
Student / Company / Lecturer
```

Do not authorize access solely because the user has the correct role.

---

# 34. INTERNSHIP LOG AFTER THE REFACTOR

Keep the current Internship Log functionality.

Student:

- Creates logs
- Views own logs

Company:

- Views logs for its interns

Lecturer:

- Views logs for assigned students

Backend must check ownership through the new internship/registration chain.

Do not allow:

```text
Student A → view Student B logs
Company A → view Company B intern logs
Lecturer A → view Lecturer B assigned students
```

---

# 35. EVALUATION AFTER THE REFACTOR

## Company Evaluation

Company evaluates the Student using:

```text
score: 0-10
comment
```

Company may only evaluate an internship belonging to the Company.

## Lecturer Evaluation

Lecturer evaluates the Student using:

```text
score: 0-10
comment
```

Lecturer may only evaluate a Student assigned to that Lecturer.

---

# 36. FINAL SCORE

Keep the existing weighting:

```text
Company = 80%
Lecturer = 20%
```

Formula:

```text
Final Score = Company Score × 0.8 + Lecturer Score × 0.2
```

Example:

```text
Company = 8
Lecturer = 9

Final = 8 × 0.8 + 9 × 0.2
      = 8.2
```

The result should be calculated by the backend, not trusted from the frontend.

---

# 37. COMPLETED STATUS

The official internship should become:

```text
COMPLETED
```

only when the completion conditions are satisfied.

Recommended conditions:

- Internship end date has been reached or the completion workflow is triggered
- Company evaluation exists
- Lecturer evaluation exists
- There is no unresolved rejection state

Do not let the frontend arbitrarily set:

```text
COMPLETED
```

without server-side validation.

---

# 38. TARGET DOMAIN MODEL

The target domain should conceptually follow:

```text
InternshipPeriod
        ↓
InternshipPeriodLecturer
        ↓
InternshipOpportunity
        ↓
InternshipRegistration
        ↓
WorkPlan
        ↓
Task
        ↓
InternshipLog
        ↓
CompanyEvaluation
        ↓
LecturerEvaluation
```

The three concepts below must be clearly separated:

```text
Internship Period
    =
official internship period / semester

Internship Opportunity
    =
a position opened by a Company

Internship Registration
    =
a Student's application to an Opportunity
```

Do not merge all three into one `Internship` table.

---

# 39. ROLE-BASED BUSINESS RESPONSIBILITIES

## ADMIN

Manage:

- Internship Periods
- Lecturer assignment
- System data
- User business records when required
- High-level system monitoring

Admin does not need to manually act as Student or Company for normal business operations.

---

## COMPANY

Manage:

- Company profile
- Internship Opportunities
- Registrations belonging to the Company
- Student approval/rejection
- Work Plans
- Tasks
- Internship monitoring
- Company Evaluation

---

## LECTURER

Manage:

- Assigned Internship Periods
- Assigned registrations/students
- Student approval/rejection
- Progress monitoring
- Internship Logs
- Lecturer Evaluation

---

## STUDENT

Manage:

- Student profile
- Internship Opportunities
- Registration
- Own registration status
- Work Plan information
- Task progress
- Internship Logs
- Evaluation results

---

# 40. FRONTEND TARGET STRUCTURE

## 40.1. Admin

```text
Admin Dashboard
├── Internship Periods
│   ├── List
│   ├── Create
│   ├── Edit
│   ├── Open / Close
│   └── Assign Lecturers
├── Users
└── System Overview
```

## 40.2. Company

```text
Company Dashboard
├── Internship Opportunities
│   ├── List
│   ├── Create
│   ├── Edit
│   └── Open / Close
├── Internship Registrations
│   ├── Pending
│   ├── Approved
│   └── Rejected
├── Work Plans
├── Tasks
├── Intern Logs
├── Evaluations
└── Profile
```

## 40.3. Student

```text
Student Dashboard
├── Internship Opportunities
├── My Registrations
├── Internship Details
├── Work Plan
├── Tasks
├── Internship Logs
├── Evaluation Result
└── Profile
```

## 40.4. Lecturer

```text
Lecturer Dashboard
├── Assigned Internship Periods
├── Pending Registrations
├── Internship Students
├── Progress
├── Internship Logs
├── Evaluation
└── Profile
```

---

# 41. FRONTEND MODERN SAAS NAVIGATION

Use a consistent application shell.

Recommended structure:

```text
┌────────────────────────────────────────────────────────────┐
│ Logo / App Name        Search / Page Context     User Menu │
├───────────────┬────────────────────────────────────────────┤
│ Dashboard     │                                            │
│ Periods       │              Main Content                  │
│ Opportunities │                                            │
│ Registrations │                                            │
│ Tasks         │                                            │
│ Logs          │                                            │
│ Evaluations   │                                            │
│ Profile       │                                            │
└───────────────┴────────────────────────────────────────────┘
```

The menu must remain role-aware.

Students should not see Admin-only navigation items.

Companies should not see Lecturer-only administration.

Lecturers should not see Company-only management tools.

---

# 42. FRONTEND COMPONENT REUSE

Use reusable React components where practical.

Possible components:

```text
AppLayout
Sidebar
Topbar
PageHeader
StatCard
StatusBadge
DataTable
EmptyState
LoadingState
ErrorState
ConfirmModal
FormField
ActionButton
```

Do not create five different versions of the same table/card/badge pattern.

Use reusable components while keeping the implementation simple.

---

# 43. FRONTEND API TARGET

Endpoint names can be adjusted to match the current code conventions, but equivalent functionality must exist.

## Internship Period

```http
GET    /api/internship-periods
GET    /api/internship-periods/{id}
POST   /api/internship-periods
PUT    /api/internship-periods/{id}
DELETE /api/internship-periods/{id}
```

Administrative operations should be restricted appropriately.

---

## Assign Lecturers

```http
POST   /api/internship-periods/{periodId}/lecturers
GET    /api/internship-periods/{periodId}/lecturers
DELETE /api/internship-periods/{periodId}/lecturers/{lecturerId}
```

---

## Internship Opportunities

```http
GET  /api/internship-opportunities
GET  /api/internship-opportunities/{id}
POST /api/internship-opportunities
PUT  /api/internship-opportunities/{id}
```

Company creates/edits only its own opportunities.

---

## Internship Registrations

```http
POST /api/internship-registrations
GET  /api/internship-registrations
GET  /api/internship-registrations/{id}
```

Student registration request should be minimal:

```json
{
  "opportunityId": 1
}
```

Do not send:

```text
studentId
companyId
lecturerId
periodId
```

---

## Company Approval

```http
PUT /api/internship-registrations/{id}/company/approve
PUT /api/internship-registrations/{id}/company/reject
```

---

## Lecturer Approval

```http
PUT /api/internship-registrations/{id}/lecturer/approve
PUT /api/internship-registrations/{id}/lecturer/reject
```

---

# 44. MICROSERVICE ARCHITECTURE RULE

Do not break the microservice architecture.

Expected communication:

```text
user-service
       ↑
       │ HTTP
       │
internship-service
       ↑
       │ HTTP
       │
evaluation-service
```

Do not do:

```text
internship-service
    → direct access to user-db
```

Do not do:

```text
evaluation-service
    → direct access to internship-db
```

Each service owns its own database.

Use REST APIs for cross-service data.

---

# 45. CURRENT USER / IDENTITY RULE

Trusted identity values should come from the JWT or trusted service responses.

Examples:

```text
Student userId
    ← JWT

Company userId
    ← JWT

Lecturer userId
    ← JWT
```

The frontend may display IDs and data, but it must not control ownership IDs in sensitive operations.

---

# 46. AUTHORIZATION RULE

Role checks alone are not enough.

For example:

```text
COMPANY
```

does not mean:

```text
can approve every registration
```

The backend must also verify ownership.

Example:

```text
authenticated companyId
    =
Opportunity.companyId
```

Likewise:

```text
authenticated lecturerId
    =
assigned Lecturer for the relevant Internship Period
```

And:

```text
authenticated studentId
    =
Registration.studentId
```

---

# 47. SECURITY RULES

The frontend must never be trusted to enforce business security.

Backend must validate:

- Role
- Ownership
- Resource existence
- Resource status
- Workflow transition
- Period dates
- Opportunity status
- Duplicate registration
- Lecturer assignment
- Evaluation ownership
- Completion conditions

Never rely only on the frontend to hide buttons.

Even if a button is hidden, the backend must reject unauthorized API calls.

---

# 48. DATABASE CONSTRAINTS

Use a combination of:

- Bean Validation
- Business validation
- Database constraints

Examples:

```text
UNIQUE(studentId, opportunityId)
```

and:

```text
UNIQUE(periodId, lecturerId)
```

Use foreign-key relationships where appropriate.

Prevent invalid null values where the field is mandatory.

---

# 49. DATA MIGRATION / OLD DATA

The current project already contains test data based on the old Internship workflow.

**Do not automatically delete or reset the database.**

Before changing entities:

1. Inspect the current schema.
2. Find all usage of the old `Internship` entity.
3. Find all dependent repositories/services/controllers.
4. Find evaluation references.
5. Find frontend API references.
6. Plan the migration/refactor.
7. Apply changes incrementally.
8. Verify the application still builds.

Do not run commands such as:

```text
DROP DATABASE
DROP TABLE
docker compose down -v
```

unless explicitly requested.

---

# 50. EXISTING BACKEND TEST HISTORY

The current project has already tested several old-flow features successfully, including:

- Keycloak role authentication
- User profile retrieval
- Admin user listing
- Internship creation in the old model
- Company approval in the old model
- Lecturer approval in the old model
- Work Plan creation
- Task creation
- Task status transitions
- Internship Logs
- Company Evaluation
- Lecturer Evaluation
- Final Evaluation Summary

These tests show that a lot of infrastructure already works.

Do not assume the project is empty.

The goal is to **evolve** the system.

---

# 51. REFACTOR STRATEGY

## Phase 1 — Analyze the current code

Inspect:

```text
internship-service
├── entity
├── dto
├── repository
├── service
└── controller
```

Identify where the old Internship model is referenced.

Then inspect:

```text
evaluation-service
```

Identify where `internshipId` is referenced.

Then inspect:

```text
frontend
```

Identify old Internship API calls and old dashboard logic.

Before changing code, report:

```text
Files to keep
Files to modify
Files to create
Files that may become obsolete
Dependencies between changes
```

---

## Phase 2 — Implement the new domain model

Add or refactor:

```text
InternshipPeriod
InternshipPeriodLecturer
InternshipOpportunity
InternshipRegistration
```

Do not immediately rewrite WorkPlan, Task, Logs, and Evaluations until the new registration workflow is clear.

---

## Phase 3 — Implement backend workflow

Implement:

```text
Period
→ Lecturer Assignment
→ Opportunity
→ Registration
→ Company Approval
→ Lecturer Approval
```

Test each part independently.

---

## Phase 4 — Adapt existing features

After Registration works:

```text
WorkPlan
→ Task
→ InternshipLog
→ Evaluation
```

should use the new official internship/registration relationship.

---

## Phase 5 — Rebuild the frontend UI

Then update:

- API clients
- Routes
- Role-based navigation
- Dashboards
- Forms
- Tables
- Detail pages
- Approval workflows
- Evaluation pages

Use:

```text
Bootstrap 5
+
Modern SaaS UI
```

throughout the application.

---

# 52. CODING RULES

1. Do not delete working functionality without checking dependencies.
2. Do not change the microservice architecture.
3. Do not access another service's database directly.
4. Do not trust client-supplied ownership IDs.
5. Do not allow Students to select Lecturers.
6. Do not allow Students to manually choose Company IDs.
7. Do not allow Students to manually choose Period IDs.
8. Do not allow clients to bypass status transitions.
9. Do not reset the database.
10. Do not create duplicate services or components when equivalent code already exists.
11. Before creating a new file, search for an existing class/component with a similar responsibility.
12. Prefer small incremental changes.
13. Build/test after each logical group of changes.
14. Keep Java 21.
15. Keep the existing Quarkus version unless there is a clear reason to change it.
16. Keep React + TypeScript + Vite.
17. Keep Keycloak authentication.
18. Keep PostgreSQL.
19. Use Bootstrap 5 for frontend UI.
20. Follow the Modern SaaS UI style described in this document.
21. Avoid broad unrelated CSS refactors.
22. Do not introduce unrelated libraries just for visual styling.
23. Keep API naming and package conventions consistent with the current project.
24. Preserve backward compatibility where it is reasonable during the migration.

---

# 53. REQUIRED TEST CASES

## Case 1 — Student registers for an OPEN Opportunity

Expected:

```text
SUCCESS
status = PENDING_COMPANY
```

---

## Case 2 — Student sends a fake companyId

Expected:

```text
REJECT or IGNORE
```

The backend must use the Company from the Opportunity.

---

## Case 3 — Student sends a fake lecturerId

Expected:

```text
REJECT or IGNORE
```

The backend must use the assigned Lecturer.

---

## Case 4 — Student registers for a CLOSED Opportunity

Expected:

```text
REJECT
```

---

## Case 5 — Student registers for the same Opportunity twice

Expected:

```text
REJECT
```

---

## Case 6 — Company approves another Company's registration

Expected:

```text
403 Forbidden
```

---

## Case 7 — Unassigned Lecturer tries to approve

Expected:

```text
403 Forbidden
```

---

## Case 8 — Company creates an Opportunity for an invalid Period

Expected:

```text
REJECT
```

---

## Case 9 — Student views another Student's registration

Expected:

```text
403 Forbidden
```

or an equivalent secure response.

---

## Case 10 — Company views another Company's registration

Expected:

```text
403 Forbidden
```

or an equivalent secure response.

---

## Case 11 — Final score calculation

Verify:

```text
Company = 80%
Lecturer = 20%
```

The backend result must be mathematically correct.

---

## Case 12 — Student attempts to bypass workflow

Examples:

```text
Student sets status = IN_PROGRESS
Student sets status = COMPLETED
Student modifies companyId
Student modifies lecturerId
Student modifies studentId
```

Expected:

```text
REJECT
```

---

# 54. TARGET END-TO-END FLOW

The final application should support this complete flow:

```text
ADMIN LOGIN
    ↓
Create Internship Period
    ↓
Assign Lecturer(s)
    ↓
COMPANY LOGIN
    ↓
Create Internship Opportunity
    ↓
STUDENT LOGIN
    ↓
Browse Internship Opportunities
    ↓
Register
    ↓
COMPANY LOGIN
    ↓
Review Registration
    ↓
Approve
    ↓
LECTURER LOGIN
    ↓
Review Registration
    ↓
Approve
    ↓
IN_PROGRESS
    ↓
COMPANY
Create Work Plan
    ↓
Create Tasks
    ↓
STUDENT
Update Task Progress
    ↓
Create Internship Logs
    ↓
COMPANY
Evaluate
    ↓
LECTURER
Evaluate
    ↓
System calculates Final Score
    ↓
COMPLETED
```

---

# 55. FINAL BUSINESS MODEL — MOST IMPORTANT SECTION

The old model:

```text
Student
 ↓
POST Internship
 ↓
companyId
lecturerId
```

is **no longer the main workflow**.

The new required workflow is:

```text
ADMIN
 ↓
INTERNSHIP PERIOD
 ↓
ASSIGN LECTURER
 ↓
COMPANY
 ↓
INTERNSHIP OPPORTUNITY
 ↓
STUDENT
 ↓
INTERNSHIP REGISTRATION
 ↓
COMPANY APPROVAL
 ↓
LECTURER APPROVAL
 ↓
IN_PROGRESS
 ↓
WORK PLAN
 ↓
TASK
 ↓
INTERNSHIP LOG
 ↓
COMPANY EVALUATION
 ↓
LECTURER EVALUATION
 ↓
FINAL SCORE
 ↓
COMPLETED
```

This workflow must be used as the basis for future backend and frontend development.

---

# 56. REQUIRED OUTPUT FROM COPILOT BEFORE CODING

Before modifying code, Copilot must:

1. Read the current project.
2. Identify all files related to the old Internship workflow.
3. Identify all files that can remain unchanged.
4. Identify all files that need modification.
5. Identify all new files that need to be created.
6. Explain the dependency order between changes.
7. Identify possible database migration risks.
8. Identify frontend routes/API calls that depend on the old workflow.
9. Explain how the new model will coexist with or replace the old model.
10. Confirm that the Bootstrap 5 + Modern SaaS UI requirement will be followed for frontend work.

Then wait for confirmation before making a large multi-file refactor, unless the user explicitly asks Copilot to proceed immediately.

---

# 57. COPILOT WORKING STYLE

When making changes:

### Step 1

Explain briefly:

```text
What is being changed
Why it is needed
Which files are affected
```

### Step 2

Show the exact files to modify/create.

### Step 3

Implement the smallest logical change.

### Step 4

Run the build.

### Step 5

Fix compilation/runtime issues.

### Step 6

Test the relevant API or UI flow.

### Step 7

Report:

```text
Completed
Tests passed
Known issues
Next logical phase
```

Do not mix many unrelated refactors in one change.

---

# 58. IMPORTANT FRONTEND QUALITY BAR

The frontend should no longer look like a plain HTML CRUD demo.

The final UI should feel like a coherent SaaS product.

Every major page should have:

```text
Page Header
    ↓
Context / Description
    ↓
Primary Action
    ↓
Main Content Card(s)
    ↓
Data / Empty / Loading / Error States
```

For example:

```text
Internship Opportunities

Find an internship opportunity for the current internship period.

[ + Create Opportunity ]

┌───────────────────────────────────────────────┐
│ Java Backend Developer                        │
│ Company ABC                                   │
│ Ho Chi Minh City                              │
│                                               │
│ OPEN   3 positions                            │
│                                               │
│ [View details] [Apply]                       │
└───────────────────────────────────────────────┘
```

Use Bootstrap cards, badges, buttons, tables, alerts, and responsive layout utilities.

---

# 59. ACCESSIBILITY AND USABILITY

Frontend components should:

- Use semantic HTML where practical
- Have visible labels
- Keep sufficient contrast
- Use buttons for actions rather than clickable plain text
- Show validation errors clearly
- Preserve keyboard usability where practical
- Avoid relying on color alone for important status information
- Provide meaningful empty/loading/error states

---

# 60. DO NOT OVERDESIGN

Modern SaaS UI does not mean adding visual effects everywhere.

Avoid:

- Huge hero sections on management pages
- Decorative gradients with no purpose
- Excessive animations
- Complex charts for simple data
- Excessive icons
- Too many cards for small amounts of data

Prioritize:

```text
Clarity
Consistency
Responsiveness
Usability
Maintainability
```

---

# 61. SUMMARY FOR COPILOT

The project is already partially implemented.

### Already exists

```text
Keycloak Authentication
Role-based Authorization
User Service
Student Profile
Lecturer Profile
Company Profile
Current User API
Internship Service
Work Plan
Task
Internship Log
Company Evaluation
Lecturer Evaluation
Final Score
React + TypeScript + Vite
Role-based Dashboards
REST API Clients
```

### Main architectural change required

Replace the old direct internship creation flow with:

```text
InternshipPeriod
        ↓
InternshipPeriodLecturer
        ↓
InternshipOpportunity
        ↓
InternshipRegistration
        ↓
WorkPlan
        ↓
Task
        ↓
InternshipLog
        ↓
CompanyEvaluation
        ↓
LecturerEvaluation
```

### Critical identity rule

```text
studentId
    ← JWT

companyId
    ← Opportunity

periodId
    ← Opportunity

lecturerId
    ← Period Lecturer Assignment
```

Student must not manually submit:

```text
companyId
lecturerId
periodId
```

### Frontend requirement

Use:

```text
React + TypeScript + Vite
+
Bootstrap 5
+
Modern SaaS UI
+
Responsive Design
+
Reusable Components
```

The objective is a maintainable, secure, role-aware internship management platform rather than a simple CRUD interface.

---

# 62. FINAL INSTRUCTION

**Read this entire document together with the current source code before making changes.**

Do not assume the project is empty.

Do not assume the old Internship implementation should simply be deleted.

Do not reset the database.

Do not create duplicate domain models without analysis.

Do not trust client-provided ownership IDs.

Use the new business workflow as the source of truth.

Use Bootstrap 5 and Modern SaaS UI for all new or significantly revised frontend screens.

Before a large refactor, provide the analysis and file-change plan first.
