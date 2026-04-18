# 🚌 BusGo: Premium MERN Bus Booking Platform

BusGo is a production-grade, full-stack bus reservation system built with the MERN stack (MongoDB, Express, React, Node.js). It features a state-of-the-art **Wallet Ecosystem**, dynamic seating management, and a high-fidelity user interface.

---

## 🎭 Role-Based Access Control (RBAC)

The system is strictly partitioned into three distinct operational roles:

### 1. 🛡️ Admin (`admin`)
*   **Access**: Full control via the Admin Portal.
*   **Capabilities**:
    *   Monitor global booking metrics and revenue.
    *   Manage the network of Routes, Buses, and active Trips.
    *   Issue manual refunds and manage the user ledger.
*   **Default Creds**: `admin@busgo.test` / `Test@1234`

### 2. 🚛 Operator (`operator`)
*   **Access**: Dedicated Operator Dashboard.
*   **Capabilities**:
    *   Manage specific bus fleets assigned to them.
    *   Monitor passenger manifests for upcoming journeys.
    *   Handle logistics for assigned schedules.

### 3. 👤 Passenger (`passenger`)
*   **Access**: The primary consumer portal.
*   **Capabilities**:
    *   **Search**: Dynamic city-to-city searching with date-based filtering.
    *   **Select**: Interactive seating map with real-time seat holding (10-minute lock).
    *   **Book**: Seamless checkout via Razorpay or internal **BusGo Wallet**.
    *   **Manage**: Cancel tickets with **automatic instant wallet refunds**.

---

## 💰 The Wallet Ecosystem

BusGo implements a custom financial ledger system:

1.  **Instant Refunds**: When a user cancels a ticket, the system automatically calculates the refund (based on time to departure) and deposits the credits into the user's `walletBalance`.
2.  **Wallet Checkout**: Users can pay for new bookings using their wallet balance. This is a **0-Gateway transaction**, bypassing external banks and processing instantly.
3.  **Audit Trail**: Every wallet interaction creates a `Payment` record in the database for financial transparency.

---

## 🚀 Deployment Guide

### A. Backend (Node.js/Express)
1.  **Environment Variables**: Create a `.env` in the `server` folder:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_atlas_uri
    JWT_SECRET=your_secret_key
    RAZORPAY_KEY_ID=your_key
    RAZORPAY_KEY_SECRET=your_secret
    EMAIL_USER=your_gmail
    EMAIL_PASS=your_app_password
    ```
2.  **Seed Data**: Run `node seed_destinations.js` to populate the network.
3.  **Host**: Deploy to platforms like **Render**, **Railway**, or **Heroku**.

### B. Frontend (React/Vite)
1.  **Environment Variables**: Create a `.env` in the `client` folder:
    ```env
    VITE_API_URL=https://your-backend-url.com/api/v1
    VITE_RAZORPAY_KEY_ID=your_key
    ```
2.  **Build**: Run `npm run build`.
3.  **Host**: Deploy the `dist` folder to **Vercel**, **Netlify**, or **Firebase Hosting**.

---

## 🛠️ Technical Architecture

*   **Frontend**: React 18, Redux Toolkit (State), Tailwind CSS (Premium Styling).
*   **Backend**: Node.js, Express, Mongoose (Modeling).
*   **Database**: MongoDB (NoSQL).
*   **Payments**: Razorpay API + Custom Wallet Logic.
*   **Security**: JWT Authentication, Bcrypt password hashing, and CORS protection.

---

## 📝 Usage for New Users

1.  **Register/Login**: Start by creating an account.
2.  **Search**: Pick any of the 15 major cities (e.g., Bangalore, Mysore, Goa).
3.  **Seat Hold**: Once you pick a seat, it is "Held" for 10 minutes. If you don't pay by then, it releases back to the public.
4.  **Confirm**: View your ticket in the **My Bookings** tab. Use the PNR for tracking.
