import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Filter,
  GitMerge as Combine,
  LineChart,
  Brain,
  Gauge,
} from "lucide-react";

/**
 * DATA PIPELINE – IntroSequence (Big Lock FX)
 * - Runs every refresh (App.jsx shows unless ?skip=intro)
 * - Pipeline progress -> ACCESS GRANTED card -> Large Lock open FX -> portfolio
 * - A11y: progressbar, keyboard skip, respects reduced-motion
 */
export default function IntroSequence({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState("loading"); // "loading" | "card" | "unlocking"

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  const lines = [
    "Connecting data sources…",
    "Cleaning & validating records…",
    "Joining tables & enriching…",
    "Exploratory analysis in progress…",
    "Training quick models (scikit-learn)…",
    "Rendering BI dashboards…",
    "Finalizing analyst workspace…",
    "Ready.",
  ];

  const stages = [
    { key: "sources", label: "Sources", Icon: Database },
    { key: "clean", label: "Clean", Icon: Filter },
    { key: "join", label: "Join", Icon: Combine },
    { key: "analyze", label: "Analyze", Icon: Gauge },
    { key: "model", label: "Model", Icon: Brain },
    { key: "visualize", label: "Visualize", Icon: LineChart },
  ];

  // drive progress
  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(100);
      setStep(lines.length - 1);
      const t = setTimeout(() => setStage("card"), 150);
      return () => clearTimeout(t);
    }

    let i = 0;
    const totalTicks = 120; // ~4.2s @ 35ms
    const interval = setInterval(() => {
      i += 1;
      const p = Math.min(100, Math.round((i / totalTicks) * 100));
      setProgress(p);
      const idx = Math.min(
        lines.length - 1,
        Math.floor((p / 100) * lines.length)
      );
      setStep(idx);

      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setStage("card"), 320);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const skipToCard = () => setStage("card");

  // keyboard skip
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        skipToCard();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const stageActive = (idx) => {
    const pct = (idx / (stages.length - 1)) * 100;
    return progress >= pct - 1;
  };

  return (
    <div className="fixed inset-0 z-[999] bg-gradient-to-b from-[#07070a] to-[#0a0a0f]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />

      {/* main card while loading */}
      {stage !== "unlocking" && (
        <div className="h-full w-full grid place-items-center px-4">
          <AnimatePresence>
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur p-6 shadow-[0_0_40px_rgba(124,58,237,0.25)]"
            >
              <h2 className="text-center text-lg sm:text-xl font-semibold tracking-wide">
                INITIALIZING DATA PIPELINE…
              </h2>

              {/* progress track */}
              <div className="relative mx-auto mt-5 h-2 w-full max-w-[640px] rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
                <div className="pointer-events-none absolute inset-0 [box-shadow:0_0_24px_6px_rgba(217,70,239,0.15)_inset]" />
              </div>

              {/* pipeline nodes */}
              <div className="mt-4 mx-auto max-w-[640px] flex items-start justify-between">
                {stages.map((s, i) => {
                  const active = stageActive(i);
                  return (
                    <div
                      key={s.key}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={`grid place-items-center h-9 w-9 rounded-full border ${
                          active
                            ? "bg-violet-600/30 border-violet-400 shadow-[0_0_18px_rgba(167,139,250,0.35)]"
                            : "bg-zinc-900 border-zinc-700"
                        }`}
                      >
                        <s.Icon
                          size={18}
                          className={
                            active ? "text-violet-200" : "text-zinc-400"
                          }
                        />
                      </div>
                      <div className="text-[10px] sm:text-xs text-zinc-400">
                        {s.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* status + controls */}
              <div className="mt-5 text-center">
                <div
                  className="text-sm text-zinc-400"
                  role="status"
                  aria-live="polite"
                >
                  {Math.min(progress, 100)}% complete — {lines[step]}
                </div>
                <div className="mt-3 text-xs text-zinc-500">
                  <button
                    onClick={skipToCard}
                    className="underline underline-offset-4 hover:text-zinc-300"
                  >
                    Skip intro
                  </button>
                  <span className="ml-2 hidden sm:inline">
                    or press{" "}
                    <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Enter</kbd>
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ACCESS GRANTED card */}
      {stage === "card" && (
        <UnlockCard
          onContinue={() => setStage("unlocking")}
          autoAfterMs={1300}
        />
      )}

      {/* Big Lock FX */}
      {stage === "unlocking" && <LockOpenFX onComplete={() => onDone?.()} />}
    </div>
  );
}

/* ---------------- ACCESS GRANTED CARD ---------------- */
function UnlockCard({ onContinue, autoAfterMs = 1300 }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 120);
    const t2 = setTimeout(() => onContinue?.(), autoAfterMs);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onContinue, autoAfterMs]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 grid place-items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-500/30 bg-zinc-900/90 p-6 text-center max-w-md mx-auto shadow-[0_0_30px_rgba(16,185,129,0.25)]"
      >
        <h3
          className="text-2xl font-extrabold tracking-wide glitch"
          data-text="ACCESS GRANTED"
        >
          ACCESS GRANTED
        </h3>
        <p className="mt-2 text-sm text-zinc-300">
          Welcome, Analyst. Your portfolio is now unlocked.
        </p>
        <button
          onClick={onContinue}
          className="mt-4 rounded-xl bg-white text-zinc-900 px-5 py-2 text-sm font-semibold"
        >
          Enter
        </button>
      </motion.div>
    </div>
  );
}

/* ---------------- BIG LOCK OPEN FX ---------------- */
function LockOpenFX({ onComplete }) {
  // finish after ~1.6s
  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 1600);
    return () => clearTimeout(t);
  }, [onComplete]);

  // evenly spaced particles
  const particles = Array.from({ length: 28 }, (_, i) => ({
    angle: (i * 360) / 28,
    dist: 320, // px travel
    delay: 0.35,
  }));

  return (
    <div className="absolute inset-0 grid place-items-center pointer-events-none">
      {/* dim backdrop + subtle flash */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.28, 0.18] }}
        transition={{ duration: 0.7 }}
      />

      {/* shockwave rings */}
      <ShockwaveRing delay={0.25} />
      <ShockwaveRing delay={0.45} lighter />

      {/* GIANT lock */}
      <BigLock />

      {/* burst particles */}
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute h-1 w-10 rounded-full bg-emerald-400/80"
          style={{
            transformOrigin: "center left",
            rotate: p.angle,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0], x: [0, p.dist] }}
          transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* -- pieces used by LockOpenFX -- */

