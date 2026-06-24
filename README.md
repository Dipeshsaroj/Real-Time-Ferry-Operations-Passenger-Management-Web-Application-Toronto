# Toronto Island Ferry & Parks (PF&R) Operations Platform

This is the official full-stack digital operations platform for the **Toronto Parks, Forestry & Recreation (PF&R)** department, replacing legacy systems with a responsive, real-time, highly accessible portal for managing Toronto Island ferry transit, terminal operations, park permits, and maintenance requests.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **ORM & Database**: [Prisma ORM](https://www.prisma.io/) with [SQLite](https://www.sqlite.org/) (for local development)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) (using Base UI components)
- **Real-Time Integration**: Server-Sent Events (SSE) stream for instant schedules and safety notices
- **Internationalization (i18n)**: [next-intl](https://next-intl-docs.vercel.app/) supporting **English (en)** and **Français (fr)**
- **State & Query Fetching**: [TanStack React Query v5](https://tanstack.com/query)

---

## ⚙️ Getting Started & Setup

### 1. Prerequisites
- Node.js version 18.x or 20.x
- npm / yarn / pnpm

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Seeding
Initialize the SQLite local database, push the schema, and seed the default user registry, ferry routes, terminals, schedules, and maintenance requests:
```bash
# Push schema to SQLite local database
npx prisma db push

# Run the seeding script
npx prisma db seed
```

### 4. Run Development Server
```bash
NEXT_DISABLE_CACHE=1 npm run dev
```
Open **[http://localhost:3000/en](http://localhost:3000/en)** in your web browser.

---

## 👥 Demo User Credentials

To test the role-based auth flows (Citizen bookings, Admin controls, Mechanic board, Analytics), use these credentials:

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Citizen / Resident** | `citizen@toronto.ca` | `password123` |
| **Operations Staff** | `staff@toronto.ca` | `password123` |
| **Admin Staff** | `admin@toronto.ca` | `password123` |
| **Senior Director (Management)** | `director@toronto.ca` | `password123` |

---

## 🏗️ Folder Architecture

```text
├── messages/            # i18n Localization files (en.json, fr.json)
├── prisma/              # Prisma configuration, SQLite schema, & seed script
└── src/
    ├── app/             # Next.js App Router folders
    │   ├── api/         # Next.js REST API endpoints
    │   └── [locale]/    # i18n locale sub-router
    │       ├── (admin)  # Gated staff/admin dashboard, analytics, & maintenance board
    │       ├── (auth)   # Login and Register pages
    │       └── (public) # Citizen homepage, booking flow, map, schedules, & maintenance
    ├── components/
    │   ├── blocks/      # Site Header, Site Footer, Map Client, & Alerts Banner
    │   ├── providers/   # Global Intl, Query, and Theme wrappers
    │   └── ui/          # Shadcn UI Base components
    ├── hooks/           # useRealtime SSE custom hook
    └── lib/             # Prisma client, JWT sign/verify, and validators (Zod)
```

---

## 📡 REST API Documentation

### Authentication Layer
- `POST /api/v1/auth/register` - Create a citizen account.
- `POST /api/v1/auth/login` - Sign in (writes session token to cookies).
- `POST /api/v1/auth/logout` - Log out (clears session token).
- `GET /api/v1/auth/me` - Fetch profile metadata for the active session.

### Transit & Booking Operations
- `GET /api/v1/routes` - Fetch all ferry routes, docks, and terminals.
- `GET /api/v1/schedules` - Query schedules by route ID and date.
- `POST /api/v1/bookings` - Submit a booking (requires capacity check transaction).
- `GET /api/v1/bookings/[id]` - Retrieve specific ticket invoice details.

### Service & Maintenance Requests
- `GET /api/v1/maintenance` - Fetch reported maintenance requests.
- `POST /api/v1/maintenance` - Submit a new service ticket (publicly accessible).
- `POST /api/v1/maintenance/[id]/accept` - Assign request to logged-in mechanic/staff.
- `POST /api/v1/maintenance/[id]/complete` - Mark ticket resolved.

### Real-Time Update Stream
- `GET /api/v1/realtime/stream` - Establishes a permanent Server-Sent Events connection. Publishes events when schedules are updated, alerts are posted, or maintenance requests change.

---

## ♿ Accessibility & Standards

- **Keyboard Focus Routing**: Standard Skip to Content navigation is implemented via `#main-content` targets inside all layouts.
- **Dynamic Updates**: Live schedule modifications and safety alerts utilize standard `aria-live` blocks.
- **Language Support**: Seamless toggling between English and French (`fr`) localized messages.

---

## 📈 Expected Impact

- **Improved Citizen Experience**: Residents and tourists can browse live schedules, see interactive terminal coordinates, and book tickets on a single unified platform.
- **Faster Access to Transportation Information**: SSE real-time sync pushes timetable updates and delays instantly to browser clients.
- **Reduced Support Workload**: Integrated self-service permitting and automated digital ticket issuance decrease the load on phone lines and terminal support booths.
- **Modern Digital Presence for PF&R**: High-contrast, dynamic interfaces (light/dark mode toggle) provide a state-of-the-art visual standard matching the City of Toronto.

---

## 🔮 Future Enhancements

- **Personalized User Dashboards**: Commuters can bookmark favorite routes (e.g., Ward's Island) and view customized delays on sign-in.
- **Chatbot Support for Citizens**: AI-powered customer agent to resolve quick ferry queries, booking rules, and ticketing issues.
- **Integration with other Toronto City Services**: Single sign-on (SSO) with Toronto transit cards (PRESTO) to purchase tickets automatically.
- **Progressive Web App (PWA) Support**: Enable offline ticket storage and mobile home-screen installation.
