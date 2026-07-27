import { GraduationCap, Sparkles, BookOpen, Trophy, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui';

const TRACKS = [
  { icon: '📚', title: 'Academic' },
  { icon: '🎓', title: 'University Admission' },
  { icon: '🏛️', title: 'Government Services' },
  { icon: '🪖', title: 'Military & Defence' },
  { icon: '💼', title: 'Professional Boards' },
  { icon: '📝', title: 'Recruitment Tests' },
];

const FEATURES = [
  { icon: <Sparkles className="h-5 w-5" />, title: 'Personalized AI Companion', desc: 'A learning path that adapts to you, built to raise your odds of success.' },
  { icon: <BookOpen className="h-5 w-5" />, title: 'Notes, Lectures & Flashcards', desc: 'Everything you need to learn a subject, in one place.' },
  { icon: <Trophy className="h-5 w-5" />, title: 'Mock Exams & Quizzes', desc: 'Practice under real exam conditions and track every attempt.' },
  { icon: <BarChart3 className="h-5 w-5" />, title: 'Progress & Analytics', desc: 'See exactly where you stand and what to revise next.' },
];

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">PrepPakistan</span>
        </div>
        <Button onClick={onGetStarted}>Get started</Button>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center sm:pt-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
          <Sparkles className="h-3.5 w-3.5" /> Pakistan's AI-powered exam preparation ecosystem
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Learn smarter. <span className="text-brand-600">Score higher.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          A personalized AI learning companion for academic, university admission, government, military,
          professional, and recruitment examinations — everything you need to prepare, in one platform.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onGetStarted} className="px-6 py-3 text-base">
            Start learning free <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {TRACKS.map((t) => (
            <span key={t.title} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
              <span>{t.icon}</span> {t.title}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
