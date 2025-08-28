export default function Timeline({ items }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Experience</h2>
      <p className="text-sm text-zinc-400 mb-6">
        From analytics to ML to full-stack data apps.
      </p>

      <ol className="relative border-l border-zinc-800">
        {items.map((it, i) => (
          <li key={i} className="mb-8 ml-6">
            <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h3 className="font-semibold">
                {it.role} · {it.org}
              </h3>
              <div className="text-xs text-zinc-400">{it.when}</div>
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-zinc-300 space-y-1">
              {it.bullets.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
