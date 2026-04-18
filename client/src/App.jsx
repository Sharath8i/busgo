import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import BookingConfirm from './pages/BookingConfirm';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Destinations from './pages/Destinations';
import Offers from './pages/Offers';


// Auth pages get no Navbar/Footer — they have their own split layout
const AUTH_PATHS = ['/login', '/register'];

// Dashboard pages get no Footer
const DASHBOARD_PATHS = ['/operator', '/admin'];

export default function App() {
  const { pathname } = useLocation();
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isDashboard = DASHBOARD_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuth && !isDashboard && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/seats/:tripId" element={<SeatSelection />} />


          <Route
            path="/checkout"
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

          <Route
            path="/offers"
            element={
              <div className="min-h-screen pt-32 pb-20 bg-surface-alt">
                <div className="mx-auto max-w-5xl px-6">
                  <div className="card text-center py-20 bg-primary shadow-2xl">
                    <div className="h-20 w-20 bg-white/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-8">🎁</div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Exclusive Offers</h1>
                    <p className="mt-4 text-primary-light font-bold uppercase tracking-widest text-xs">Unlock premium discounts for your next transit.</p>
                    <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto px-6">
                       {[10, 20, 30].map(d => (
                         <div key={d} className="bg-white p-6 rounded-2xl border-b-4 border-primary-dark">
                            <p className="text-3xl font-black text-primary">{d}% OFF</p>
                            <p className="text-[10px] font-black text-text-muted uppercase mt-2">CODE: BUSGO{d}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
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
      </main>

      {!isAuth && !isDashboard && <Footer />}
    </div>
  );
}
