import { useEffect, useState } from 'react';
import { BookOpen, Users, ClipboardList, TrendingUp, Building2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getInstituteOverview, type InstituteOverview } from '../../lib/data';
import { Card, PageHeader, Spinner } from '../../components/ui';
import type { View } from '../../components/Shell';

export default function InstituteDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { profile } = useAuth();
  const [overview, setOverview] = useState<InstituteOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.institute_id) {
      setLoading(false);
      return;
    }
    getInstituteOverview(profile.institute_id).then((o) => {
      setOverview(o);
      setLoading(false);
    });
  }, [profile?.institute_id]);

  if (loading) return <div className="flex justify-center py-24"><Spinner className="h-6 w-6 text-brand-600" /></div>;

  if (!overview) {
    return <PageHeader title="Institute dashboard" description="No institute found for this account." />;
  }

  const stats = [
    { label: 'Students enrolled', value: overview.studentCount, icon: <Users className="h-5 w-5" />, view: 'roster' as View },
    { label: 'Courses', value: overview.subjectCount, icon: <BookOpen className="h-5 w-5" />, view: 'subjects' as View },
    { label: 'Total attempts', value: overview.totalAttempts, icon: <ClipboardList className="h-5 w-5" />, view: 'leaderboard' as View },
    { label: 'Avg score', value: `${overview.avgPct}%`, icon: <TrendingUp className="h-5 w-5" />, view: 'leaderboard' as View },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"><Building2 className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{overview.institute.name}</h1>
          <p className="text-sm text-slate-500">Institute dashboard — student management, courses, and performance analytics.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
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
    </div>
  );
}
