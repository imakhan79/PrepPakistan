import { useEffect, useState } from 'react';
import { BookOpen, Users, ClipboardList, Wallet } from 'lucide-react';
import { getPlatformStats, type PlatformStats } from '../../lib/data';
import { Card, PageHeader, Spinner, Badge } from '../../components/ui';
import type { View } from '../../components/Shell';

const ROLE_LABELS: Record<string, string> = {
  student: 'Students',
  parent: 'Parents',
  teacher: 'Teachers',
  institute_admin: 'Institute admins',
  admin: 'Platform admins',
};

export default function AdminDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformStats().then((s) => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) return <div className="flex justify-center py-24"><Spinner className="h-6 w-6 text-brand-600" /></div>;

  const topStats = [
    { label: 'Total users', value: stats.totalUsers, icon: <Users className="h-5 w-5" />, view: 'users' as View },
    { label: 'Subjects', value: stats.totalSubjects, icon: <BookOpen className="h-5 w-5" />, view: 'subjects' as View },
    { label: 'Quiz attempts', value: stats.totalAttempts, icon: <ClipboardList className="h-5 w-5" />, view: 'leaderboard' as View },
  ];

  return (
    <div>
      <PageHeader title="Platform overview" description="Operations, content, users, and analytics across PrepPakistan." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topStats.map((s) => (
          <button key={s.label} onClick={() => onNavigate(s.view)} className="text-left">
            <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{s.icon}</div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-bold text-slate-900">Users by role</h2>
          <Card className="divide-y divide-slate-100">
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <div key={role} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <Badge tone="slate">{stats.byRole[role] ?? 0}</Badge>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold text-slate-900">Revenue</h2>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><Wallet className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-extrabold text-slate-400">—</p>
                <p className="text-sm text-slate-500">Subscriptions not yet enabled</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
