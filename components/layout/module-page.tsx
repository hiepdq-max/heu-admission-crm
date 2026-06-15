import { CheckCircle2 } from "lucide-react";

type ModulePageProps = {
  summary: string;
  priorities: string[];
  nextMilestone: string;
};

export function ModulePage({
  summary,
  priorities,
  nextMilestone,
}: ModulePageProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <article className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="max-w-3xl">
          <h2 className="text-base font-semibold">Phạm vi module</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">{summary}</p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {priorities.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4"
            >
              <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
              <p className="text-sm font-medium text-zinc-700">{item}</p>
            </div>
          ))}
        </div>
      </article>

      <aside className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Mốc tiếp theo</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">{nextMilestone}</p>
      </aside>
    </section>
  );
}
