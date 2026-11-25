import React from 'react';
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
    <header className="border-b border-sage/30 bg-ivory-light/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard">
          <Logo size="md" showSubtitle={false} />
        </Link>

        {/* Middle Navigation for Desktop */}
        <nav className="hidden xl:flex items-center gap-1 bg-white/70 p-1.5 rounded-2xl border border-sage/25 shadow-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-forest text-ivory shadow-xs'
                    : 'text-charcoal/70 hover:text-forest hover:bg-forest/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right User Bar */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link
            to="/profile"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sage/30 transition ${
              location.pathname === '/profile' ? 'bg-forest/10 text-forest font-bold' : 'text-forest/80 hover:bg-ivory'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-charcoal/60 hover:text-red-700 transition px-2 py-1"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
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
