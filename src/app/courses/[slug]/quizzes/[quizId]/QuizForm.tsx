"use client";

import { useState } from "react";
import Link from "next/link";
import { submitQuizAction } from "@/lib/actions/quiz";

type Question = {
  id: string;
  text: string;
  answers: { id: string; text: string }[];
};

export function QuizForm({
  quizId,
  slug,
  questions,
}: {
  quizId: string;
  slug: string;
  questions: Question[];
}) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [result, setResult] = useState<
    { score: number; correctCount: number; total: number; correctAnswers: Record<string, string> } | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = questions.every((q) => selections[q.id]);

  async function handleSubmit() {
    setSubmitting(true);
    const res = await submitQuizAction(quizId, selections);
    setResult(res);
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      {result && (
        <div
          className={`rounded-2xl border p-5 ${
            result.score >= 60
              ? "border-teal-200 bg-teal-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="text-lg font-bold">
            Punteggio: {result.score}% ({result.correctCount}/{result.total} corrette)
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {result.score >= 60
              ? "Ottimo lavoro! Hai superato il quiz."
              : "Puoi riprovare per migliorare il punteggio."}
          </p>
          <Link
            href={`/courses/${slug}`}
            className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Torna al corso
          </Link>
        </div>
      )}

      {questions.map((q, i) => (
        <div key={q.id} className="rounded-2xl border border-border bg-white p-5">
          <p className="font-medium">
            {i + 1}. {q.text}
          </p>
          <div className="mt-3 space-y-2">
            {q.answers.map((a) => {
              const isSelected = selections[q.id] === a.id;
              const showFeedback = !!result;
              const isCorrectAnswer = result?.correctAnswers[q.id] === a.id;
              let optionClass = "border-border hover:bg-slate-50";
              if (showFeedback && isCorrectAnswer) {
                optionClass = "border-teal-400 bg-teal-50";
              } else if (showFeedback && isSelected && !isCorrectAnswer) {
                optionClass = "border-red-300 bg-red-50";
              } else if (isSelected) {
                optionClass = "border-primary bg-primary/5";
              }
              return (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${optionClass}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    disabled={!!result}
                    checked={isSelected}
                    onChange={() => setSelections((s) => ({ ...s, [q.id]: a.id }))}
                    className="accent-indigo-600"
                  />
                  {a.text}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Invio in corso..." : "Invia risposte"}
        </button>
      )}
    </div>
  );
}
