import { useEffect, useState } from 'react';
import { TrendingUp, Award, Star, Flame, Target, CalendarCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getProgressSummary, listAttemptsForStudent } from '../lib/data';
import { PageHeader, Card, Spinner, EmptyState } from '../components/ui';
import type { ProgressSummary, QuizAttempt } from '../lib/types';

interface Achievement {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
}

function computeAchievements(attempts: QuizAttempt[], progress: ProgressSummary[]): Achievement[] {
  const distinctDays = new Set(attempts.map((a) => a.started_at.slice(0, 10))).size;
  const hasPerfect = attempts.some((a) => a.total > 0 && a.score === a.total);
  const hasSubjectMastery = progress.some((p) => p.attempts >= 3 && p.average_score >= 80);

  return [
    { key: 'first', title: 'First Steps', description: 'Complete your first quiz', icon: <Star className="h-5 w-5" />, earned: attempts.length >= 1 },
    { key: 'ten', title: 'Quiz Whiz', description: 'Complete 10 quizzes', icon: <Award className="h-5 w-5" />, earned: attempts.length >= 10 },
    { key: 'perfect', title: 'Perfectionist', description: 'Score 100% on any quiz', icon: <Target className="h-5 w-5" />, earned: hasPerfect },
    { key: 'master', title: 'Subject Master', description: '80%+ average in a subject (3+ attempts)', icon: <Flame className="h-5 w-5" />, earned: hasSubjectMastery },
    { key: 'consistent', title: 'Consistent Learner', description: 'Practice on 3 different days', icon: <CalendarCheck className="h-5 w-5" />, earned: distinctDays >= 3 },
  ];
}

export default function ProgressPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<ProgressSummary[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    Promise.all([getProgressSummary(profile.id), listAttemptsForStudent(profile.id)]).then(([prog, atts]) => {
      setRows(prog);
      setAttempts(atts);
      setLoading(false);
    });
  }, [profile?.id]);

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-brand-600" /></div>;
  }

  const attempted = rows.filter((r) => r.attempts > 0);
  const achievements = computeAchievements(attempts, rows);

  return (
    <div>
      <PageHeader title="Your progress" description="Track how you're doing across every subject." />

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Achievements</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <Card key={a.key} className={`p-4 ${a.earned ? '' : 'opacity-40'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.earned ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                  {a.icon}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <h2 className="mb-3 text-lg font-bold text-slate-900">By subject</h2>
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
