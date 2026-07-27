import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SubjectsPage from './pages/SubjectsPage';
import ProgressPage from './pages/ProgressPage';
import LeaderboardPage from './pages/LeaderboardPage';
import UsersPage from './pages/UsersPage';
import Shell, { View } from './components/Shell';
import { Spinner } from './components/ui';

function AppInner() {
  const { session, profile, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [active, setActive] = useState<View>('dashboard');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  if (!session || !profile) {
    return showAuth ? <AuthPage onBack={() => setShowAuth(false)} /> : <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <Shell active={active} onNavigate={setActive}>
      {active === 'dashboard' && <DashboardPage onNavigate={setActive} />}
      {active === 'subjects' && <SubjectsPage />}
      {active === 'progress' && <ProgressPage />}
      {active === 'leaderboard' && <LeaderboardPage />}
      {active === 'users' && <UsersPage />}
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
