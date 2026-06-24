# Deployment & Handover Documentation
## Toronto Island Ferry & Parks Platform (PF&R)

This document outlines the technical architecture, setup instructions, database management, and deployment guidelines for the redesigned **Toronto Island Ferry & Parks** portal for the **Toronto Government Parks, Forestry & Recreation (PF&R)** department.

---

## 🛠️ Technical Stack Overview
* **Framework**: Next.js 14.2.35 (React 18, App Router layout structure)
* **Localization**: `next-intl` (Bilingual support for English `/en` and French `/fr`)
* **Styling**: Tailwind CSS v3 with dynamic HSL color mappings (Light & Dark theme variables) and Radix/shadcn UI components
* **Database**: SQLite (managed via Prisma ORM v5.22.0)
* **Real-time**: Server-Sent Events (SSE) stream for schedule and alert notifications
* **Authentication**: JWT-based cookie session state (`jose` library)

---

## 🏗️ Folder Structure
```text
├── messages/               # Bilingual translation files (en.json, fr.json)
├── prisma/                 # Database schema models and seeding scripts
│   ├── dev.db              # SQLite development database file
│   ├── schema.prisma       # Prisma database schema definition
│   └── seed.ts             # Seeding file for Toronto terminals, ferries, and users
├── src/
│   ├── app/                # Next.js App Router folders
│   │   ├── api/            # REST API endpoints (schedules, bookings, auth, maintenance)
│   │   └── [locale]/       # Localized pages (Public, Account, and Admin Dashboards)
│   ├── components/         # Reusable UI component blocks (headers, maps, alert banners)
│   ├── hooks/              # SSE client listener hooks
│   └── lib/                # Shared utilities (db, auth, jwt, analytics)
├── next.config.mjs         # Standalone build config and dev cache overrides
└── tailwind.config.ts      # HSL color variables and font families mapping
```

---

## 📦 Local Setup & Installation

### 1. Prerequisites
Ensure you have **Node.js (v18 or higher)** and **npm** installed on your system.

### 2. Install Dependencies
Initialize package packages and configurations:
```bash
npm install
```

### 3. Setup Database Schema
Create the local SQLite database file and sync schema definitions:
```bash
npx prisma db push
```

### 4. Database Seeding
Populate the database with Toronto terminals, ferries, schedules, users, and maintenance requests:
```bash
npx prisma db seed
```

### 5. Running the Development Server
To start the hot-reloading development server without cache corruption conflicts:
```bash
NEXT_DISABLE_CACHE=1 npm run dev
```
The server will boot and serve pages on **[http://localhost:3000](http://localhost:3000)**.

---

## 🛢️ Database Schema Summary
The database includes the following relational models:
* `User`: Stores citizen and staff details, bcrypt password hashes, and user roles (`citizen`, `staff`, `admin`).
* `Terminal`: Represents ferry terminals (e.g. Jack Layton Ferry Terminal) and their coordinates.
* `Route`: Connects origin and destination terminals.
* `Ferry`: Represents ferry ships, capacities, and operational statuses.
* `Schedule`: Manages ferry timetables, boarding statuses, and remaining seat capacities.
* `Booking`: Tracks confirmed tickets, passenger counts, guest emails, and QR code tokens.
* `MaintenanceRequest`: Manages reported mechanical issues, reported facility names, and assignee mechanics.
* `Alert`: Safety alerts targeted to specific routes with severity levels (`critical`, `warning`, `info`).
* `Announcement`: Multilingual CMS updates published by staff.
* `AnalyticsEvent`: Tracks page views, searches, and booking events for KPI metrics.
* `AuditLog`: Logs structural actions executed by administrative staff.

---

## 🚀 Production Build & Deployment

To compile the optimized, production-ready standalone build bundle:
```bash
npm run build
```

This generates compiled code under the `.next` directory. Start the production Node server:
```bash
npm run start
```

### Handover Best Practices:
* **Database Updates**: Ensure migrations are executed via `npx prisma migrate deploy` in production pipelines instead of `db push`.
* **JWT Secret**: Configure a secure `JWT_SECRET` environment variable in production `.env` files to replace the default dev credentials.
