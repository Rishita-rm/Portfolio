import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Rocket, Search, FolderOpen, BadgeCheck } from "lucide-react";

/** SkillsShowcaseDeluxe — fun + professional
 *  - animated borders, glow, magnetic tilt
 *  - flip card (front/back)
 *  - sparkline + radial ring
 *  - tabs with sliding indicator + search
 */

const DATA = [
  {
    title: "Python",
    cat: "Language",
    lvl: 5,
    dims: { depth: 5, breadth: 4, recency: 5, usage: 5 },
    tools: ["pandas", "numpy", "matplotlib"],
    proofs: { projects: 2, certs: 0 },
    wins: [
      "Automated EDA pack reduced manual analysis 60%",
      "Built feature store for churn model",
    ],
  },
  {
    title: "SQL (Postgres/MySQL)",
    cat: "Language",
    lvl: 5,
    dims: { depth: 5, breadth: 4, recency: 5, usage: 5 },
    tools: ["CTE", "window fn", "dbt"],
    proofs: { projects: 2, certs: 0 },
    wins: [
      "Rewrote legacy reports (2.4× faster)",
      "Modeled star schema for BI",
    ],
  },
  {
    title: "Pandas · NumPy",
    cat: "Language",
    lvl: 5,
    dims: { depth: 5, breadth: 4, recency: 5, usage: 5 },
    tools: ["merge", "groupby", "vectorize"],
    proofs: { projects: 1, certs: 0 },
    wins: ["Time-series prep pipeline (>10k rows/day)"],
  },
  {
    title: "Power BI",
    cat: "BI",
    lvl: 5,
    dims: { depth: 4, breadth: 4, recency: 5, usage: 5 },
    tools: ["DAX", "Power Query"],
    proofs: { projects: 2, certs: 0 },
    wins: ["Executive KPI deck (net promoter + revenue)"],
  },
  {
    title: "Tableau",
    cat: "BI",
    lvl: 4,
    dims: { depth: 4, breadth: 3, recency: 4, usage: 4 },
    tools: ["LOD", "Viz"],
    proofs: { projects: 0, certs: 0 },
    wins: ["Self-serve funnel exploration dashboard"],
  },
  {
    title: "scikit-learn",
    cat: "ML",
    lvl: 4,
    dims: { depth: 4, breadth: 3, recency: 4, usage: 4 },
    tools: ["Pipelines", "GridSearch"],
    proofs: { projects: 3, certs: 0 },
    wins: ["Classification model >90% hit for segments"],
  },
  {
    title: "Time Series (ARIMA/LSTM)",
    cat: "ML",
    lvl: 4,
    dims: { depth: 4, breadth: 3, recency: 4, usage: 3 },
    tools: ["ARIMA", "XGB", "LSTM"],
    proofs: { projects: 1, certs: 0 },
    wins: ["Weekly revenue forecast (MAPE < 10%)"],
  },
  {
    title: "ETL / Data Pipelines",
    cat: "Eng",
    lvl: 4,
    dims: { depth: 4, breadth: 4, recency: 4, usage: 4 },
    tools: ["Airflow", "dbt"],
    proofs: { projects: 1, certs: 0 },
    wins: ["Incremental jobs + data quality checks"],
  },
  {
    title: "Flask / FastAPI",
    cat: "Eng",
    lvl: 4,
    dims: { depth: 3, breadth: 3, recency: 4, usage: 4 },
    tools: ["REST", "Uvicorn"],
    proofs: { projects: 2, certs: 0 },
    wins: ["Served model as API for ops tool"],
  },
  {
    title: "Cloud (AWS/GCP/Azure)",
    cat: "Eng",
    lvl: 3,
    dims: { depth: 3, breadth: 3, recency: 3, usage: 3 },
    tools: ["S3/GCS", "IAM"],
    proofs: { projects: 0, certs: 0 },
    wins: ["Secure artifact store + role policies"],
  },
];

const TABS = ["All", "Language", "BI", "ML", "Eng"];

