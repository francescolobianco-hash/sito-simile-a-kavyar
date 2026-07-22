"use client";

import { useActionState } from "react";
import { generateQuizQuestionsAction } from "@/lib/actions/ai-quiz";

export function GenerateAIForm({ quizId, courseId }: { quizId: string; courseId: string }) {
  const [state, formAction, pending] = useActionState(
    generateQuizQuestionsAction.bind(null, quizId, courseId),
    undefined
  );

  return (
    <form action={formAction} className="mt-6 space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <p className="font-medium">✨ Genera domande con AI</p>
      <p className="text-xs text-slate-500">
        Claude legge il contenuto delle lezioni testuali di questo modulo e genera automaticamente
        domande a risposta multipla pertinenti.
      </p>
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600" htmlFor="ai-count">
          Numero di domande
        </label>
        <input
          id="ai-count"
          name="count"
          type="number"
          min={1}
          max={8}
          defaultValue={5}
          className="w-20 rounded-lg border border-border px-2 py-1.5 text-sm"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-teal-700">{state.success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {pending ? "Generazione in corso…" : "Genera con AI"}
      </button>
    </form>
  );
}
