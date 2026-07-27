import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowLeft, BookOpen, Video, Layers, ClipboardList, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  listSubjects, createSubject, deleteSubject,
  listNotes, createNote, deleteNote,
  listLectures, createLecture, deleteLecture,
  listFlashcards, createFlashcard, deleteFlashcard,
  listQuizzes, createQuiz, deleteQuiz,
  listQuestions, createQuestion, deleteQuestion,
  submitQuizAttempt,
} from '../lib/data';
import { Button, Card, Input, Textarea, Badge, EmptyState, Spinner, PageHeader } from '../components/ui';
import type { Subject, Note, Lecture, Flashcard, Quiz, Question } from '../lib/types';

const ICONS = ['📘', '🧮', '🧪', '🌍', '💻', '📖', '🔬', '📐'];
const COLORS = ['#18b077', '#6a47f8', '#f59e0b', '#ef4444', '#0ea5e9', '#ec4899'];

export default function SubjectsPage() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Subject | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function refresh() {
    setSubjects(await listSubjects());
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-brand-600" /></div>;

  if (selected) {
    return <SubjectDetail subject={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Browse notes, lectures, flashcards, and quizzes."
        action={profile?.role === 'admin' && (
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> New subject</Button>
        )}
      />

      {showCreate && (
        <CreateSubjectModal
          onClose={() => setShowCreate(false)}
          onCreated={async () => { await refresh(); setShowCreate(false); }}
        />
      )}

      {subjects.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-10 w-10" />} title="No subjects yet" description={profile?.role === 'admin' ? 'Create your first subject to get started.' : 'Check back soon.'} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Card key={s.id} className="group relative cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-lg" onClick={() => setSelected(s)}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: (s.color ?? '#18b077') + '20' }}>
                {s.icon ?? '📘'}
              </div>
              <h3 className="mt-3 font-bold text-slate-900">{s.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{s.description}</p>
              {profile?.role === 'admin' && (
                <button
                  onClick={async (e) => { e.stopPropagation(); await deleteSubject(s.id); refresh(); }}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-300 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateSubjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    await createSubject({ title, description, icon, color, created_by: profile.id });
    setSaving(false);
    onCreated();
  }

  return (
    <Modal onClose={onClose} title="New subject">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Mathematics" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Algebra, geometry, and calculus fundamentals" />
        </div>
        <div className="flex gap-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((i) => (
                <button type="button" key={i} onClick={() => setIcon(i)} className={`h-9 w-9 rounded-lg text-lg ${icon === i ? 'bg-brand-100 ring-2 ring-brand-500' : 'bg-slate-50'}`}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c) => (
                <button type="button" key={c} onClick={() => setColor(c)} className="h-9 w-9 rounded-lg" style={{ backgroundColor: c, outline: color === c ? '2px solid #0f172a' : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>
        </div>
        <Button type="submit" loading={saving} className="w-full">Create subject</Button>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

type Tab = 'notes' | 'lectures' | 'flashcards' | 'quizzes';

function SubjectDetail({ subject, onBack }: { subject: Subject; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('notes');
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'notes', label: 'Notes', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'lectures', label: 'Lectures', icon: <Video className="h-4 w-4" /> },
    { key: 'flashcards', label: 'Flashcards', icon: <Layers className="h-4 w-4" /> },
    { key: 'quizzes', label: 'Quizzes & mock exams', icon: <ClipboardList className="h-4 w-4" /> },
  ];

  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to subjects
      </button>
      <PageHeader title={subject.title} description={subject.description ?? undefined} />
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
              tab === t.key ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {tab === 'notes' && <NotesTab subject={subject} />}
      {tab === 'lectures' && <LecturesTab subject={subject} />}
      {tab === 'flashcards' && <FlashcardsTab subject={subject} />}
      {tab === 'quizzes' && <QuizzesTab subject={subject} />}
    </div>
  );
}

function NotesTab({ subject }: { subject: Subject }) {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  async function refresh() {
    setNotes(await listNotes(subject.id));
  }
  useEffect(() => { refresh().finally(() => setLoading(false)); }, [subject.id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    await createNote({ subject_id: subject.id, title, content, created_by: profile.id });
    setTitle(''); setContent(''); setShowForm(false);
    refresh();
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      {profile?.role === 'admin' && (
        <Card className="p-5">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm font-semibold text-brand-600">
              <Plus className="h-4 w-4" /> Add note
            </button>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" required />
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Write your note content here (Markdown supported)" required />
              <div className="flex gap-2">
                <Button type="submit" className="text-sm">Save note</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </Card>
      )}
      {notes.length === 0 ? (
        <EmptyState title="No notes yet" description="Notes for this subject will appear here." />
      ) : (
        notes.map((n) => (
          <Card key={n.id} className="p-5">
            <div className="flex items-start justify-between">
              <button className="text-left font-bold text-slate-900" onClick={() => setOpen(open === n.id ? null : n.id)}>{n.title}</button>
              {profile?.role === 'admin' && (
                <button onClick={async () => { await deleteNote(n.id); refresh(); }} className="text-slate-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
            {open === n.id && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{n.content}</p>}
          </Card>
        ))
      )}
    </div>
  );
}

function LecturesTab({ subject }: { subject: Subject }) {
  const { profile } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  async function refresh() {
    setLectures(await listLectures(subject.id));
  }
  useEffect(() => { refresh().finally(() => setLoading(false)); }, [subject.id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    await createLecture({ subject_id: subject.id, title, video_url: videoUrl, duration_minutes: duration ? Number(duration) : null, description, created_by: profile.id });
    setTitle(''); setVideoUrl(''); setDuration(''); setDescription(''); setShowForm(false);
    refresh();
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      {profile?.role === 'admin' && (
        <Card className="p-5">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm font-semibold text-brand-600">
              <Plus className="h-4 w-4" /> Add lecture
            </button>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lecture title" required />
              <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL (YouTube/Vimeo embed link)" required />
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (minutes)" type="number" />
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Short description" />
              <div className="flex gap-2">
                <Button type="submit" className="text-sm">Save lecture</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </Card>
      )}
      {lectures.length === 0 ? (
        <EmptyState icon={<Video className="h-10 w-10" />} title="No lectures yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lectures.map((l) => (
            <Card key={l.id} className="overflow-hidden">
              <div className="aspect-video bg-slate-900">
                <iframe src={l.video_url} title={l.title} className="h-full w-full" allowFullScreen />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900">{l.title}</h3>
                  {profile?.role === 'admin' && (
                    <button onClick={async () => { await deleteLecture(l.id); refresh(); }} className="text-slate-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
                {l.duration_minutes && <Badge tone="slate">{l.duration_minutes} min</Badge>}
                {l.description && <p className="mt-2 text-sm text-slate-500">{l.description}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FlashcardsTab({ subject }: { subject: Subject }) {
  const { profile } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  async function refresh() {
    setCards(await listFlashcards(subject.id));
  }
  useEffect(() => { refresh().finally(() => setLoading(false)); }, [subject.id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    await createFlashcard({ subject_id: subject.id, front, back, created_by: profile.id });
    setFront(''); setBack(''); setShowForm(false);
    refresh();
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      {profile?.role === 'admin' && (
        <Card className="p-5">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm font-semibold text-brand-600">
              <Plus className="h-4 w-4" /> Add flashcard
            </button>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3">
              <Textarea value={front} onChange={(e) => setFront(e.target.value)} rows={2} placeholder="Front (question)" required />
              <Textarea value={back} onChange={(e) => setBack(e.target.value)} rows={2} placeholder="Back (answer)" required />
              <div className="flex gap-2">
                <Button type="submit" className="text-sm">Save flashcard</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </Card>
      )}
      {cards.length === 0 ? (
        <EmptyState icon={<Layers className="h-10 w-10" />} title="No flashcards yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.id} className="group relative cursor-pointer" onClick={() => setFlipped((f) => ({ ...f, [c.id]: !f[c.id] }))}>
              <Card className="flex min-h-[140px] items-center justify-center p-5 text-center transition hover:shadow-lg">
                <p className="text-sm font-medium text-slate-800">{flipped[c.id] ? c.back : c.front}</p>
              </Card>
              {profile?.role === 'admin' && (
                <button
                  onClick={async (e) => { e.stopPropagation(); await deleteFlashcard(c.id); refresh(); }}
                  className="absolute right-2 top-2 rounded-lg bg-white p-1.5 text-slate-300 opacity-0 shadow-sm hover:text-red-600 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizzesTab({ subject }: { subject: Subject }) {
  const { profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'quiz' | 'mock_exam'>('quiz');
  const [duration, setDuration] = useState('15');
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [taking, setTaking] = useState<Quiz | null>(null);

  async function refresh() {
    setQuizzes(await listQuizzes(subject.id));
  }
  useEffect(() => { refresh().finally(() => setLoading(false)); }, [subject.id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    await createQuiz({ subject_id: subject.id, title, type, duration_minutes: Number(duration), created_by: profile.id });
    setTitle(''); setDuration('15'); setShowForm(false);
    refresh();
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-brand-600" /></div>;

  if (editing) return <QuestionEditor quiz={editing} onBack={() => { setEditing(null); refresh(); }} />;
  if (taking) return <QuizRunner quiz={taking} onDone={() => setTaking(null)} />;

  return (
    <div className="space-y-4">
      {profile?.role === 'admin' && (
        <Card className="p-5">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm font-semibold text-brand-600">
              <Plus className="h-4 w-4" /> Create quiz / mock exam
            </button>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" required />
              <div className="flex gap-3">
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                  <option value="quiz">Quiz</option>
                  <option value="mock_exam">Mock exam</option>
                </select>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" placeholder="Duration (min)" className="w-40" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="text-sm">Create</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </Card>
      )}
      {quizzes.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-10 w-10" />} title="No quizzes yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((q) => (
            <Card key={q.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Badge tone={q.type === 'mock_exam' ? 'accent' : 'brand'}>{q.type === 'mock_exam' ? 'Mock exam' : 'Quiz'}</Badge>
                  <h3 className="mt-2 font-bold text-slate-900">{q.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{q.duration_minutes} minutes</p>
                </div>
                {profile?.role === 'admin' && (
                  <button onClick={async () => { await deleteQuiz(q.id); refresh(); }} className="text-slate-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                {profile?.role === 'admin' ? (
                  <Button variant="secondary" onClick={() => setEditing(q)} className="text-sm">Manage questions</Button>
                ) : (
                  <Button onClick={() => setTaking(q)} className="text-sm">Start</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionEditor({ quiz, onBack }: { quiz: Quiz; onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');

  async function refresh() {
    setQuestions(await listQuestions(quiz.id));
  }
  useEffect(() => { refresh().finally(() => setLoading(false)); }, [quiz.id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await createQuestion({ quiz_id: quiz.id, prompt, options, correct_index: correctIndex, explanation, order_index: questions.length });
    setPrompt(''); setOptions(['', '', '', '']); setCorrectIndex(0); setExplanation('');
    refresh();
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to quizzes
      </button>
      <h2 className="mb-4 text-lg font-bold text-slate-900">{quiz.title} — Questions</h2>

      <Card className="mb-6 p-5">
        <form onSubmit={handleAdd} className="space-y-3">
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder="Question prompt" required />
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} />
              <Input value={o} onChange={(e) => { const next = [...options]; next[i] = e.target.value; setOptions(next); }} placeholder={`Option ${i + 1}`} required />
            </div>
          ))}
          <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} placeholder="Explanation (optional)" />
          <Button type="submit" className="text-sm">Add question</Button>
        </form>
      </Card>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-brand-600" /></div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={q.id} className="p-4">
              <div className="flex items-start justify-between">
                <p className="font-medium text-slate-800">{i + 1}. {q.prompt}</p>
                <button onClick={async () => { await deleteQuestion(q.id); refresh(); }} className="text-slate-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {q.options.map((o, oi) => (
                  <li key={oi} className={oi === q.correct_index ? 'font-semibold text-brand-700' : 'text-slate-500'}>
                    {oi === q.correct_index && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}
                    {o}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizRunner({ quiz, onDone }: { quiz: Quiz; onDone: () => void }) {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    listQuestions(quiz.id).then((qs) => {
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(-1));
      setLoading(false);
    });
  }, [quiz.id]);

  async function handleSubmit() {
    const s = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct_index ? 1 : 0), 0);
    setScore(s);
    setSubmitted(true);
    if (profile) {
      await submitQuizAttempt({ quiz_id: quiz.id, student_id: profile.id, score: s, total: questions.length, answers });
    }
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-brand-600" /></div>;

  if (questions.length === 0) {
    return <EmptyState title="No questions yet" description="This quiz doesn't have any questions." action={<Button variant="secondary" onClick={onDone}>Back</Button>} />;
  }

  if (submitted) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Your result</p>
        <p className="mt-2 text-5xl font-extrabold text-brand-600">{pct}%</p>
        <p className="mt-1 text-slate-500">{score} out of {questions.length} correct</p>
        <div className="mx-auto mt-6 max-w-lg space-y-3 text-left">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-medium text-slate-800">{i + 1}. {q.prompt}</p>
              <p className={`mt-1 text-sm ${answers[i] === q.correct_index ? 'text-brand-600' : 'text-red-600'}`}>
                Your answer: {answers[i] >= 0 ? q.options[answers[i]] : '—'}
              </p>
              {answers[i] !== q.correct_index && <p className="text-sm text-slate-500">Correct: {q.options[q.correct_index]}</p>}
              {q.explanation && <p className="mt-1 text-xs text-slate-400">{q.explanation}</p>}
            </div>
          ))}
        </div>
        <Button className="mt-6" onClick={onDone}>Done</Button>
      </Card>
    );
  }

  const q = questions[current];
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
        <span>Question {current + 1} of {questions.length}</span>
        <span>{quiz.duration_minutes} min</span>
      </div>
      <p className="text-lg font-semibold text-slate-900">{q.prompt}</p>
      <div className="mt-4 space-y-2">
        {q.options.map((o, i) => (
          <button
            key={i}
            onClick={() => { const next = [...answers]; next[current] = i; setAnswers(next); }}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
              answers[current] === i ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</Button>
        {current < questions.length - 1 ? (
          <Button onClick={() => setCurrent((c) => c + 1)}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Submit</Button>
        )}
      </div>
    </Card>
  );
}
