import { useEffect, useState } from 'react';
import { BookOpen, Trophy, TrendingUp, Users as UsersIcon, ArrowRight, Baby, UserCheck, Check, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  listSubjects, listAttemptsForStudent, getProgressSummary,
  listMyChildRequests, listPendingLinkRequests, respondToLinkRequest,
} from '../lib/data';
import { Card, PageHeader, Spinner, Badge, Button } from '../components/ui';
import type { View } from '../components/Shell';
import { isStaffRole } from '../lib/types';
import type { Subject, ProgressSummary, ChildRequest, IncomingLinkRequest } from '../lib/types';

export default function DashboardPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<ProgressSummary[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [childRequests, setChildRequests] = useState<ChildRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<IncomingLinkRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!profile) return;
    const subs = await listSubjects();
    setSubjects(subs);
    if (profile.role === 'student') {
      const [attempts, prog, incoming] = await Promise.all([
        listAttemptsForStudent(profile.id),
        getProgressSummary(profile.id),
        listPendingLinkRequests(profile.id),
      ]);
      setAttemptCount(attempts.length);
      setProgress(prog);
      setIncomingRequests(incoming);
    } else if (profile.role === 'parent') {
      setChildRequests(await listMyChildRequests(profile.id));
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [profile?.id]);

  async function handleRespond(linkId: string, approve: boolean) {
    await respondToLinkRequest(linkId, approve);
    setIncomingRequests((prev) => prev.filter((r) => r.linkId !== linkId));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  const approvedChildren = childRequests.filter((c) => c.status === 'approved');

  const overallAverage = progress.length
    ? Math.round(progress.reduce((a, b) => a + b.average_score, 0) / progress.filter((p) => p.attempts > 0).length || 0)
    : 0;

  const stats = isStaffRole(profile?.role)
    ? [
        { label: 'Subjects', value: subjects.length, icon: <BookOpen className="h-5 w-5" />, view: 'subjects' as View },
        { label: profile?.role === 'admin' ? 'Users' : 'Students', value: '—', icon: <UsersIcon className="h-5 w-5" />, view: (profile?.role === 'admin' ? 'users' : 'roster') as View },
      ]
    : profile?.role === 'parent'
    ? [
        { label: 'Linked children', value: approvedChildren.length, icon: <Baby className="h-5 w-5" />, view: 'children' as View },
      ]
    : [
        { label: 'Subjects available', value: subjects.length, icon: <BookOpen className="h-5 w-5" />, view: 'subjects' as View },
        { label: 'Quizzes attempted', value: attemptCount, icon: <Trophy className="h-5 w-5" />, view: 'progress' as View },
        { label: 'Average score', value: `${overallAverage || 0}%`, icon: <TrendingUp className="h-5 w-5" />, view: 'progress' as View },
      ];

  const description = isStaffRole(profile?.role)
    ? 'Manage your content and monitor learner activity.'
    : profile?.role === 'parent'
    ? "Keep an eye on your child's learning progress."
    : "Here's where you left off — keep the momentum going.";

  return (
    <div>
      <PageHeader title={`Welcome back, ${profile?.full_name?.split(' ')[0] ?? ''}`} description={description} />

      {incomingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
            <UserCheck className="h-5 w-5 text-accent-600" /> Parent link requests
          </h2>
          <div className="space-y-3">
            {incomingRequests.map((r) => (
              <Card key={r.linkId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-slate-800">{r.parent.full_name}</p>
                  <p className="text-sm text-slate-500">{r.parent.email} wants to link as your parent and view your progress.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleRespond(r.linkId, false)} className="text-sm">
                    <X className="h-4 w-4" /> Decline
                  </Button>
                  <Button onClick={() => handleRespond(r.linkId, true)} className="text-sm">
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {profile?.role === 'parent' ? (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your children</h2>
            <button onClick={() => onNavigate('children')} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {childRequests.length === 0 ? (
            <Card className="p-5 text-sm text-slate-500">No children linked yet. Go to "Manage" to send a link request by email.</Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {childRequests.map((c) => (
                <Card key={c.linkId} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{c.student.full_name}</p>
                      <p className="text-sm text-slate-500">{c.student.email}</p>
                    </div>
                    {c.status !== 'approved' && (
                      <Badge tone={c.status === 'pending' ? 'accent' : 'red'}>{c.status === 'pending' ? 'Awaiting approval' : 'Declined'}</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">{isStaffRole(profile?.role) ? 'Your subjects' : 'Continue learning'}</h2>
            <button onClick={() => onNavigate('subjects')} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.slice(0, 6).map((s) => (
              <Card key={s.id} className="cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-lg" onClick={() => onNavigate('subjects')}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: (s.color ?? '#18b077') + '20' }}>
                  {s.icon ?? '📘'}
                </div>
                <h3 className="mt-3 font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{s.description}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
