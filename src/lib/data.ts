import { supabase } from './supabase';
import type { Subject, Note, Lecture, Flashcard, Quiz, Question, QuizAttempt, ProgressSummary, ExamCategory, LeaderboardRow, Institute, Profile } from './types';

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc('leaderboard');
  if (error) throw error;
  return data as LeaderboardRow[];
}

export async function createInstitute(input: { name: string; created_by: string }) {
  const { data, error } = await supabase.from('institutes').insert(input).select().single();
  if (error) throw error;
  return data as Institute;
}

export async function linkChildByEmail(parentId: string, email: string) {
  const { data: student, error: lookupError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .eq('role', 'student')
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!student) throw new Error('No student account found with that email.');
  const { error } = await supabase.from('parent_links').insert({ parent_id: parentId, student_id: student.id });
  if (error) throw error;
  return student as Profile;
}

export async function listMyChildren(parentId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('parent_links')
    .select('student:profiles!parent_links_student_id_fkey(*)')
    .eq('parent_id', parentId);
  if (error) throw error;
  return (data ?? []).map((row: any) => row.student) as Profile[];
}

export async function listStudentRoster(instituteId: string | null): Promise<Profile[]> {
  let query = supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
  if (instituteId) query = query.eq('institute_id', instituteId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Profile[];
}

export async function listExamCategories(): Promise<ExamCategory[]> {
  const { data, error } = await supabase.from('exam_categories').select('*').order('order_index', { ascending: true });
  if (error) throw error;
  return data as ExamCategory[];
}

export async function listSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase.from('subjects').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Subject[];
}

export async function createSubject(input: { title: string; description: string; icon: string; color: string; category_id: string | null; institute_id: string | null; created_by: string }) {
  const { data, error } = await supabase.from('subjects').insert(input).select().single();
  if (error) throw error;
  return data as Subject;
}

export async function deleteSubject(id: string) {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
}

export async function listNotes(subjectId: string): Promise<Note[]> {
  const { data, error } = await supabase.from('notes').select('*').eq('subject_id', subjectId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as Note[];
}

export async function createNote(input: { subject_id: string; title: string; content: string; created_by: string }) {
  const { error } = await supabase.from('notes').insert(input);
  if (error) throw error;
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

export async function listLectures(subjectId: string): Promise<Lecture[]> {
  const { data, error } = await supabase.from('lectures').select('*').eq('subject_id', subjectId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as Lecture[];
}

export async function createLecture(input: { subject_id: string; title: string; video_url: string; duration_minutes: number | null; description: string; created_by: string }) {
  const { error } = await supabase.from('lectures').insert(input);
  if (error) throw error;
}

export async function deleteLecture(id: string) {
  const { error } = await supabase.from('lectures').delete().eq('id', id);
  if (error) throw error;
}

export async function listFlashcards(subjectId: string): Promise<Flashcard[]> {
  const { data, error } = await supabase.from('flashcards').select('*').eq('subject_id', subjectId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as Flashcard[];
}

export async function createFlashcard(input: { subject_id: string; front: string; back: string; created_by: string }) {
  const { error } = await supabase.from('flashcards').insert(input);
  if (error) throw error;
}

export async function deleteFlashcard(id: string) {
  const { error } = await supabase.from('flashcards').delete().eq('id', id);
  if (error) throw error;
}

export async function listQuizzes(subjectId: string): Promise<Quiz[]> {
  const { data, error } = await supabase.from('quizzes').select('*').eq('subject_id', subjectId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as Quiz[];
}

export async function createQuiz(input: { subject_id: string; title: string; type: 'quiz' | 'mock_exam'; duration_minutes: number; created_by: string }) {
  const { data, error } = await supabase.from('quizzes').insert(input).select().single();
  if (error) throw error;
  return data as Quiz;
}

export async function deleteQuiz(id: string) {
  const { error } = await supabase.from('quizzes').delete().eq('id', id);
  if (error) throw error;
}

export async function listQuestions(quizId: string): Promise<Question[]> {
  const { data, error } = await supabase.from('questions').select('*').eq('quiz_id', quizId).order('order_index', { ascending: true });
  if (error) throw error;
  return data as Question[];
}

export async function createQuestion(input: { quiz_id: string; prompt: string; options: string[]; correct_index: number; explanation: string; order_index: number }) {
  const { error } = await supabase.from('questions').insert(input);
  if (error) throw error;
}

export async function deleteQuestion(id: string) {
  const { error } = await supabase.from('questions').delete().eq('id', id);
  if (error) throw error;
}

export async function submitQuizAttempt(input: { quiz_id: string; student_id: string; score: number; total: number; answers: number[] }) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ ...input, completed_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as QuizAttempt;
}

export async function listAttemptsForStudent(studentId: string): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('student_id', studentId)
    .order('started_at', { ascending: false });
  if (error) throw error;
  return data as QuizAttempt[];
}

export async function getProgressSummary(studentId: string): Promise<ProgressSummary[]> {
  const [{ data: attempts, error: attemptsError }, subjects] = await Promise.all([
    supabase
      .from('quiz_attempts')
      .select('score, total, started_at, quizzes!inner(subject_id, subjects!inner(title))')
      .eq('student_id', studentId),
    listSubjects(),
  ]);
  if (attemptsError) throw attemptsError;

  const bySubject = new Map<string, { title: string; scores: number[]; last: string | null }>();
  for (const s of subjects) bySubject.set(s.id, { title: s.title, scores: [], last: null });

  for (const row of (attempts ?? []) as any[]) {
    const subjectId = row.quizzes?.subject_id;
    if (!subjectId) continue;
    const entry = bySubject.get(subjectId);
    if (!entry) continue;
    const pct = row.total > 0 ? (row.score / row.total) * 100 : 0;
    entry.scores.push(pct);
    if (!entry.last || row.started_at > entry.last) entry.last = row.started_at;
  }

  return Array.from(bySubject.entries()).map(([subject_id, v]) => ({
    subject_id,
    subject_title: v.title,
    attempts: v.scores.length,
    average_score: v.scores.length ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : 0,
    last_attempt_at: v.last,
  }));
}
