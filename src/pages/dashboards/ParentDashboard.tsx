import { useEffect, useState } from 'react';
import { Baby, ArrowRight, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { listMyChildRequests, getProgressSummary, listAttemptsForStudent } from '../../lib/data';
import { Card, PageHeader, Spinner, Badge } from '../../components/ui';
import type { View } from '../../components/Shell';
import type { ChildRequest } from '../../lib/types';

interface ChildStats {
  attempts: number;
  avgPct: number;
}

export default function ParentDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [stats, setStats] = useState<Record<string, ChildStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const reqs = await listMyChildRequests(profile.id);
      setRequests(reqs);
      const approved = reqs.filter((r) => r.status === 'approved');
      const entries = await Promise.all(
        approved.map(async (r) => {
          const [attempts, progress] = await Promise.all([listAttemptsForStudent(r.student.id), getProgressSummary(r.student.id)]);
          const withAttempts = progress.filter((p) => p.attempts > 0);
          const avgPct = withAttempts.length ? Math.round(withAttempts.reduce((a, b) => a + b.average_score, 0) / withAttempts.length) : 0;
          return [r.student.id, { attempts: attempts.length, avgPct }] as const;
        })
      );
      setStats(Object.fromEntries(entries));
      setLoading(false);
    })();
  }, [profile?.id]);

  if (loading) return <div className="flex justify-center py-24"><Spinner className="h-6 w-6 text-brand-600" /></div>;

  const approvedChildren = requests.filter((r) => r.status === 'approved');

  return (
    <div>
      <PageHeader title={`Welcome back, ${profile?.full_name?.split(' ')[0] ?? ''}`} description="Keep an eye on your child's learning progress." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button onClick={() => onNavigate('children')} className="text-left">
          <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Baby className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{approvedChildren.length}</p>
                <p className="text-sm text-slate-500">Linked children</p>
              </div>
            </div>
          </Card>
        </button>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your children</h2>
          <button onClick={() => onNavigate('children')} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {requests.length === 0 ? (
          <Card className="p-5 text-sm text-slate-500">No children linked yet. Go to "Manage" to send a link request by email.</Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((r) => {
              const s = stats[r.student.id];
              return (
                <Card key={r.linkId} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{r.student.full_name}</p>
                      <p className="text-sm text-slate-500">{r.student.email}</p>
                    </div>
                    {r.status !== 'approved' && (
                      <Badge tone={r.status === 'pending' ? 'accent' : 'red'}>{r.status === 'pending' ? 'Awaiting approval' : 'Declined'}</Badge>
                    )}
                  </div>
                  {r.status === 'approved' && s && (
                    <div className="mt-3 flex gap-4 border-t border-slate-100 pt-3 text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500"><Trophy className="h-4 w-4" /> {s.attempts} attempts</span>
                      <span className="flex items-center gap-1.5 text-slate-500"><TrendingUp className="h-4 w-4" /> {s.avgPct}% avg</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
