import { useState } from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Button, Input } from '../components/ui';
import type { Role } from '../lib/types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'institute_admin', label: 'Institute' },
];

const DEMO_PASSWORD = 'Demo1234!';
const DEMO_ACCOUNTS: { role: Role; label: string; email: string; fullName: string; instituteName?: string }[] = [
  { role: 'student', label: 'Student', email: 'preppakistan.demo.student@example.com', fullName: 'Demo Student' },
  { role: 'parent', label: 'Parent', email: 'preppakistan.demo.parent@example.com', fullName: 'Demo Parent' },
  { role: 'teacher', label: 'Teacher', email: 'preppakistan.demo.teacher@example.com', fullName: 'Demo Teacher' },
  { role: 'institute_admin', label: 'Institute', email: 'preppakistan.demo.institute@example.com', fullName: 'Demo Institute Admin', instituteName: 'Demo Academy' },
];

export default function AuthPage({ onBack }: { onBack?: () => void }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [instituteName, setInstituteName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<Role | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, fullName, role, instituteName);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  async function handleDemoLogin(account: (typeof DEMO_ACCOUNTS)[number]) {
    setError(null);
    setDemoLoading(account.role);
    let result = await signIn(account.email, DEMO_PASSWORD);
    if (result.error) {
      result = await signUp(account.email, DEMO_PASSWORD, account.fullName, account.role, account.instituteName);
    }
    setDemoLoading(null);
    if (result.error) setError(result.error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          PrepPakistan
        </button>

        <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-soft">
          <h1 className="text-xl font-extrabold text-slate-900">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'signin' ? 'Sign in to continue your learning journey.' : 'Start your personalized learning journey today.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Ayesha Khan" />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setRole(opt.value)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        role === opt.value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {mode === 'signup' && role === 'institute_admin' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Institute name</label>
                <Input value={instituteName} onChange={(e) => setInstituteName(e.target.value)} required placeholder="Bright Future Academy" />
              </div>
            )}
            {mode === 'signup' && role === 'parent' && (
              <p className="rounded-lg bg-accent-50 px-3 py-2 text-xs text-accent-700">
                After signing up, you'll be able to link your child's account from your dashboard using their email.
              </p>
            )}

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Sparkles className="h-3.5 w-3.5" /> Try a demo account
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.role}
                  type="button"
                  variant="secondary"
                  loading={demoLoading === account.role}
                  disabled={demoLoading !== null}
                  onClick={() => handleDemoLogin(account)}
                  className="text-sm"
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
