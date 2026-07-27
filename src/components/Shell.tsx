import { ReactNode, useState } from 'react';
import {
  LayoutDashboard, BookOpen, Users, TrendingUp, Trophy, Baby, LogOut, Menu, X, GraduationCap,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import type { Role } from '../lib/types';

export type View = 'dashboard' | 'subjects' | 'progress' | 'leaderboard' | 'users' | 'children' | 'roster';

interface NavItem {
  key: View;
  label: string;
  icon: ReactNode;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['admin', 'teacher', 'institute_admin', 'parent', 'student'] },
  { key: 'subjects', label: 'Subjects', icon: <BookOpen className="h-5 w-5" />, roles: ['admin', 'teacher', 'institute_admin', 'student'] },
  { key: 'progress', label: 'Progress', icon: <TrendingUp className="h-5 w-5" />, roles: ['student'] },
  { key: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="h-5 w-5" />, roles: ['admin', 'teacher', 'institute_admin', 'student'] },
  { key: 'children', label: 'My Children', icon: <Baby className="h-5 w-5" />, roles: ['parent'] },
  { key: 'roster', label: 'Students', icon: <Users className="h-5 w-5" />, roles: ['teacher', 'institute_admin'] },
  { key: 'users', label: 'Users', icon: <Users className="h-5 w-5" />, roles: ['admin'] },
];

export default function Shell({ active, onNavigate, children }: { active: View; onNavigate: (v: View) => void; children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = profile?.role ?? 'student';
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-lg font-extrabold tracking-tight text-slate-900">PrepPakistan</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              onNavigate(item.key);
              setMobileOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active === item.key ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700">
            {(profile?.full_name ?? '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{profile?.full_name}</p>
            <p className="truncate text-xs capitalize text-slate-400">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-100 bg-white lg:block">{Sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">{Sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen((v) => !v)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-bold text-slate-900">PrepPakistan</span>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
