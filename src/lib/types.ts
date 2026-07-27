export type Role = 'admin' | 'student';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  grade_level: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
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

export interface ProgressSummary {
  subject_id: string;
  subject_title: string;
  attempts: number;
  average_score: number;
  last_attempt_at: string | null;
}
