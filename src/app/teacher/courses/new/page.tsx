import { createCourseAction } from "@/lib/actions/teacher";

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Crea un nuovo corso</h1>
      <p className="mt-1 text-slate-500">
        Compila le informazioni di base. Potrai aggiungere moduli e lezioni subito dopo.
      </p>

      <form action={createCourseAction} className="mt-6 space-y-4 rounded-2xl border border-border bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Titolo del corso</label>
          <input
            name="title"
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Es. Introduzione al Machine Learning"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descrizione</label>
          <textarea
            name="description"
            required
            rows={4}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Di cosa parla il corso, a chi è rivolto..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Categoria</label>
            <input
              name="category"
              defaultValue="Generale"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Livello</label>
            <select
              name="level"
              defaultValue="Base"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option>Base</option>
              <option>Intermedio</option>
              <option>Avanzato</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Colore copertina</label>
          <input name="coverColor" type="color" defaultValue="#4f46e5" className="h-10 w-16 rounded border border-border" />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Crea corso
        </button>
      </form>
    </div>
  );
}
