import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  Swords,
  LineChart,
  Award,
} from "lucide-react";

export default function ExperienceArcade({ items = [] }) {
  const data = useMemo(() => normalize(items).sort(byStartDesc), [items]);

  // active quest (role)
  const [i, setI] = useState(0);
  const active = data[i];

  // XP + level
  const allXP = useMemo(() => data.map(scoreXP), [data]);
  const cumulative = useMemo(() => cumulate(allXP), [allXP]);

  // animate displayed XP when switching
  const [shownXP, setShownXP] = useState(cumulative[i] || 0);
  useEffect(
    () => animateNumber(shownXP, cumulative[i] || 0, 500, setShownXP),
    [i]
  ); // animate to target

  const lvl = levelFromXP(shownXP);
  const nextCap = XP_CAPS[Math.min(XP_CAPS.length - 1, lvl + 1)];
  const prevCap = XP_CAPS[lvl];
  const lvlPct = clamp01((shownXP - prevCap) / (nextCap - prevCap || 1));

  const next = () => setI((x) => (x + 1) % data.length);
  const prev = () => setI((x) => (x - 1 + data.length) % data.length);

  return (
    <section className="relative">
      {/* HUD — Level / XP / Badges */}
      <HUD lvl={lvl} xp={shownXP} pct={lvlPct} badges={deriveBadges(data)} />

      <div className="mt-6 grid lg:grid-cols-[260px,1fr,320px] gap-6">
        {/* Quest Map (timeline) */}
        <QuestMap data={data} activeIdx={i} onSelect={setI} />

        {/* Quest Card */}
        <AnimatePresence mode="wait">
          <motion.article
            key={active.role + active.company}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur overflow-hidden"
          >
            <QuestCard item={active} idx={i} />
          </motion.article>
        </AnimatePresence>

        {/* Loot / Stats */}
        <LootPanel item={active} />
      </div>

      {/* Nav */}
      <div className="mt-4 flex gap-3">
        <NavBtn onClick={prev} label="Previous">
          <ChevronLeft />
        </NavBtn>
        <NavBtn onClick={next} label="Next">
          <ChevronRight />
        </NavBtn>
      </div>
    </section>
  );
}

/* ---------------- HUD ---------------- */

function HUD({ lvl, xp, pct, badges }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-3">
        <Trophy size={22} className="text-amber-400" />
        <div className="text-xl md:text-3xl font-extrabold">Career Quest</div>
        <div className="ml-auto text-xs text-zinc-400">Level</div>
        <div className="text-lg font-extrabold tabular-nums leading-none">
          {lvl}
        </div>
      </div>

      {/* XP bar */}
      <div className="mt-3 h-3 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="mt-1 text-xs text-zinc-400">{xp} XP</div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        {badges.map((b) => (
          <Badge key={b.key} icon={b.icon} label={b.label} earned={b.earned} />
        ))}
      </div>
    </div>
  );
}

function Badge({ icon, label, earned }) {
  return (
    <div
      className={`group inline-flex items-center gap-2 rounded-full px-3 py-1 border text-xs transition ${
        earned
          ? "border-amber-400/70 bg-amber-400/10 text-amber-200"
          : "border-zinc-700 text-zinc-400"
      }`}
      title={label}
    >
      <Sparkles
        size={14}
        className={earned ? "text-amber-400" : "text-zinc-500"}
      />
      <span className="truncate">{label}</span>
    </div>
  );
}

/* ---------------- Quest Map ---------------- */

