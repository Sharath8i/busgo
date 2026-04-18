# BusGo — Full-Stack Bus Booking Platform

> A production-ready MERN application with premium editorial UI inspired by the Stitch AI design system.

---

## Tech Stack

| Layer    | Technology                                        |
|----------|---------------------------------------------------|
| Frontend | React 18 + Vite, Tailwind CSS, Redux Toolkit      |
| Backend  | Node.js + Express.js, MongoDB + Mongoose          |
| Auth     | JWT (access + refresh tokens), bcryptjs           |
| Payments | Razorpay integration                              |
| Other    | QR Code, PDF ticket generation, Nodemailer        |

---

## Project Structure

```
busgo/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # Global common components (Button, Input, Card, Badge)
│   │   ├── features/         # Domain-driven architecture modules / slices
│   │   │   ├── admin/        # Admin dashboard tools and components
│   │   │   ├── auth/         # Login, Registration, and Auth API
│   │   │   ├── booking/      # Ticket booking, checkout, and seat selection
│   │   │   ├── operator/     # Operator-specific workflows
│   │   │   └── search/       # Route searching and home page
│   │   ├── layouts/          # MainLayout, SidebarLayout
│   │   ├── redux/            # Global store initialization
│   │   ├── utils/            # formatting and helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── tailwind.config.js
│
└── server/                   # Express backend
    ├── src/
    │   ├── config/           # Database config
    │   ├── features/         # Domain-driven backend modular features
    │   ├── middlewares/      # auth check, error handling filters
    │   ├── models/           # Mongoose schemas (User, Trip, Booking)
    │   └── utils/            # Utilities
    ├── seed_karnataka.js     # Core seed schema for the application
    ├── server.js
    └── .env
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`
  - Install: https://www.mongodb.com/try/download/community
  - Start: `mongod` or via MongoDB Compass

### 1. Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 2. Configure Environment

**`server/.env`** (already created — review and fill in real keys):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/busgo
JWT_SECRET=replace_with_strong_random_string
JWT_REFRESH_SECRET=replace_with_different_strong_string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**`client/.env`**:
```env
VITE_API_BASE_URL=/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- 3 demo users (admin, operator, passenger)
- 4 buses across multiple routes
- 8 schedules running daily
- Trips for today + 7 days ahead
- 3 coupons: `BUSGO10`, `FLAT50`, `NEWUSER`

### 4. Start Servers

```bash
# Terminal 1 — Backend
cd server
node server.js
# or: npm run dev (with nodemon)

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173**

---

## Demo Credentials

| Role      | Email                    | Password   |
|-----------|--------------------------|------------|
| Passenger | passenger@busgo.test     | Test@1234  |
| Operator  | operator@busgo.test      | Test@1234  |
| Admin     | admin@busgo.test         | Test@1234  |

---

## Demo Coupons

| Code      | Type       | Discount            |
|-----------|------------|---------------------|
| BUSGO10   | Percentage | 10% (max ₹200)      |
| FLAT50    | Flat       | ₹50 off             |
| NEWUSER   | Percentage | 15% (max ₹300)      |

---

## API Endpoints

| Method | Endpoint                             | Auth     | Description            |
|--------|--------------------------------------|----------|------------------------|
| POST   | /api/v1/auth/register                | —        | Register user          |
| POST   | /api/v1/auth/login                   | —        | Login                  |
| POST   | /api/v1/auth/logout                  | Bearer   | Logout                 |
| POST   | /api/v1/auth/refresh-token           | Cookie   | Refresh access token   |
| GET    | /api/v1/search/buses                 | —        | Search buses           |
| GET    | /api/v1/search/cities                | —        | Autocomplete cities    |
| GET    | /api/v1/search/trips/:id/seats       | —        | Get seat map           |
| POST   | /api/v1/search/trips/:id/hold-seats  | Bearer   | Hold seats             |
| DELETE | /api/v1/search/trips/:id/release-seats | Bearer | Release seats          |
| POST   | /api/v1/bookings                     | Bearer   | Create booking         |
| GET    | /api/v1/bookings/my                  | Bearer   | My bookings            |
| GET    | /api/v1/bookings/:id                 | Bearer   | Get booking detail     |
| POST   | /api/v1/bookings/:id/cancel          | Bearer   | Cancel booking         |
| POST   | /api/v1/payments/create-order        | Bearer   | Create Razorpay order  |
| POST   | /api/v1/payments/verify              | Bearer   | Verify payment         |
| GET    | /api/v1/operator/buses               | Operator | List operator buses    |
| GET    | /api/v1/operator/bookings            | Operator | Operator bookings      |
| GET    | /api/v1/operator/revenue             | Operator | Revenue report         |
| GET    | /api/v1/admin/users                  | Admin    | List users             |
| GET    | /api/v1/admin/operators              | Admin    | List operators         |

---

## Design System (from Stitch AI)

**Theme:** "The Kinetic Editorial" — premium intercity travel aesthetic

| Token         | Value     | Usage                      |
|---------------|-----------|----------------------------|
| brand-mid     | #1D4ED8   | Primary buttons, links     |
| brand         | #0037b0   | Dark primary               |
| accent-orange | #F97316   | CTAs, "Pay Now"            |
| surface       | #faf8ff   | Page background            |
| on-surface    | #1a1b23   | Primary text               |

**Fonts:** Manrope (headings) + Inter (body)  
**Roundness:** 12px base, 24px for large CTAs  
**Shadows:** Tonal (no hard black shadows)

---

## End-User Portals & Feature Pages

| Route                      | Entry Component              | Domain   | Authentication Requirement |
|----------------------------|------------------------------|----------|----------------------------|
| `/`                        | `HomePage.jsx`               | search   | —                          |
| `/search`                  | `SearchPage.jsx`             | search   | —                          |
| `/seats/:tripId`           | `SeatSelectionPage.jsx`      | booking  | —                          |
| `/checkout/:tripId`        | `CheckoutPage.jsx`           | booking  | Passenger                  |
| `/booking-confirm/:id`     | `ConfirmPage.jsx`            | booking  | Passenger                  |
| `/my-bookings`             | `MyBookingsPage.jsx`         | booking  | Passenger                  |
| `/login`                   | `LoginPage.jsx`              | auth     | —                          |
| `/register`                | `RegisterPage.jsx`           | auth     | —                          |
| `/operator`                | `OperatorDashboardPage.jsx`  | operator | Operator                   |
| `/admin`                   | `AdminDashboardPage.jsx`     | admin    | Admin                      |
