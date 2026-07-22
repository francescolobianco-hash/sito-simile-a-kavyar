type ModuleWithLessons = { lessons: { id: string; duration: number }[] };

export function courseCompletion(
  modules: ModuleWithLessons[],
  completedLessonIds: Set<string>
) {
  const lessons = modules.flatMap((m) => m.lessons);
  const total = lessons.length;
  const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const minutesCompleted = lessons
    .filter((l) => completedLessonIds.has(l.id))
    .reduce((sum, l) => sum + l.duration, 0);
  return { total, completed, percent, minutesCompleted };
}

export function findNextLesson(
  modules: { lessons: { id: string }[] }[],
  completedLessonIds: Set<string>
) {
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      if (!completedLessonIds.has(lesson.id)) return lesson.id;
    }
  }
  return modules[0]?.lessons[0]?.id ?? null;
}
