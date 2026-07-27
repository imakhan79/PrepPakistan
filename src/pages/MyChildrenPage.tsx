import { useEffect, useState } from 'react';
import { ArrowLeft, Baby, Plus } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { listMyChildRequests, requestChildLink } from '../lib/data';
import { Button, Card, Input, Badge, EmptyState, Spinner, PageHeader } from '../components/ui';
import { StudentProgress } from './ProgressPage';
import type { ChildRequest, Profile } from '../lib/types';

export default function MyChildrenPage() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!profile) return;
    setRequests(await listMyChildRequests(profile.id));
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [profile?.id]);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    setLinking(true);
    try {
      await requestChildLink(profile.id, email);
      setEmail('');
      await refresh();
    } catch (err: any) {
      setError(err.message ?? 'Could not send a link request.');
    }
    setLinking(false);
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-brand-600" /></div>;

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Back to children
        </button>
        <PageHeader title={selected.full_name} description={selected.email} />
        <StudentProgress studentId={selected.id} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My children" description="Send a link request to your child's account — they'll need to approve it before you can see their progress." />

      <Card className="mb-6 p-5">
        <form onSubmit={handleLink} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Child's email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="child@example.com" />
          </div>
          <Button type="submit" loading={linking}><Plus className="h-4 w-4" /> Send request</Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>

      {requests.length === 0 ? (
        <EmptyState icon={<Baby className="h-10 w-10" />} title="No children linked yet" description="Enter your child's account email above to send a request." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => (
            <Card
              key={r.linkId}
              className={`p-5 ${r.status === 'approved' ? 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg' : ''}`}
              onClick={() => r.status === 'approved' && setSelected(r.student)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900">{r.student.full_name}</p>
                  <p className="text-sm text-slate-500">{r.student.email}</p>
                </div>
                {r.status !== 'approved' && (
                  <Badge tone={r.status === 'pending' ? 'accent' : 'red'}>{r.status === 'pending' ? 'Awaiting approval' : 'Declined'}</Badge>
                )}
              </div>
              {r.status === 'rejected' && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await requestChildLink(profile!.id, r.student.email);
                    refresh();
                  }}
                  className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Resend request
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
