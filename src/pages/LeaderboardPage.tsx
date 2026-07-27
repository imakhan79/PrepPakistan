import { useEffect, useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getLeaderboard } from '../lib/data';
import { Card, PageHeader, Spinner, EmptyState } from '../components/ui';
import type { LeaderboardRow } from '../lib/types';

const MEDAL_COLORS = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-brand-600" /></div>;

  return (
    <div>
      <PageHeader title="Leaderboard" description="Top performers ranked by total points earned across all quizzes and mock exams." />
      {rows.length === 0 ? (
        <EmptyState icon={<Trophy className="h-10 w-10" />} title="No rankings yet" description="Complete a quiz to appear on the leaderboard." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Rank</th>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Points</th>
                <th className="px-5 py-3 font-semibold">Attempts</th>
                <th className="px-5 py-3 font-semibold">Avg score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, i) => (
                <tr key={r.student_id} className={r.student_id === profile?.id ? 'bg-brand-50/50' : undefined}>
                  <td className="px-5 py-3 font-bold text-slate-700">
                    {i < 3 ? <Medal className={`h-5 w-5 ${MEDAL_COLORS[i]}`} /> : `#${i + 1}`}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {r.full_name}
                    {r.student_id === profile?.id && <span className="ml-2 text-xs font-semibold text-brand-600">(you)</span>}
                  </td>
                  <td className="px-5 py-3 font-bold text-brand-600">{r.total_score}</td>
                  <td className="px-5 py-3 text-slate-500">{r.total_attempts}</td>
                  <td className="px-5 py-3 text-slate-500">{r.avg_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
