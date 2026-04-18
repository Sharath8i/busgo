# 🎓 BusGo: Technical Presentation Guide

This document is designed to assist you during your project viva/presentation. It breaks down the system into professional grading criteria.

---

## 1. 📝 Executive Summary
**BusGo** is a high-performance MERN-stack application that centralizes the bus booking lifecycle. It solves three core problems:
- **Trust**: Using secure Razorpay integration and automated PNR generation.
- **Liquidity**: Providing a native wallet for instant refunds, reducing friction in cancellations.
- **UX**: A real-time seat mapping system that mirrors actual bus layouts.

---

## 2. 🎭 Role-Based Access Control (RBAC) Hierarchy

We implemented a strict multi-user hierarchy to ensure data integrity and security across different business functions:

### 🛡️ System Administrator (`admin`)
*   **Responsibility**: Platform oversight and financial reconciliation.
*   **Technical Workflow**: Accesses the global dashboard which uses **MongoDB Aggregation Pipelines** to calculate total platform revenue, booking volume, and user growth. They have the authority to manage global routes and global refund overrides.

### 🚛 Bus Operator (`operator`)
*   **Responsibility**: Fleet and manifest management.
*   **Technical Workflow**: Provided with a restricted dashboard filtered by their **Unique Operator ID**. They can manage their assigned buses, view live passenger manifests (who is sitting in which seat), and update the trip status (e.g., delaying a trip or completing it).

### 👤 Passenger (`passenger`)
*   **Responsibility**: The end-consumer journey.
*   **Technical Workflow**: The most state-heavy role. Passengers interact with the **Dynamic Search Engine** and the **Interactive SVG Seating Map**. Their experience is tied to the **Wallet Ledger**, allowing them to manage their own financial credits through self-service cancellations.

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
