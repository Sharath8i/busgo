# 🎓 BusGo: Technical Presentation Guide

This document is designed to assist you during your project viva/presentation. It breaks down the system into professional grading criteria.

---

## 1. 📝 Executive Summary
**BusGo** is a high-performance MERN-stack application that centralizes the bus booking lifecycle. It solves three core problems:
- **Trust**: Using secure Razorpay integration and automated PNR generation.
- **Liquidity**: Providing a native wallet for instant refunds, reducing friction in cancellations.
- **UX**: A real-time seat mapping system that mirrors actual bus layouts.

---

## 2. 🔐 Login & Role-Based Access — Unified System Design

We implemented a **single unified login system** for all user roles—**Passenger, Operator, and Admin**—to reduce technical debt and maximize security.

### 🎯 Core Engineering Concept
*   **Single Entry Point**: There is only **one login page** (`/login`). The system automatically identifies the user's role from the database upon authentication.
*   **Server-Side Role Resolution**: The user doesn't select their role in the UI; the backend securely injects the role into the **JWT (JSON Web Token)**.
*   **Dynamic Redirection**: After a successful login, the frontend uses an intelligent `useEffect` hook to navigate the user to their specific dashboard (`/admin`, `/operator`, or `/`).

### 🛡️ Access Control Matrix
| Role | Registration | Logic |
| :--- | :--- | :--- |
| **Passenger** | Public Signup | Self-registers via `/register`. Default `status: approved`. |
| **Operator** | Admin Invited | Created by Admin only. **Restricted from public signup.** |
| **Admin** | System Created | Pre-seeded or created via internal CLI. |

### 🚫 Operator Verification Gate
For maximum security, Operators are subject to a **Secondary Status Check** during login:
```javascript
if (user.role === "operator" && user.status !== "approved") {
  return res.status(403).json({ message: "Operator not approved" });
}
```
This ensures that even if an operator account is compromised or "stuck" in a pending state, they cannot access sensitive fleet data without a physical "Approved" flag from the System Administrator.

---

## 3. 🏗️ System Architecture (Deep Dive)

### Frontend (User Interface)
- **Framework**: React 18 (Vite-powered for high speed).
- **State Management**: **Redux Toolkit**. We chose Redux for the Wallet and Auth state to ensure consistency across separate pages (Profile, Home, Checkout).
- **Navigation**: React Router 6 with Protected Routes (prevents passengers from accessing `/admin`).

### Backend (Business Logic)
- **Runtime**: Node.js with the Express framework.
- **Validation**: Joi/Middleware validation for all user inputs (emails, phone numbers, seat digits).
- **Middleware**: Custom `authMiddleware` that decodes JWTs and injects `req.user` into every request.

### Database (Persistence)
- **MongoDB**: Used for its flexible schema (perfect for fluctuating seat numbers and trip logs).
- **Population**: Deep-population logic allows us to fetch a `Booking`, then the `Trip`, then the `Schedule`, and finally the `Bus` in a single query chain for the user.

---

## 3. 🛡️ Key Security Features
- **Bcrypt**: One-way salt-hashing for passwords.
- **JWT**: Stateless session management (no need for session cookies, making it scalable).
- **Cross-Origin Resource Sharing (CORS)**: Configured to only allow requests from our trusted frontend.

---

## 4. 💰 The "Refund & Wallet" Logic (The Algorithm)
"The most complex part of our code is the cancellation algorithm in `booking.controller.js`:"
1.  **Time Delta**: It calculates `DepartureTime - CurrentTime`.
2.  **Logic**: 
    -   > 24 hours: 100% Refund.
    -   4-24 hours: 50% Refund.
    -   < 4 hours: 0% Refund.
3.  **Settlement**: Instead of communicating with the bank (which takes days), we execute a **Database Transaction** that moves the digital credits into the user's `walletBalance`.

---

## 5. 🔮 Future Enhancements (Final Slide)
- **Real-time GPS Tracking**: Integrating Google Maps API to track the live location of the bus.
- **Dynamic Pricing**: AI-based pricing that increases when seats are low (Demand-based).
- **SMS Integration**: Twilio API for sending tickets via SMS.

---

## 🚦 Quick Setup for Demo
1.  **Admin Login**: `admin@busgo.test` / `Test@1234`
2.  **Wallet Test**: Register a new user, book a ticket, then go to "My Bookings" and cancel it to see the wallet balance increase.
3.  **Bus Network**: We have pre-seeded 15 major routes (Goa, Bangalore, Chennai, etc.) for instant testing.
