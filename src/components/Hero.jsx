// src/components/Hero.jsx
import DataBackdrop from "./DataBackdrop.jsx";
import AudioPlayer from "./AudioPlayer.jsx";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LineChart as LineIcon, Sparkles } from "lucide-react";

/**
 * Hero — polished version
 * - text shimmer on the key phrase (needs .text-shimmer in index.css)
 * - Tilt wrapper on KPI card
 * - Animated counters for quick impact stats
 * - Scroll cue at bottom
 */

export default function Hero() {
  const roles = ["Data Analyst", "Business Intelligence", "ML Enthusiast"];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* background layers */}
      <DataBackdrop />
      <AudioPlayer />

      <div className="relative mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-10 items-center">
        {/* LEFT: Headline + Copy */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/70 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-300 backdrop-blur">
            <Sparkles size={14} className="text-red-400" />
            Rishita Makkar — focused on outcomes
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mt-4 font-black leading-tight tracking-tight text-[clamp(2rem,6vw,4.25rem)]"
          >
            I turn raw data into
            <span className="block text-gradient text-shimmer">
              decision-ready insight.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.55 }}
            className="mt-4 max-w-2xl text-zinc-300"
          >
            Analytics-for-ops specialist focused on churn, funnel, and revenue
            KPIs. Stack: SQL • Python • Power BI • Tableau • scikit-learn. I
            ship dashboards and lightweight ML that cut time-to-insight and move
            metrics.
          </motion.p>

          {/* Role typewriter */}
          <div className="mt-3 text-sm text-zinc-400">
            <Typewriter words={roles} />
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#projects"
              className="rounded-xl bg-white text-zinc-900 px-4 py-2 text-sm font-semibold"
            >
              See projects
            </a>
            <a
              href="/Rishita_Resume.pdf" /* put your PDF in /public */
              className="rounded-xl border border-red-500/40 px-4 py-2 text-sm hover:bg-red-500/10"
            >
              Download résumé
            </a>
            <a
              href="#projects"
              className="rounded-xl bg-gradient-to-r from-red-500 to-amber-400 px-4 py-2 text-sm font-semibold"
            >
              View 1-page case study
            </a>
          </motion.div>

          {/* quick impact counters */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Tile label="dashboards shipped">
              <Counter
                to={12}
                className="text-2xl font-extrabold text-amber-300"
              />
            </Tile>
            <Tile label="forecast hit rate">
              <Counter
                to={90}
                suffix="%"
                className="text-2xl font-extrabold text-emerald-400"
              />
            </Tile>
            <Tile label="rows processed / day">
              <Counter
                to={10000}
                className="text-2xl font-extrabold text-red-400"
              />
            </Tile>
          </div>

          {/* (optional) keep your existing impact chips section below if you like */}
        </div>

        {/* RIGHT: Live KPI card with subtle tilt */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="lg:justify-self-end w-full"
        >
          <Tilt max={8}>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <div className="font-semibold">KPI — Weekly Revenue</div>
                <LineIcon size={18} className="text-amber-300" />
              </div>
              <div className="mt-1 text-xs text-zinc-400">Synthetic sample</div>
              <MiniChart />
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border border-zinc-800 p-3">
                  <div className="text-xs text-zinc-400">WoW</div>
                  <div className="font-semibold text-emerald-400">+7.8%</div>
                </div>
                <div className="rounded-xl border border-zinc-800 p-3">
                  <div className="text-xs text-zinc-400">YTD</div>
                  <div className="font-semibold text-emerald-400">+18.2%</div>
                </div>
                <div className="rounded-xl border border-zinc-800 p-3">
                  <div className="text-xs text-zinc-400">Forecast</div>
                  <div className="font-semibold">Stable</div>
                </div>
              </div>
            </div>
          </Tilt>
        </motion.div>
      </div>

      {/* scroll cue */}
      <a
        href="#skills"
        className="group absolute left-1/2 -translate-x-1/2 bottom-6 inline-flex flex-col items-center text-xs text-zinc-400"
      >
        <span className="rounded-full border border-zinc-700/70 p-2 bg-zinc-900/60 backdrop-blur">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="animate-bounce"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="mt-1 opacity-80 group-hover:opacity-100 transition">
          Scroll
        </span>
      </a>
    </section>
  );
}

/* ---------- tiny helper bits ---------- */

function Tile({ label, children }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-xs text-zinc-400">{label}</div>
      {children}
    </div>
  );
}

/* simple raf counter */
function Counter({
  from = 0,
  to = 100,
  duration = 1200,
  className = "",
  suffix = "",
}) {
  const [val, setVal] = useState(from);
  useEffect(() => {
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setVal(Math.floor(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [from, to, duration]);
  return (
    <span className={className}>
      {val}
      {suffix}
    </span>
  );
}

/* tiny 3D tilt */
function Tilt({ children, max = 10 }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({ transform: "perspective(900px)" });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      setStyle({
        transform: `perspective(900px) rotateX(${(-py * max).toFixed(
          2
        )}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0)`,
      });
    };
    const onLeave = () =>
      setStyle({ transform: "perspective(900px) rotateX(0deg) rotateY(0deg)" });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [max]);

  return (
    <div
      ref={ref}
      style={style}
      className="transition-transform duration-150 will-change-transform"
    >
      {children}
    </div>
  );
}

/* --- Typewriter (unchanged) --- */
function Typewriter({ words, speed = 65, hold = 1100 }) {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | holding | deleting

  useEffect(() => {
    let t;
    const word = words[i % words.length];
    if (phase === "typing") {
      if (txt.length < word.length)
        t = setTimeout(() => setTxt(word.slice(0, txt.length + 1)), speed);
      else t = setTimeout(() => setPhase("holding"), hold);
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), 350);
    } else {
      if (txt.length > 0)
        t = setTimeout(
          () => setTxt(word.slice(0, txt.length - 1)),
          speed * 0.6
        );
      else {
        setI((x) => x + 1);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [txt, phase, i, words, speed, hold]);

  return (
    <span>
      <span className="text-red-400 font-medium">{txt}</span>
      <span className="ml-0.5 inline-block h-5 w-[2px] align-[-2px] bg-amber-300 animate-pulse" />
    </span>
  );
}

/* --- Mini KPI Chart (unchanged, Marvel gradient) --- */
function MiniChart() {
  const points = [6, 7, 7.5, 7.2, 8.1, 8.6, 9.2, 9.0, 9.8, 10.4, 10.1, 10.9];
  const w = 320,
    h = 120,
    pad = 10;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const X = (i) => pad + (i * (w - pad * 2)) / (points.length - 1);
  const Y = (v) => h - pad - ((v - min) * (h - pad * 2)) / (max - min || 1);
  const d = "M " + points.map((v, i) => `${X(i)} ${Y(v)}`).join(" L ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full">
      <defs>
        <linearGradient id="gradLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,77,77,0.35)" />
          <stop offset="100%" stopColor="rgba(245,158,11,0.06)" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${d} L ${X(points.length - 1)} ${h - pad} L ${X(0)} ${h - pad} Z`}
        fill="url(#gradArea)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="url(#gradLine)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      {points.map((v, i) => (
        <motion.circle
          key={i}
          cx={X(i)}
          cy={Y(v)}
          r="2.6"
          fill="#f59e0b"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.05 }}
        />
      ))}
    </svg>
  );
}
