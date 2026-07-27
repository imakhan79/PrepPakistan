import { useAuth } from '../lib/auth';
import type { View } from '../components/Shell';
import StudentDashboard from './dashboards/StudentDashboard';
import ParentDashboard from './dashboards/ParentDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import InstituteDashboard from './dashboards/InstituteDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

export default function DashboardPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { profile } = useAuth();
  if (!profile) return null;

  switch (profile.role) {
    case 'admin':
      return <AdminDashboard onNavigate={onNavigate} />;
    case 'institute_admin':
      return <InstituteDashboard onNavigate={onNavigate} />;
    case 'teacher':
      return <TeacherDashboard onNavigate={onNavigate} />;
    case 'parent':
      return <ParentDashboard onNavigate={onNavigate} />;
    default:
      return <StudentDashboard onNavigate={onNavigate} />;
  }
}
