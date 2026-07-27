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

export type LinkStatus = 'pending' | 'approved' | 'rejected';

export interface ParentLink {
  id: string;
  parent_id: string;
  student_id: string;
  status: LinkStatus;
  created_at: string;
}

export interface ChildRequest {
  linkId: string;
  status: LinkStatus;
  student: Profile;
}

export interface IncomingLinkRequest {
  linkId: string;
  parent: Profile;
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

export type QuizFormat =
  | 'quiz' | 'full_mock' | 'subject_wise' | 'chapter_wise' | 'topic_wise'
  | 'daily_quiz' | 'weekly_assessment' | 'timed_challenge' | 'previous_paper' | 'custom';

export const QUIZ_FORMAT_LABELS: Record<QuizFormat, string> = {
  quiz: 'Standard Quiz',
  full_mock: 'Full-Length Mock Exam',
  subject_wise: 'Subject-wise Test',
  chapter_wise: 'Chapter-wise Test',
  topic_wise: 'Topic-wise Practice',
  daily_quiz: 'Daily Quiz',
  weekly_assessment: 'Weekly Assessment',
  timed_challenge: 'Timed Challenge',
  previous_paper: 'Previous Paper Simulation',
  custom: 'Custom Test',
};

export interface Quiz {
  id: string;
  subject_id: string;
  title: string;
  type: QuizType;
  format: QuizFormat;
  duration_minutes: number;
  created_by: string;
  created_at: string;
}

export type QuestionType =
  | 'single_mcq' | 'multiple_mcq' | 'true_false' | 'assertion_reason'
  | 'matching' | 'fill_blank' | 'scenario' | 'case_study' | 'image_based' | 'diagram';

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_mcq: 'Single MCQ',
  multiple_mcq: 'Multiple Correct MCQ',
  true_false: 'True / False',
  assertion_reason: 'Assertion & Reason',
  matching: 'Matching',
  fill_blank: 'Fill in the Blank',
  scenario: 'Scenario-Based',
  case_study: 'Case Study',
  image_based: 'Image-Based',
  diagram: 'Diagram',
};

export type Difficulty = 'easy' | 'medium' | 'hard';
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

export interface Question {
  id: string;
  quiz_id: string;
  prompt: string;
  options: string[];
  correct_index: number;
  correct_indices: number[] | null;
  correct_text: string | null;
  explanation: string | null;
  order_index: number;
  question_type: QuestionType;
  difficulty: Difficulty;
  bloom_level: BloomLevel | null;
  topic: string | null;
  chapter: string | null;
  tags: string[];
  marks: number;
  negative_marking: number;
  image_url: string | null;
  reference: string | null;
  previous_exam_year: string | null;
}

export type StudentAnswer = number | number[] | string | null;

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total: number;
  answers: StudentAnswer[];
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
