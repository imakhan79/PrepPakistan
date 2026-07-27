export type Role = 'admin' | 'teacher' | 'parent' | 'student' | 'institute_admin';

export function isStaffRole(role?: Role | null): boolean {
  return role === 'admin' || role === 'teacher' || role === 'institute_admin';
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  grade_level: string | null;
  institute_id: string | null;
  created_at: string;
}

export interface Institute {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface ParentLink {
  id: string;
  parent_id: string;
  student_id: string;
  created_at: string;
}

export interface ExamCategory {
  id: string;
  key: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order_index: number;
}

export interface Subject {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category_id: string | null;
  institute_id: string | null;
  created_by: string;
  created_at: string;
}

export interface Note {
  id: string;
  subject_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface Lecture {
  id: string;
  subject_id: string;
  title: string;
  video_url: string;
  duration_minutes: number | null;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  subject_id: string;
  front: string;
  back: string;
  created_by: string;
  created_at: string;
}

export type QuizType = 'quiz' | 'mock_exam';

export interface Quiz {
  id: string;
  subject_id: string;
  title: string;
  type: QuizType;
  duration_minutes: number;
  created_by: string;
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total: number;
  answers: number[];
  started_at: string;
  completed_at: string | null;
}

export interface LeaderboardRow {
  student_id: string;
  full_name: string;
  avatar_url: string | null;
  total_score: number;
  total_attempts: number;
  avg_pct: number;
}

export interface ProgressSummary {
  subject_id: string;
  subject_title: string;
  attempts: number;
  average_score: number;
  last_attempt_at: string | null;
}
