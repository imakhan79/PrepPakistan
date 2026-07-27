import { useEffect, useState } from 'react';
import { ArrowLeft, Baby, Plus } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { listMyChildren, linkChildByEmail } from '../lib/data';
import { Button, Card, Input, EmptyState, Spinner, PageHeader } from '../components/ui';
import { StudentProgress } from './ProgressPage';
import type { Profile } from '../lib/types';

export default function MyChildrenPage() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!profile) return;
    setChildren(await listMyChildren(profile.id));
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
      await linkChildByEmail(profile.id, email);
      setEmail('');
      await refresh();
    } catch (err: any) {
      setError(err.message ?? 'Could not link that student.');
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
      <PageHeader title="My children" description="Link your child's account to monitor their progress." />

      <Card className="mb-6 p-5">
        <form onSubmit={handleLink} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Child's email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="child@example.com" />
          </div>
          <Button type="submit" loading={linking}><Plus className="h-4 w-4" /> Link child</Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>

      {children.length === 0 ? (
        <EmptyState icon={<Baby className="h-10 w-10" />} title="No children linked yet" description="Enter your child's account email above to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((c) => (
            <Card key={c.id} className="cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-lg" onClick={() => setSelected(c)}>
              <p className="font-bold text-slate-900">{c.full_name}</p>
              <p className="text-sm text-slate-500">{c.email}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
