import { useEffect, useState } from 'react';
import { BookOpen, FileText, Video, ClipboardList, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getContentStats, getQuizAuthorPerformance, listStudentRoster, type ContentStats, type PerformanceSummary } from '../../lib/data';
import { Card, PageHeader, Spinner } from '../../components/ui';
import type { View } from '../../components/Shell';

export default function TeacherDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { profile } = useAuth();
  const [content, setContent] = useState<ContentStats | null>(null);
  const [performance, setPerformance] = useState<PerformanceSummary | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [c, p, roster] = await Promise.all([
        getContentStats(profile.id),
        getQuizAuthorPerformance(profile.id),
        listStudentRoster(profile.institute_id),
      ]);
      setContent(c);
      setPerformance(p);
      setStudentCount(roster.length);
      setLoading(false);
    })();
  }, [profile?.id]);

  if (loading || !content || !performance) return <div className="flex justify-center py-24"><Spinner className="h-6 w-6 text-brand-600" /></div>;

  const stats = [
    { label: 'Subjects', value: content.subjects, icon: <BookOpen className="h-5 w-5" />, view: 'subjects' as View },
    { label: 'Students', value: studentCount, icon: <Users className="h-5 w-5" />, view: 'roster' as View },
    { label: 'Attempts on your quizzes', value: performance.totalAttempts, icon: <ClipboardList className="h-5 w-5" />, view: 'subjects' as View },
    { label: 'Avg score on your quizzes', value: `${performance.avgPct}%`, icon: <TrendingUp className="h-5 w-5" />, view: 'leaderboard' as View },
  ];

  const contentCards = [
    { label: 'Notes', value: content.notes, icon: <FileText className="h-5 w-5" /> },
    { label: 'Lectures', value: content.lectures, icon: <Video className="h-5 w-5" /> },
    { label: 'Quizzes', value: content.quizzes, icon: <ClipboardList className="h-5 w-5" /> },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] ?? ''}`}
        description="Manage your content and track how your students are performing."
      />

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

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your content</h2>
          <button onClick={() => onNavigate('subjects')} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            Publish more <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {contentCards.map((c) => (
            <Card key={c.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">{c.icon}</div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{c.value}</p>
                  <p className="text-sm text-slate-500">{c.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
