import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlannerPage } from './pages/PlannerPage';
import { AssistantPage } from './pages/AssistantPage';
import { IndoorAirPage } from './pages/IndoorAirPage';
import { CommunityPage } from './pages/CommunityPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { InsightsPage } from './pages/InsightsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Logo } from './components/ui/Logo';
import {
  User,
  LogOut,
  Calendar,
  Bot,
  LayoutDashboard,
  Home,
  Users,
  Sliders,
  Award,
  Menu,
  X,
} from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AuthenticatedHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/planner', label: 'AI Planner', icon: Calendar },
    { to: '/indoor-air', label: 'Indoor', icon: Home },
    { to: '/simulator', label: 'Simulator', icon: Sliders },
    { to: '/community', label: 'Community', icon: Users },
    { to: '/insights', label: 'Insights', icon: Award },
    { to: '/assistant', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <header className="border-b border-sage/30 bg-ivory/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="shrink-0 flex items-center">
          <Link to="/dashboard">
            <Logo size="sm" showSubtitle={false} />
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar with pill container */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/80 px-2 py-1.5 rounded-full border border-sage/30 shadow-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-forest text-ivory shadow-xs'
                    : 'text-charcoal/75 hover:text-forest hover:bg-forest/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: User Profile & Logout (Desktop) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <Link
            to="/profile"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-semibold ${
              location.pathname === '/profile'
                ? 'bg-forest/10 border-forest/30 text-forest'
                : 'border-sage/30 text-charcoal/80 hover:bg-white hover:text-forest'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-forest text-ivory flex items-center justify-center text-[10px] font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="truncate max-w-[120px]">{user?.name?.split(' ')[0] || 'Profile'}</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-charcoal/60 hover:text-red-700 hover:bg-red-50 transition"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-forest hover:bg-forest/5 border border-sage/30 transition"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sage/20 bg-ivory px-4 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-forest text-ivory'
                      : 'bg-white text-charcoal/80 border border-sage/20 hover:border-forest/30'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-sage/20 flex items-center justify-between text-xs">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 font-semibold text-forest"
            >
              <User className="w-4 h-4" />
              <span>{user?.name || 'My Profile'}</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="text-red-600 font-semibold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route
                path="/dashboard"
                element={
                  <div className="min-h-screen bg-ivory flex flex-col">
                    <AuthenticatedHeader />
                    <main className="flex-1">
                      <DashboardPage />
                    </main>
                  </div>
                }
              />
              <Route
                path="/planner"
                element={
                  <div className="min-h-screen bg-ivory flex flex-col">
                    <AuthenticatedHeader />
                    <main className="flex-1">
                      <PlannerPage />
                    </main>
                  </div>
                }
              />
              <Route
                path="/indoor-air"
                element={
                  <div className="min-h-screen bg-ivory flex flex-col">
                    <AuthenticatedHeader />
                    <main className="flex-1">
                      <IndoorAirPage />
                    </main>
                  </div>
                }
              />
              <Route
                path="/simulator"
                element={
                  <div className="min-h-screen bg-ivory flex flex-col">
                    <AuthenticatedHeader />
                    <main className="flex-1">
                      <SimulatorPage />
                    </main>
                  </div>
                }
              />
              <Route
                path="/community"
                element={
                  <div className="min-h-screen bg-ivory flex flex-col">
                    <AuthenticatedHeader />
                    <main className="flex-1">
                      <CommunityPage />
                    </main>
                  </div>
                }
              />
              <Route
                path="/insights"
                element={
                  <div className="min-h-screen bg-ivory flex flex-col">
                    <AuthenticatedHeader />
                    <main className="flex-1">
                      <InsightsPage />
                    </main>
                  </div>
                }
              />
              <Route
                path="/assistant"
                element={
                  <div className="min-h-screen bg-ivory flex flex-col">
                    <AuthenticatedHeader />
                    <main className="flex-1">
                      <AssistantPage />
                    </main>
                  </div>
                }
              />
              <Route
                path="/profile"
                element={
                  <div className="min-h-screen bg-ivory flex flex-col">
                    <AuthenticatedHeader />
                    <main className="flex-1">
                      <ProfilePage />
                    </main>
                  </div>
                }
              />
            </Route>

            {/* 404 Catch-All Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
