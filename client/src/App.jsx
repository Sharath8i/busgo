import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './features/search/pages/HomePage';
import SearchResults from './features/search/pages/SearchPage';
import SeatSelection from './features/booking/pages/SeatSelectionPage';
import Checkout from './features/booking/pages/CheckoutPage';
import BookingConfirm from './features/booking/pages/ConfirmPage';
import MyBookings from './features/booking/pages/MyBookingsPage';
import Profile from './pages/Profile';
import Login from './features/auth/pages/LoginPage';
import Register from './features/auth/pages/RegisterPage';
import OperatorDashboard from './features/operator/pages/OperatorDashboardPage';
import AdminDashboard from './features/admin/pages/AdminDashboardPage';
import Destinations from './pages/Destinations';
import Offers from './pages/Offers';

import MainLayout from './layouts/MainLayout';
import SidebarLayout from './layouts/SidebarLayout';

const AUTH_PATHS = ['/login', '/register'];
const DASHBOARD_PATHS = ['/operator', '/admin'];

export default function App() {
  const { pathname } = useLocation();
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isDashboard = DASHBOARD_PATHS.some((p) => pathname.startsWith(p));

  const content = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/destinations" element={<Destinations />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/seats/:tripId" element={<SeatSelection />} />

      <Route
        path="/checkout/:tripId"
        element={
          <ProtectedRoute roles={['passenger', 'admin']}>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-confirm/:bookingId"
        element={
          <ProtectedRoute roles={['passenger', 'admin']}>
            <BookingConfirm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute roles={['passenger', 'admin']}>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={['passenger', 'admin', 'operator']}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/operator/*"
        element={
          <ProtectedRoute roles={['operator', 'admin']}>
            <OperatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-alt">
            <p className="text-9xl font-black text-primary/10">404</p>
            <h1 className="text-2xl font-black text-text-main uppercase tracking-tighter">Lost in Transit</h1>
            <p className="text-text-muted text-sm font-medium uppercase tracking-widest">Route Not Found</p>
            <Link to="/" className="btn-primary mt-6 px-10">Back to Base</Link>
          </div>
        }
      />
    </Routes>
  );

  if (isAuth) return content;
  if (isDashboard) return content;

  return <MainLayout>{content}</MainLayout>;
}