export default function SkillsShowcaseDeluxe({ title = "Core Skills" }) {
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return DATA.filter(
      (s) =>
        (tab === "All" || s.cat === tab) &&
        (!needle ||
          s.title.toLowerCase().includes(needle) ||
          s.tools.some((t) => t.toLowerCase().includes(needle)))
    ).sort((a, b) => b.lvl - a.lvl);
  }, [tab, q]);

  // measure active tab underline
  const tabRefs = useRef({});
  useEffect(() => {
    const el = tabRefs.current[tab];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pr = el.parentElement.getBoundingClientRect();
    setIndicator({ left: r.left - pr.left, width: r.width });
  }, [tab]);

  return (
    <section id="skills-deluxe" className="relative">
      {/* header */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Rocket className="text-amber-400" size={18} />
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide">
          {title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="text-gradient">{title.split(" ").slice(-1)}</span>
        </h2>

        <div className="ml-auto flex items-center gap-3">
          {/* tabs */}
          <div className="tabs-track flex gap-2 border border-zinc-800 rounded-full px-2 py-1 bg-zinc-900/50">
            {TABS.map((t) => (
              <button
                key={t}
                ref={(el) => (tabRefs.current[t] = el)}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-full text-xs transition ${
                  tab === t ? "text-white" : "text-zinc-300 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
            <span
              className="tabs-indicator"
              style={{ left: indicator.left, width: indicator.width }}
            />
          </div>

          {/* search */}
          <label className="group flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-300">
            <Search
              size={14}
              className="transition-transform group-focus-within:rotate-90"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Python, DAX, ARIMA…"
              className="bg-transparent outline-none placeholder:text-zinc-500 w-44 focus:w-56 transition-all"
            />
          </label>
        </div>
      </div>

      {/* grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <SkillCard key={it.title} it={it} delay={i * 0.05} />
        ))}
      </div>
    </section>
  );
}

/* ---------------- card ---------------- */

function SkillCard({ it, delay = 0 }) {
  const [flipped, setFlipped] = useState(false);

  // magnetic tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-40, 40], [8, -8]), {
    stiffness: 200,
    damping: 15,
  });
  const ry = useSpring(useTransform(x, [-40, 40], [-8, 8]), {
    stiffness: 200,
    damping: 15,
  });

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - (r.left + r.width / 2));
    y.set(e.clientY - (r.top + r.height / 2));
    // drive the shine highlight
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    e.currentTarget.style.setProperty("--mx", mx + "%");
    e.currentTarget.style.setProperty("--my", my + "%");
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.45, delay }}
      className="relative"
    >
      <motion.article
        style={reduced ? undefined : { rotateX: rx, rotateY: ry }}
        onMouseMove={reduced ? undefined : onMove}
        onMouseLeave={reduced ? undefined : onLeave}
        onClick={() => !reduced && setFlipped((v) => !v)}
        className="border-aurora card-shine rounded-2xl cursor-pointer select-none"
      >
        {/* FIX: give the flipper a fixed height so absolute faces can fill it */}
        <div
          className={`relative h-[200px] sm:h-[210px] rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 p-4 [backface-visibility:hidden] flex flex-col">
            <Front it={it} />
          </div>

          {/* BACK FACE */}
          <div className="absolute inset-0 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col">
            <Back it={it} />
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function Front({ it }) {
  const pct = (it.lvl / 5) * 100;
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{it.title}</h3>
            <span className="text-[10px] rounded-full px-2 py-0.5 border border-zinc-700 text-zinc-400">
              Lv {it.lvl}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {BLURB[it.cat] || "Data competency"}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-300">
            {it.tools.map((t) => (
              <li
                key={t}
                className="rounded-full border border-zinc-700/70 px-2 py-0.5"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="shrink-0">
          <Sparkline seed={it.title} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <Ring value={pct} />
        <div className="flex items-center gap-3 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1">
            <FolderOpen size={14} className="text-emerald-400" />{" "}
            {it.proofs.projects} projects
          </span>
          {!!it.proofs.certs && (
            <span className="inline-flex items-center gap-1">
              <BadgeCheck size={14} className="text-sky-400" />{" "}
              {it.proofs.certs} certs
            </span>
          )}
        </div>
      </div>

      <p className="mt-auto text-[11px] text-zinc-500">
        Click card to flip <span aria-hidden>↺</span>
      </p>
    </div>
  );
}

function Back({ it }) {
  return (
    <div className="h-full flex flex-col">
      <h4 className="font-semibold">Evidence</h4>
      <ul className="mt-2 text-sm text-zinc-300 list-disc pl-5 space-y-1">
        {it.wins?.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
      <div className="mt-auto text-[11px] text-zinc-500">
        Click to flip back
      </div>
    </div>
  );
}

/* -------- visuals: ring + sparkline -------- */

function Ring({ value }) {
  const R = 16;
  const C = 2 * Math.PI * R;
  const dash = C * (1 - value / 100);
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <g transform="translate(28,28) rotate(-90)">
        <circle r={R} fill="none" stroke="#27272a" strokeWidth="8" />
        <motion.circle
          r={R}
          fill="none"
          stroke="url(#grad)"
          strokeWidth="8"
          strokeDasharray={C}
          strokeDashoffset={C}
          initial={{ strokeDashoffset: C }}
          whileInView={{ strokeDashoffset: dash }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9 }}
        />
        <circle r="2" fill="#f59e0b" />
      </g>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Sparkline({ seed }) {
  // deterministic pseudo series from title
  const n = 10;
  let s = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const pts = Array.from(
    { length: n },
    (_, i) => 6 + rand() * 6 + (i > 0 ? 0.2 * i : 0)
  );
  const w = 90,
    h = 42,
    pad = 6;
  const min = Math.min(...pts),
    max = Math.max(...pts);
  const X = (i) => pad + (i * (w - pad * 2)) / (n - 1);
  const Y = (v) => h - pad - ((v - min) * (h - pad * 2)) / (max - min || 1);
  const d = "M " + pts.map((v, i) => `${X(i)} ${Y(v)}`).join(" L ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="sl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <motion.path
        d={d}
        fill="none"
        stroke="url(#sl)"
        strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.0 }}
      />
    </svg>
  );
}

const BLURB = {
  Language: "EDA, joins, vectorized ops, automation",
  BI: "interactive dashboards, KPI tiles, LOD/DAX",
  ML: "classification, regression, time series",
  Eng: "pipelines, serving, cloud deploys",
};