function ShockwaveRing({ delay = 0.25, lighter = false }) {
  return (
    <motion.div
      className={`absolute rounded-full ${
        lighter ? "border-emerald-300/50" : "border-emerald-400/70"
      }`}
      style={{
        width: "clamp(240px, 26vmin, 520px)",
        height: "clamp(240px, 26vmin, 520px)",
      }}
      initial={{ scale: 0.3, opacity: 0.9 }}
      animate={{ scale: 6, opacity: 0 }}
      transition={{ duration: 1.1, delay, ease: "easeOut" }}
    />
  );
}

function BigLock() {
  return (
    <motion.svg
      width="clamp(260px, 34vmin, 560px)"
      height="clamp(260px, 34vmin, 560px)"
      viewBox="0 0 560 560"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <defs>
        {/* neon gradient & glow */}
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* body */}
      <motion.rect
        x="130"
        y="220"
        rx="28"
        width="300"
        height="260"
        fill="#0b1220"
        stroke="url(#grad)"
        strokeWidth="10"
        filter="url(#glow)"
        initial={{ y: 220 }}
        animate={{ y: [220, 216, 220] }} // tiny "thunk" bounce
        transition={{ delay: 0.35, duration: 0.45 }}
      />

      {/* shackle */}
      <motion.path
        d="M180 220 v-80 a100 100 0 0 1 200 0 v80"
        fill="none"
        stroke="url(#grad)"
        strokeWidth="18"
        strokeLinecap="round"
        filter="url(#glow)"
        style={{ originX: 280, originY: 220 }} // pivot around base center
        initial={{ rotate: 0 }}
        animate={{ rotate: -35 }}
        transition={{ delay: 0.38, duration: 0.45, ease: "easeOut" }}
      />

      {/* keyhole */}
      <motion.circle
        cx="280"
        cy="330"
        r="16"
        fill="url(#grad)"
        initial={{ scale: 0.9, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
      <motion.rect
        x="272"
        y="346"
        rx="6"
        width="16"
        height="40"
        fill="url(#grad)"
        initial={{ scaleY: 0.8, opacity: 0.7 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />

      {/* glossy sweep across body */}
      <motion.rect
        x="130"
        y="220"
        width="300"
        height="260"
        rx="28"
        fill="url(#grad)"
        opacity="0.12"
        initial={{ x: -360 }}
        animate={{ x: 360 }}
        transition={{ delay: 0.48, duration: 0.7, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}