function QuestMap({ data, activeIdx, onSelect }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="text-xs text-zinc-400 mb-3">Quest map</div>
      <div className="relative">
        <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-zinc-800/80" />
        <ul className="space-y-3">
          {data.map((d, i) => (
            <li key={d.role + d.company} className="relative pl-8">
              <button
                onClick={() => onSelect(i)}
                className={`group w-full text-left rounded-lg px-2 py-2 transition ${
                  i === activeIdx ? "bg-zinc-800/70" : "hover:bg-zinc-800/40"
                }`}
              >
                <div className="absolute left-0 top-1.5">
                  <span
                    className={`block h-3.5 w-3.5 rounded-full border ${
                      i <= activeIdx
                        ? "bg-amber-400 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,.6)]"
                        : "bg-zinc-900 border-zinc-700"
                    }`}
                  />
                </div>
                <div className="text-[11px] text-zinc-400">{d.period}</div>
                <div className="text-sm font-medium truncate">
                  {d.role}{" "}
                  {d.company ? (
                    <span className="text-zinc-400">@ {d.company}</span>
                  ) : null}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Quest Card (center) ---------------- */

function QuestCard({ item }) {
  const bullets = item.summary
    ? [item.summary]
    : (item.bullets || []).slice(0, 4);

  return (
    <div className="p-6">
      <div className="text-xs text-zinc-400">{item.period}</div>
      <h3 className="mt-1 text-2xl font-extrabold leading-tight">
        {item.role}{" "}
        {item.company ? (
          <span className="text-zinc-400 font-semibold">@ {item.company}</span>
        ) : null}
      </h3>

      <div className="mt-4 space-y-2">
        {bullets.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            className="flex items-start gap-2"
          >
            <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,.7)]" />
            <p className="text-sm text-zinc-300">{q}</p>
          </motion.div>
        ))}
      </div>

      {Boolean(item.stack && item.stack.length) && (
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          {item.stack.slice(0, 10).map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="rounded-full border border-zinc-700 px-2 py-0.5 text-zinc-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Loot (right panel) ---------------- */

function LootPanel({ item }) {
  const m = item.metrics || {};
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Swords size={14} /> Loot & stats
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Ring label="KPIs" value={(m.kpis ?? 3) / 5} />
        <Ring label="Time saved" value={(m.time ?? 30) / 100} suffix="%" />
        <Ring label="Growth" value={(m.growth ?? 12) / 100} suffix="%" />
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <LineChart size={14} /> before → after
        </div>
        <Sparkline seed={item.role + item.company} />
      </div>

      {!!item.highlights?.length && (
        <div className="mt-5">
          <div className="text-xs text-zinc-400 mb-2">Selected work</div>
          <div className="space-y-2">
            {item.highlights.slice(0, 3).map((p, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800 p-3 text-xs"
              >
                <div className="font-semibold text-zinc-200">
                  {p.title || p.name || "Project"}
                </div>
                {p.desc && <div className="mt-1 text-zinc-400">{p.desc}</div>}
                {!!p.tags?.length && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags.slice(0, 6).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-zinc-700 px-2 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- visuals ---------------- */

function Ring({ label, value, suffix = "" }) {
  const pct = clamp01(value);
  const R = 18,
    C = 2 * Math.PI * R;
  const dash = C * (1 - pct);
  const display = Math.round(pct * 100);

  return (
    <div className="grid place-items-center">
      <svg width="66" height="66" viewBox="0 0 66 66">
        <g transform="translate(33,33) rotate(-90)">
          <circle r={R} fill="none" stroke="#27272a" strokeWidth="8" />
          <motion.circle
            r={R}
            fill="none"
            stroke="url(#rg)"
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
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-xs font-semibold">
        {display}
        {suffix}
      </div>
      <div className="text-[10px] text-zinc-400">{label}</div>
    </div>
  );
}

function Sparkline({ seed }) {
  const n = 12;
  let s = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const pts = Array.from({ length: n }, (_, i) => 6 + rnd() * 6 + i * 0.25);
  const w = 280,
    h = 72,
    pad = 8;
  const min = Math.min(...pts),
    max = Math.max(...pts);
  const X = (i) => pad + (i * (w - pad * 2)) / (n - 1);
  const Y = (v) => h - pad - ((v - min) * (h - pad * 2)) / (max - min || 1);
  const d = "M " + pts.map((v, i) => `${X(i)} ${Y(v)}`).join(" L ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mt-2">
      <defs>
        <linearGradient id="sl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,77,77,.25)" />
          <stop offset="100%" stopColor="rgba(245,158,11,.06)" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${d} L ${X(n - 1)} ${h - pad} L ${X(0)} ${h - pad} Z`}
        fill="url(#area)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.9 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="url(#sl)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.0 }}
      />
    </svg>
  );
}

/* ---------------- helpers / scoring ---------------- */

const XP_CAPS = [0, 600, 1400, 2600, 4200, 6200, 8600, 11400]; // lv0..lv7

function levelFromXP(xp) {
  let lvl = 0;
  for (let i = 0; i < XP_CAPS.length; i++) if (xp >= XP_CAPS[i]) lvl = i;
  return Math.min(lvl, XP_CAPS.length - 1);
}

function scoreXP(item) {
  const m = item.metrics || {};
  const kpis = (m.kpis ?? 3) * 80; // KPIs added/owned
  const timeSave = (m.time ?? 30) * 4; // time saved %
  const growth = (m.growth ?? 12) * 6; // growth/accuracy %
  const proj = (item.highlights?.length || 1) * 70;
  const seniority = yearWeight(item.start, item.end) * 60;
  return Math.round(300 + kpis + timeSave + growth + proj + seniority);
}

function cumulate(arr) {
  const out = [];
  let s = 0;
  for (let i = 0; i < arr.length; i++) {
    s += arr[i];
    out.push(s);
  }
  return out;
}

function yearWeight(start, end) {
  const s = yearOf(start);
  const eStr = String(end || "");
  const e = /present/i.test(eStr) ? new Date().getFullYear() : yearOf(eStr);
  if (!s || !e) return 1;
  return Math.max(1, Math.min(5, e - s)); // clamp 1..5
}

function yearOf(s) {
  const m = String(s || "").match(/(\d{4})/);
  return m ? +m[1] : 0;
}
function byStartDesc(a, b) {
  return (yearOf(b.start) || 0) - (yearOf(a.start) || 0);
}
function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function animateNumber(from, to, ms, setter) {
  if (from === to) return;
  const t0 = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - t0) / ms);
    const cur = Math.round(from + (to - from) * t);
    setter(cur);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function normalize(items) {
  return items.map((it, idx) => {
    const role = it.role || it.title || it.position || `Role ${idx + 1}`;
    const company = it.company || it.place || it.org || "";

    // do NOT default end to "Present" anymore
    const [pStart, pEnd] = (it.period || "")
      .split(/—|–|-/) // supports em/en dash or hyphen
      .map((s) => (s || "").trim());

    const start = it.start ?? pStart ?? "";
    const end = it.end ?? pEnd ?? ""; // keep empty if not provided

    // show only start if end is empty
    const period = end ? `${start} — ${end}` : `${start}`;

    return {
      ...it,
      role,
      company,
      start,
      end,
      period,
      bullets: it.bullets || it.points || it.details || [],
      stack: it.stack || it.skills || it.tags || [],
      highlights: it.highlights || it.projects || [],
      metrics: it.metrics || {
        kpis: it.kpis ?? 3,
        time: it.time ?? 30,
        growth: it.growth ?? 12,
      },
    };
  });
}

function deriveBadges(data) {
  const flatStack = new Set(data.flatMap((d) => d.stack || []));
  const hasBI = ["Power BI", "Tableau"].some((s) => flatStack.has(s));
  const hasML = ["scikit-learn", "XGB", "LSTM", "ARIMA"].some((s) =>
    flatStack.has(s)
  );
  const hasETL = ["Airflow", "dbt", "ETL"].some((s) => flatStack.has(s));
  const bigImpact = data.some(
    (d) => (d.metrics?.time ?? 0) >= 40 || (d.metrics?.growth ?? 0) >= 15
  );
  return [
    { key: "viz", label: "Viz Wizard", icon: <Star />, earned: hasBI },
    { key: "ml", label: "Model Crafter", icon: <Star />, earned: hasML },
    { key: "etl", label: "ETL Master", icon: <Star />, earned: hasETL },
    {
      key: "impact",
      label: "Impact Maker",
      icon: <Award />,
      earned: bigImpact,
    },
  ];
}

function NavBtn({ onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="h-10 w-10 grid place-items-center rounded-full border border-zinc-700 bg-zinc-900/70 hover:bg-zinc-800/70"
    >
      {children}
    </button>
  );
}
