import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { listStudentRoster } from '../lib/data';
import { PageHeader, Card, Spinner, EmptyState, Badge } from '../components/ui';
import type { Profile } from '../lib/types';

export default function RosterPage() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    listStudentRoster(profile.institute_id).then((s) => {
      setStudents(s);
      setLoading(false);
    });
  }, [profile?.id]);

  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-brand-600" /></div>;

  return (
    <div>
      <PageHeader
        title="Students"
        description={profile?.institute_id ? 'Students enrolled in your institute.' : 'All students on the platform.'}
      />
      {students.length === 0 ? (
        <EmptyState icon={<Users className="h-10 w-10" />} title="No students yet" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Grade level</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3 font-medium text-slate-800">{s.full_name}</td>
                  <td className="px-5 py-3 text-slate-500">{s.email}</td>
                  <td className="px-5 py-3">{s.grade_level ? <Badge tone="slate">{s.grade_level}</Badge> : '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
