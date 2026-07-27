import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PageHeader, Card, Badge, Spinner, EmptyState } from '../components/ui';
import type { Profile } from '../lib/types';
import { Users } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers((data ?? []) as Profile[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Users" description="Everyone with access to your PrepPakistan workspace." />
      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-brand-600" /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Users className="h-10 w-10" />} title="No users yet" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-medium text-slate-800">{u.full_name}</td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge tone={u.role === 'admin' ? 'accent' : 'brand'}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
