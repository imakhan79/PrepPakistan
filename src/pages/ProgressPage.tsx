import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getProgressSummary } from '../lib/data';
import { PageHeader, Card, Spinner, EmptyState } from '../components/ui';
import type { ProgressSummary } from '../lib/types';

export default function ProgressPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<ProgressSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    getProgressSummary(profile.id).then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, [profile?.id]);

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-brand-600" /></div>;
  }

  const attempted = rows.filter((r) => r.attempts > 0);

  return (
    <div>
      <PageHeader title="Your progress" description="Track how you're doing across every subject." />
      {attempted.length === 0 ? (
        <EmptyState icon={<TrendingUp className="h-10 w-10" />} title="No attempts yet" description="Take a quiz or mock exam to start tracking your progress." />
      ) : (
        <div className="space-y-3">
          {attempted.map((r) => (
            <Card key={r.subject_id} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{r.subject_title}</h3>
                  <p className="text-sm text-slate-500">{r.attempts} attempt{r.attempts !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-2xl font-extrabold text-brand-600">{r.average_score}%</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${r.average_score}%` }} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
