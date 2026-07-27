import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { listQuestions, submitQuizAttempt } from '../../lib/data';
import { Button, Card, Input, EmptyState, Spinner, Badge } from '../../components/ui';
import type { Quiz, Question, StudentAnswer } from '../../lib/types';

function isAttempted(answer: StudentAnswer): boolean {
  if (answer === null || answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === 'string') return answer.trim().length > 0;
  return answer >= 0;
}

function isCorrect(question: Question, answer: StudentAnswer): boolean {
  if (!isAttempted(answer)) return false;
  if (question.question_type === 'multiple_mcq') {
    const correct = (question.correct_indices ?? []).slice().sort();
    const given = (answer as number[]).slice().sort();
    return correct.length === given.length && correct.every((v, i) => v === given[i]);
  }
  if (question.question_type === 'fill_blank') {
    return (answer as string).trim().toLowerCase() === (question.correct_text ?? '').trim().toLowerCase();
  }
  return (answer as number) === question.correct_index;
}

function scoreQuestion(question: Question, answer: StudentAnswer): number {
  if (!isAttempted(answer)) return 0;
  return isCorrect(question, answer) ? question.marks : -question.negative_marking;
}

export default function QuizRunner({ quiz, onDone }: { quiz: Quiz; onDone: () => void }) {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    listQuestions(quiz.id).then((qs) => {
      setQuestions(qs);
      setAnswers(qs.map((q) => (q.question_type === 'multiple_mcq' ? [] : q.question_type === 'fill_blank' ? '' : null)));
      setLoading(false);
    });
  }, [quiz.id]);

  async function handleSubmit() {
    const rawScore = questions.reduce((acc, q, i) => acc + scoreQuestion(q, answers[i]), 0);
    const maxTotal = questions.reduce((acc, q) => acc + q.marks, 0);
    const finalScore = Math.max(0, rawScore);
    setScore(finalScore);
    setTotal(maxTotal);
    setSubmitted(true);
    if (profile) {
      await submitQuizAttempt({ quiz_id: quiz.id, student_id: profile.id, score: finalScore, total: maxTotal, answers });
    }
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-brand-600" /></div>;

  if (questions.length === 0) {
    return <EmptyState title="No questions yet" description="This quiz doesn't have any questions." action={<Button variant="secondary" onClick={onDone}>Back</Button>} />;
  }

  if (submitted) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Your result</p>
        <p className="mt-2 text-5xl font-extrabold text-brand-600">{pct}%</p>
        <p className="mt-1 text-slate-500">{score} out of {total} marks</p>
        <div className="mx-auto mt-6 max-w-lg space-y-3 text-left">
          {questions.map((q, i) => {
            const correct = isCorrect(q, answers[i]);
            const attempted = isAttempted(answers[i]);
            return (
              <div key={q.id} className="rounded-xl border border-slate-100 p-3">
                <p className="text-sm font-medium text-slate-800">{i + 1}. {q.prompt}</p>
                <p className={`mt-1 text-sm ${correct ? 'text-brand-600' : 'text-red-600'}`}>
                  Your answer: {describeAnswer(q, answers[i])}
                </p>
                {!correct && attempted && <p className="text-sm text-slate-500">Correct: {describeCorrectAnswer(q)}</p>}
                {!attempted && <p className="text-sm text-slate-500">Not attempted — correct: {describeCorrectAnswer(q)}</p>}
                {q.explanation && <p className="mt-1 text-xs text-slate-400">{q.explanation}</p>}
              </div>
            );
          })}
        </div>
        <Button className="mt-6" onClick={onDone}>Done</Button>
      </Card>
    );
  }

  const q = questions[current];
  const answer = answers[current];

  function setAnswer(value: StudentAnswer) {
    const next = [...answers];
    next[current] = value;
    setAnswers(next);
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
        <span>Question {current + 1} of {questions.length}</span>
        <div className="flex items-center gap-2">
          <Badge tone="slate">{q.marks} mark{q.marks !== 1 ? 's' : ''}</Badge>
          <span>{quiz.duration_minutes} min</span>
        </div>
      </div>
      <p className="text-lg font-semibold text-slate-900">{q.prompt}</p>
      {q.image_url && <img src={q.image_url} alt="" className="mt-3 max-h-64 rounded-xl border border-slate-100" />}

      <div className="mt-4 space-y-2">
        {q.question_type === 'fill_blank' ? (
          <Input value={(answer as string) ?? ''} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer" />
        ) : q.question_type === 'multiple_mcq' ? (
          q.options.map((o, i) => {
            const selected = ((answer as number[]) ?? []).includes(i);
            return (
              <button
                key={i}
                onClick={() => {
                  const cur = (answer as number[]) ?? [];
                  setAnswer(selected ? cur.filter((x) => x !== i) : [...cur, i]);
                }}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  selected ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                {o}
              </button>
            );
          })
        ) : (
          q.options.map((o, i) => (
            <button
              key={i}
              onClick={() => setAnswer(i)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                answer === i ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              {o}
            </button>
          ))
        )}
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

function describeAnswer(q: Question, answer: StudentAnswer): string {
  if (!isAttempted(answer)) return '—';
  if (q.question_type === 'multiple_mcq') return (answer as number[]).map((i) => q.options[i]).join(', ');
  if (q.question_type === 'fill_blank') return answer as string;
  return q.options[answer as number] ?? '—';
}

function describeCorrectAnswer(q: Question): string {
  if (q.question_type === 'multiple_mcq') return (q.correct_indices ?? []).map((i) => q.options[i]).join(', ');
  if (q.question_type === 'fill_blank') return q.correct_text ?? '—';
  return q.options[q.correct_index] ?? '—';
}
