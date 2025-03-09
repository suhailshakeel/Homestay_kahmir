import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreateAd from './pages/CreateAd';
import Profile from './pages/Profile';
import Transactions from './pages/Transactions';
import Rooms from './pages/Rooms';
import BookingPage from './pages/BookingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Refund from './pages/RefundPolicy';
import Privacy from './pages/Privacy';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import 'react-toastify/dist/ReactToastify.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <ScrollToTop />
          <Header />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/book/:roomId" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <BookingPage />
                </ProtectedRoute>
              } />

              <Route path="/transactions" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Transactions />
                </ProtectedRoute>
              } />

              <Route path="/create-ad" element={
                <ProtectedRoute allowedRoles={['home-stayer']}>
                  <CreateAd />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
