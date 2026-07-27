import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Trash2, CheckCircle2, Upload } from 'lucide-react';
import { listQuestions, createQuestion, deleteQuestion, bulkCreateQuestions, type QuestionInput } from '../../lib/data';
import { Button, Card, Input, Textarea, Badge, Spinner } from '../../components/ui';
import { QUESTION_TYPE_LABELS } from '../../lib/types';
import type { Quiz, Question, QuestionType, Difficulty, BloomLevel } from '../../lib/types';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const BLOOM_LEVELS: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
const QUESTION_TYPES = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { current += char; }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

export default function QuestionEditor({ quiz, onBack }: { quiz: Quiz; onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('single_mcq');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [correctIndices, setCorrectIndices] = useState<number[]>([]);
  const [correctText, setCorrectText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [bloomLevel, setBloomLevel] = useState<BloomLevel | ''>('');
  const [topic, setTopic] = useState('');
  const [chapter, setChapter] = useState('');
  const [tags, setTags] = useState('');
  const [marks, setMarks] = useState('1');
  const [negativeMarking, setNegativeMarking] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [reference, setReference] = useState('');
  const [previousExamYear, setPreviousExamYear] = useState('');

  async function refresh() {
    setQuestions(await listQuestions(quiz.id));
  }
  useEffect(() => { refresh().finally(() => setLoading(false)); }, [quiz.id]);

  function resetForm() {
    setPrompt(''); setOptions(['', '', '', '']); setCorrectIndex(0); setCorrectIndices([]); setCorrectText('');
    setExplanation(''); setDifficulty('medium'); setBloomLevel(''); setTopic(''); setChapter(''); setTags('');
    setMarks('1'); setNegativeMarking('0'); setImageUrl(''); setReference(''); setPreviousExamYear('');
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const input: QuestionInput = {
      quiz_id: quiz.id,
      prompt,
      options: questionType === 'fill_blank' ? [] : options,
      correct_index: questionType === 'fill_blank' ? -1 : correctIndex,
      correct_indices: questionType === 'multiple_mcq' ? correctIndices : null,
      correct_text: questionType === 'fill_blank' ? correctText : null,
      explanation,
      order_index: questions.length,
      question_type: questionType,
      difficulty,
      bloom_level: bloomLevel || null,
      topic: topic || null,
      chapter: chapter || null,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      marks: Number(marks) || 1,
      negative_marking: Number(negativeMarking) || 0,
      image_url: imageUrl || null,
      reference: reference || null,
      previous_exam_year: previousExamYear || null,
    };
    await createQuestion(input);
    resetForm();
    refresh();
  }

  function toggleCorrectIndex(i: number) {
    setCorrectIndices((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort()));
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const rows: QuestionInput[] = [];
      const startIndex = /prompt/i.test(lines[0]) ? 1 : 0;
      for (let i = startIndex; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        const [csvPrompt, optA, optB, optC, optD, correctLetter, csvExplanation, csvDifficulty, csvMarks, csvNegative, csvTopic, csvChapter, csvTags] = cols;
        if (!csvPrompt) continue;
        const opts = [optA, optB, optC, optD].filter((o) => o !== undefined && o !== '');
        const letterIndex = { a: 0, b: 1, c: 2, d: 3 }[(correctLetter ?? '').trim().toLowerCase() as 'a' | 'b' | 'c' | 'd'] ?? 0;
        rows.push({
          quiz_id: quiz.id,
          prompt: csvPrompt,
          options: opts,
          correct_index: letterIndex,
          explanation: csvExplanation ?? '',
          order_index: questions.length + rows.length,
          difficulty: (['easy', 'medium', 'hard'].includes(csvDifficulty) ? csvDifficulty : 'medium') as Difficulty,
          marks: Number(csvMarks) || 1,
          negative_marking: Number(csvNegative) || 0,
          topic: csvTopic || null,
          chapter: csvChapter || null,
          tags: csvTags ? csvTags.split(';').map((t) => t.trim()).filter(Boolean) : [],
        });
      }
      if (rows.length === 0) throw new Error('No valid rows found in file.');
      await bulkCreateQuestions(rows);
      await refresh();
    } catch (err: any) {
      setImportError(err.message ?? 'Could not import file.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const needsOptions = !['fill_blank'].includes(questionType);

  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to quizzes
      </button>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{quiz.title} — Questions</h2>
        <div>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileImport} />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="text-sm">
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
        </div>
      </div>
      {importError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{importError}</p>}
      <p className="mb-4 text-xs text-slate-400">
        CSV columns: prompt, option_a, option_b, option_c, option_d, correct_letter (a-d), explanation, difficulty, marks, negative_marking, topic, chapter, tags (semicolon-separated). First row may be a header.
      </p>

      <Card className="mb-6 p-5">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Question type</label>
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value as QuestionType)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                {QUESTION_TYPES.map((t) => <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm capitalize">
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder="Question prompt" required />
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (optional, for image-based/diagram questions)" />

          {needsOptions ? (
            <div className="space-y-2">
              {options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  {questionType === 'multiple_mcq' ? (
                    <input type="checkbox" checked={correctIndices.includes(i)} onChange={() => toggleCorrectIndex(i)} />
                  ) : (
                    <input type="radio" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} />
                  )}
                  <Input value={o} onChange={(e) => { const next = [...options]; next[i] = e.target.value; setOptions(next); }} placeholder={`Option ${i + 1}`} required />
                </div>
              ))}
            </div>
          ) : (
            <Input value={correctText} onChange={(e) => setCorrectText(e.target.value)} placeholder="Correct answer" required />
          )}

          <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} placeholder="Explanation (optional)" />

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Bloom's level</label>
              <select value={bloomLevel} onChange={(e) => setBloomLevel(e.target.value as BloomLevel)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm capitalize">
                <option value="">—</option>
                {BLOOM_LEVELS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" />
            <Input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="Chapter" />
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <Input value={marks} onChange={(e) => setMarks(e.target.value)} type="number" step="0.5" placeholder="Marks" />
            <Input value={negativeMarking} onChange={(e) => setNegativeMarking(e.target.value)} type="number" step="0.25" placeholder="Negative marking" />
            <Input value={previousExamYear} onChange={(e) => setPreviousExamYear(e.target.value)} placeholder="Previous exam year" />
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Reference" />
          </div>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma-separated)" />

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
                <div>
                  <p className="font-medium text-slate-800">{i + 1}. {q.prompt}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone="slate">{QUESTION_TYPE_LABELS[q.question_type]}</Badge>
                    <Badge tone="slate">{q.difficulty}</Badge>
                    <Badge tone="slate">{q.marks} mark{q.marks !== 1 ? 's' : ''}</Badge>
                    {q.negative_marking > 0 && <Badge tone="red">-{q.negative_marking} penalty</Badge>}
                    {q.topic && <Badge tone="accent">{q.topic}</Badge>}
                  </div>
                </div>
                <button onClick={async () => { await deleteQuestion(q.id); refresh(); }} className="text-slate-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
              {q.question_type === 'fill_blank' ? (
                <p className="mt-2 text-sm font-semibold text-brand-700">Answer: {q.correct_text}</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {q.options.map((o, oi) => {
                    const isCorrect = q.question_type === 'multiple_mcq' ? (q.correct_indices ?? []).includes(oi) : oi === q.correct_index;
                    return (
                      <li key={oi} className={isCorrect ? 'font-semibold text-brand-700' : 'text-slate-500'}>
                        {isCorrect && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}
                        {o}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
