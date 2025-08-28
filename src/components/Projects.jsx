import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crosshair,
  Target,
  RefreshCw,
  ExternalLink,
  MousePointer2,
  Zap,
} from "lucide-react";

/* ===========================================================
   PROJECTS — Neon Arcade (Shock Mode)
   - Neon vortex + starfield + hex shimmer + vignette
   - Glass/refraction orbs with rim light & rotating caustics
   - Plasma bolts w/ additive trails
   - On-hit: supernova ring, chromatic burst, scanlines, spark shards
   - Screen-shake + micro slow-mo + combo meter
   - Motion-safe toggle
   =========================================================== */

export default function Projects({ projects = [] }) {
  const items = useMemo(() => normalize(projects), [projects]);
  return (
    <section>
      <HUD />
      <ShooterBoard items={items} />
    </section>
  );
}

/* ------------------------ HUD ------------------------ */

function HUD() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[.10] bg-[radial-gradient(1000px_460px_at_20%_-20%,rgba(168,85,247,.22),transparent_60%),radial-gradient(900px_420px_at_80%_-10%,rgba(250,204,21,.16),transparent_60%)]" />
      <div className="flex items-center gap-2 text-xs text-zinc-300 relative">
        <Crosshair size={14} className="text-amber-300" />
        <span className="font-medium">
          Neon Arcade — pop a bubble to reveal a project
        </span>
        <span className="ml-auto text-[11px] text-zinc-400 hidden sm:inline">
          Tip: click / space to shoot • R reset • M aim on/off • S motion safe
        </span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className="h-full"
          style={{
            background:
              "linear-gradient(90deg,#ff4d4d, #f59e0b 30%, #22d3ee 60%, #a78bfa)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* -------------------- Shooter Board -------------------- */

function ShooterBoard({ items }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  const [modalIdx, setModalIdx] = useState(null);
  const [hits, setHits] = useState(0);
  const [showAim, setShowAim] = useState(true);
  const [seed, setSeed] = useState(2025);
  const [motionSafe, setMotionSafe] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.matchMedia?.("(prefers-reduced-motion: no-preference)")?.matches;
  });

  const g = useRef({
    w: 960,
    h: 520,
    dpr: 1,
    time: 0,
    last: 0,
    // entities
    bubbles: [],
    shots: [],
    effects: [],
    // background
    starsFar: [],
    starsNear: [],
    lensDirt: [],
    // camera FX
    shake: { t: 0, amp: 0 },
    chroma: { t: 0, k: 0 },
    slow: { t: 0 },
    combo: { n: 0, last: 0 },
    // cannon
    cannon: { x: 0, y: 0, angle: -Math.PI / 2, recoil: 0 },
  });

  /* size & DPR */
  useEffect(() => {
    const el = wrapRef.current;
    const cvs = canvasRef.current;
    if (!el || !cvs) return;

    const resize = () => {
      const rect = el.getBoundingClientRect();
      const W = Math.max(720, Math.min(1200, Math.floor(rect.width)));
      const H = 520;
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      const state = g.current;
      state.w = W;
      state.h = H;
      state.dpr = dpr;

      cvs.width = Math.floor(W * dpr);
      cvs.height = Math.floor(H * dpr);
      cvs.style.width = `${W}px`;
      cvs.style.height = `${H}px`;

      state.cannon.x = W / 2;
      state.cannon.y = H - 28;

      if (!state.starsFar.length) {
        state.starsFar = makeStars(80, W, H, 0.25);
        state.starsNear = makeStars(50, W, H, 0.55);
        state.lensDirt = makeDirt(42, W, H);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* input */
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const state = g.current;

    const onMove = (e) => {
      const rect = cvs.getBoundingClientRect();
      const x = (e.clientX ?? (e.touches?.[0]?.clientX || 0)) - rect.left;
      const y = (e.clientY ?? (e.touches?.[0]?.clientY || 0)) - rect.top;
      const dx = x - state.cannon.x;
      const dy = y - state.cannon.y;
      state.cannon.angle = Math.max(-Math.PI + 0.2, Math.min(-0.2, Math.atan2(dy, dx)));
    };
    const onDown = (e) => {
      e.preventDefault();
      fireShot(state, !motionSafe);
    };
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === " " || k === "space") {
        e.preventDefault();
        fireShot(state, !motionSafe);
      }
      if (k === "r") setSeed((s) => s + 1);
      if (k === "m") setShowAim((v) => !v);
      if (k === "s") setMotionSafe((v) => !v);
    };

    cvs.addEventListener("mousemove", onMove, { passive: true });
    cvs.addEventListener("touchmove", onMove, { passive: true });
    cvs.addEventListener("mousedown", onDown);
    cvs.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      cvs.removeEventListener("mousemove", onMove);
      cvs.removeEventListener("touchmove", onMove);
      cvs.removeEventListener("mousedown", onDown);
      cvs.removeEventListener("touchstart", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [motionSafe]);

  /* level reset */
  useEffect(() => {
    resetLevel(g.current, items, seed, !motionSafe);
    setHits(0);
  }, [items, seed, motionSafe]);

  /* main loop */
  useEffect(() => {
    const loop = (now) => {
      const st = g.current;
      const dtRaw = st.last ? Math.min(0.05, (now - st.last) / 1000) : 0;
      st.last = now;

      // slow-mo on hit
      const slowFactor = st.slow.t > 0 ? 0.35 : 1;
      const dt = dtRaw * slowFactor;
      if (st.slow.t > 0) st.slow.t -= dtRaw;

      st.time += dt;

      update(st, dt, (hitIdx) => {
        setHits((h) => h + 1);
        setModalIdx(hitIdx);
      }, !motionSafe);

      render(st, canvasRef.current, showAim, !motionSafe);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [showAim, motionSafe]);

  const total = items.length;
  const active = modalIdx != null ? items[modalIdx] : null;

  return (
    <div className="mt-5 grid lg:grid-cols-[1fr,320px] gap-6">
      <div ref={wrapRef} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
          <MousePointer2 size={14} />
          Aim with mouse / touch, then click to shoot. Pop a bubble to open a project.
          <span className="ml-auto inline-flex items-center gap-1 text-[11px]">
            <Zap size={12} className="text-amber-300" /> {g.current.combo.n}x combo
          </span>
        </div>
        <div className="relative mx-auto rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <canvas ref={canvasRef} className="block" />
          {/* glass chips */}
          <div className="absolute left-3 top-3 text-xs">
            <span className="rounded-lg border border-zinc-700/80 bg-zinc-900/50 backdrop-blur px-2 py-1 text-zinc-200">
              Hits: <span className="text-amber-300">{hits}</span> / {total}
            </span>
          </div>
          <div className="absolute right-3 top-3 flex gap-2 text-xs">
            <button
              className="rounded-lg border border-zinc-700/80 bg-zinc-900/50 backdrop-blur px-2 py-1 text-zinc-200"
              onClick={() => setShowAim((v) => !v)}
            >
              {showAim ? "Hide aim" : "Show aim"}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-900/50 backdrop-blur px-2 py-1 text-zinc-200"
              onClick={() => setSeed((s) => s + 1)}
            >
              <RefreshCw size={14} /> Reset
            </button>
          </div>
          <div className="absolute right-3 bottom-3 text-xs">
            <button
              className={`rounded-lg border px-2 py-1 backdrop-blur ${
                motionSafe
                  ? "border-amber-300/60 text-amber-200 bg-amber-300/10"
                  : "border-zinc-700/80 text-zinc-200 bg-zinc-900/50"
              }`}
              onClick={() => setMotionSafe((v) => !v)}
              title="Toggle motion-safe rendering"
            >
              {motionSafe ? "Safety: on" : "Safety: off"}
            </button>
          </div>
        </div>
      </div>

      {/* discovered list */}
      <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="text-xs text-zinc-400 mb-2">Discovered projects</div>
        <ul className="space-y-2">
          {Array.from({ length: total }).map((_, i) => (
            <DiscoverRow
              key={i}
              i={i}
              opened={i < hits}
              item={items[i]}
              onOpen={() => setModalIdx(i)}
            />
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-zinc-500">
          Pop bubbles to reveal details. You can also open any revealed project from here.
        </p>
      </aside>

      {/* modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[1000] grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setModalIdx(null)}
            />
            <motion.div
              initial={{ y: 12, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="text-xs text-zinc-400 mb-1">Project</div>
              <h3 className="text-2xl font-extrabold">{active.name}</h3>
              {active.impact && (
                <div className="mt-2 text-xs text-emerald-300 flex items-center gap-2">
                  <Target size={14} /> {active.impact}
                </div>
              )}
              {active.desc && <p className="mt-4 text-zinc-300">{active.desc}</p>}
              {!!active.tags.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {active.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-zinc-700 px-2 py-0.5 text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                {active.link && (
                  <a
                    href={active.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-zinc-900 px-4 py-2 text-sm font-semibold"
                  >
                    Visit <ExternalLink size={16} />
                  </a>
                )}
                {active.github && (
                  <a
                    href={active.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm"
                  >
                    Code <ExternalLink size={16} />
                  </a>
                )}
              </div>
              <button
                onClick={() => setModalIdx(null)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-200"
                aria-label="Close"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----------------- Discovered rows ----------------- */

function DiscoverRow({ i, opened, item, onOpen }) {
  return (
    <li
      className={`rounded-xl border px-3 py-2 text-sm ${
        opened
          ? "border-amber-400/60 bg-amber-400/10"
          : "border-zinc-700 bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="mr-2 truncate">{item.name}</span>
        {opened ? (
          <button
            onClick={onOpen}
            className="text-xs rounded-lg border border-zinc-700 px-2 py-1"
          >
            View
          </button>
        ) : (
          <span className="text-[11px] text-zinc-400">— undiscovered</span>
        )}
      </div>
    </li>
  );
}

/* ===================== GAMEPLAY ===================== */

function fireShot(st, richFX) {
  const speed = 760;
  const r = 5.5;
  const vx = Math.cos(st.cannon.angle) * speed;
  const vy = Math.sin(st.cannon.angle) * speed;

  st.shots.push({
    x: st.cannon.x,
    y: st.cannon.y - 16,
    vx,
    vy,
    r,
    trail: richFX ? [] : null,
  });

  // muzzle flash + recoil
  st.effects.push({ type: "flash", x: st.cannon.x, y: st.cannon.y - 16, t: 0 });
  st.cannon.recoil = 1;
}

function update(st, dt, onHit, richFX) {
  // gentle orb drift + caustic rotation
  st.bubbles.forEach((b) => {
    b.x += b.vx * dt;
    if (b.x < b.r || b.x > st.w - b.r) b.vx *= -1;
    b.y += Math.sin(st.time * 1.2 + b.phase) * 0.09;
    b.caustic += dt * 0.6;
  });

  // shots
  for (let i = st.shots.length - 1; i >= 0; i--) {
    const s = st.shots[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    if (s.trail) {
      s.trail.push({ x: s.x, y: s.y, a: 1 });
      if (s.trail.length > 16) s.trail.shift();
      for (let k = 0; k < s.trail.length; k++) s.trail[k].a *= 0.96;
    }

    if (s.y < -20 || s.x < -20 || s.x > st.w + 20) {
      st.shots.splice(i, 1);
      continue;
    }

    // collision
    for (let j = 0; j < st.bubbles.length; j++) {
      const b = st.bubbles[j];
      const dx = b.x - s.x;
      const dy = b.y - s.y;
      const d2 = dx * dx + dy * dy;
      const rr = (b.r + s.r) * (b.r + s.r);
      if (d2 <= rr) {
        // combo logic
        const now = st.time;
        if (now - st.combo.last < 2.2) st.combo.n += 1;
        else st.combo.n = 1;
        st.combo.last = now;

        // FX
        st.effects.push({ type: "ring", x: b.x, y: b.y, t: 0, hue: b.hue });
        if (richFX) {
          st.effects.push({ type: "chromaburst", x: b.x, y: b.y, t: 0 });
          st.effects.push({
            type: "sparks",
            x: b.x,
            y: b.y,
            t: 0,
            hue: b.hue,
            ps: makeSparks(b.x, b.y, b.hue, st.combo.n),
          });
          st.effects.push({ type: "scan", t: 0 });
          st.shake.amp = Math.min(12, 6 + st.combo.n * 2);
          st.shake.t = 0.25;
          st.chroma.k = Math.min(1, 0.5 + st.combo.n * 0.15);
          st.chroma.t = 0.25;
          st.slow.t = 0.22;
        }

        st.bubbles.splice(j, 1);
        st.shots.splice(i, 1);
        onHit?.(b.projectIdx);
        break;
      }
    }
  }

  // recoil relax
  st.cannon.recoil = Math.max(0, st.cannon.recoil - dt * 6);

  // effect lifetimes
  for (let i = st.effects.length - 1; i >= 0; i--) {
    const e = st.effects[i];
    e.t += dt;
    if (e.type === "sparks") {
      e.ps.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 480 * dt * 0.35;
        p.a *= 0.96;
        p.r *= 0.985;
      });
      if (e.t > 0.7) st.effects.splice(i, 1);
    } else if (e.type === "ring") {
      if (e.t > 0.65) st.effects.splice(i, 1);
    } else if (e.type === "flash") {
      if (e.t > 0.22) st.effects.splice(i, 1);
    } else if (e.type === "chromaburst") {
      if (e.t > 0.35) st.effects.splice(i, 1);
    } else if (e.type === "scan") {
      if (e.t > 0.35) st.effects.splice(i, 1);
    }
  }

  // decay camera FX
  st.shake.t = Math.max(0, st.shake.t - dt);
  st.chroma.t = Math.max(0, st.chroma.t - dt);
}

function render(st, cvs, showAim, richFX) {
  if (!cvs) return;
  const ctx = cvs.getContext("2d");
  const { w, h, dpr, time } = st;

  // camera shake
  let sx = 0,
    sy = 0;
  if (st.shake.t > 0) {
    const p = st.shake.t / 0.25;
    const a = st.shake.amp * p * p;
    sx = (Math.random() - 0.5) * a;
    sy = (Math.random() - 0.5) * a;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.save();
  ctx.translate(sx, sy);

  /* --- background layers --- */
  drawBackground(ctx, w, h, time, st.starsFar, st.starsNear, st.lensDirt, richFX);

  /* --- orbs (refraction look) --- */
  for (const b of st.bubbles) drawOrb(ctx, b, time);

  /* --- trails --- */
  for (const s of st.shots) {
    if (!s.trail) continue;
    for (let i = 0; i < s.trail.length - 1; i++) {
      const a = s.trail[i];
      const b = s.trail[i + 1];
      ctx.strokeStyle = `rgba(255,255,255,${0.06 * a.a})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  /* --- plasma bullets --- */
  st.shots.forEach((s) => {
    const grd = ctx.createRadialGradient(s.x - 2, s.y - 2, 1, s.x, s.y, 7);
    grd.addColorStop(0, "#fff");
    grd.addColorStop(0.45, "#f59e0b");
    grd.addColorStop(1, "rgba(245,158,11,0.12)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r + 2, 0, Math.PI * 2);
    ctx.fill();
  });

  /* --- hit effects --- */
  for (const e of st.effects) {
    if (e.type === "ring") {
      const t = e.t / 0.65;
      const r = 14 + t * 46;
      const alpha = 1 - t;
      const rainbow = ctx.createRadialGradient(e.x, e.y, r * 0.4, e.x, e.y, r);
      rainbow.addColorStop(0, `hsla(${(e.hue + 30) % 360},100%,60%,${0.4 * alpha})`);
      rainbow.addColorStop(1, `hsla(${e.hue},100%,60%,${alpha * 0.9})`);
      ctx.strokeStyle = `hsla(${e.hue},100%,60%,${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = rainbow;
      ctx.beginPath();
      ctx.arc(e.x, e.y, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === "sparks") {
      for (const p of e.ps) {
        ctx.fillStyle = `hsla(${e.hue},100%,70%,${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (e.type === "flash") {
      const t = e.t / 0.22;
      const r = 10 + t * 34;
      ctx.fillStyle = `rgba(255,255,255,${0.18 * (1 - t)})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === "chromaburst") {
      // fake chromatic aberration: RGB soft offsets
      const t = e.t / 0.35;
      const k = (1 - t) * 10;
      drawChromaticBlob(ctx, e.x, e.y, k);
    } else if (e.type === "scan") {
      drawScanlines(ctx, w, h, e.t / 0.35);
    }
  }

  /* --- cannon --- */
  drawCannon(ctx, st.cannon, showAim);

  ctx.restore();

  // subtle RGB frame tint when chroma active
  if (st.chroma.t > 0 && richFX) {
    const p = st.chroma.t / 0.25;
    const k = st.chroma.k * p;
    drawFrameChroma(ctx, w, h, k);
  }
}

/* ===================== VISUAL HELPERS ===================== */

function drawBackground(ctx, w, h, time, starsFar, starsNear, dirt, richFX) {
  // base
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, w, h);

  // neon vortex (domain-warped radial)
  const t = richFX ? time : 0;
  const cx = w * 0.52;
  const cy = h * 0.38;
  for (let i = 0; i < 2; i++) {
    const r = i === 0 ? 0.20 : 0.12;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * (0.7 - r));
    const hue = i === 0 ? 275 : 45;
    grad.addColorStop(0, `hsla(${hue},100%,55%,${i ? 0.09 : 0.13})`);
    grad.addColorStop(1, "transparent");
    ctx.globalCompositeOperation = "screen";
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((i ? -1 : 1) * t * 0.08);
    ctx.translate(-cx, -cy);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  // hex shimmer
  drawHexGrid(ctx, w, h, 42, `rgba(148,163,184,${richFX ? 0.06 : 0.03})`, t);

  // parallax stars
  drawStars(ctx, starsFar, 0.05, t);
  drawStars(ctx, starsNear, 0.12, t);

  // lens dirt (very subtle)
  ctx.globalAlpha = 0.08;
  for (const d of dirt) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(d.x + Math.sin(t * 0.2 + d.p) * 2, d.y + Math.cos(t * 0.15 + d.p) * 2, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // vignette
  const vign = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, Math.max(w, h) * 0.75);
  vign.addColorStop(0, "rgba(0,0,0,0)");
  vign.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, w, h);
}

function drawHexGrid(ctx, w, h, size, stroke, t) {
  const s = size;
  const hStep = s * Math.sqrt(3);
  ctx.save();
  ctx.translate(Math.sin(t * 0.3) * 6, Math.cos(t * 0.25) * 6);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  for (let y = -hStep; y < h + hStep; y += hStep) {
    for (let x = -s; x < w + s; x += s * 1.5) {
      const off = ((y / hStep) | 0) % 2 ? 0 : s * 0.75;
      drawHexPath(ctx, x + off, y, s);
      ctx.stroke();
    }
  }
  ctx.restore();
}
function drawHexPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawStars(ctx, stars, speed, t) {
  for (const s of stars) {
    const x = s.x + Math.sin(t * speed + s.phase) * 6;
    const y = s.y + Math.cos(t * speed * 0.8 + s.phase) * 6;
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.fillRect(x, y, s.sz, s.sz);
  }
}

function drawOrb(ctx, b, time) {
  // shadow
  ctx.fillStyle = `rgba(0,0,0,.35)`;
  ctx.beginPath();
  ctx.ellipse(b.x + 2, b.y + b.r - 3, b.r * 0.7, b.r * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // glass body + rim
  const grad = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.45, 2, b.x, b.y, b.r);
  grad.addColorStop(0, "rgba(255,255,255,.95)");
  grad.addColorStop(0.22, `hsla(${b.hue},100%,65%,.8)`);
  grad.addColorStop(1, `hsla(${b.hue},100%,50%,.10)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `hsla(${b.hue},100%,80%,.6)`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r - 0.6, 0, Math.PI * 2);
  ctx.stroke();

  // rotating caustic band (refraction feel)
  const ca = b.caustic;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(ca);
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(0, 0, b.r * 0.85, b.r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // specular highlight
  ctx.fillStyle = "rgba(255,255,255,.65)";
  ctx.beginPath();
  ctx.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.22, b.r * 0.17, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // label
  ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.font = "bold 11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
  ctx.textAlign = "center";
  ctx.fillText(trimLabel(b.label), b.x, b.y + 3);
}

function drawCannon(ctx, cannon, showAim) {
  const { x, y, angle, recoil } = cannon;
  const back = recoil * 8;

  // base
  const baseG = ctx.createRadialGradient(x, y + 12, 2, x, y + 12, 48);
  baseG.addColorStop(0, "#1f1f24");
  baseG.addColorStop(1, "#0d0d12");
  ctx.fillStyle = baseG;
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();

  // barrel
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.translate(-back, 0);

  const br = ctx.createLinearGradient(0, -6, 46, -6);
  br.addColorStop(0, "#1f2937");
  br.addColorStop(1, "#0b1220");
  ctx.fillStyle = br;
  ctx.strokeStyle = "#3f3f46";
  ctx.lineWidth = 2;
  ctx.fillRect(0, -5, 46, 10);
  ctx.strokeRect(0, -5, 46, 10);

  ctx.fillStyle = "rgba(245,158,11,.9)";
  ctx.fillRect(32, -2, 10, 4);

  ctx.restore();

  if (showAim) {
    ctx.strokeStyle = "rgba(245,158,11,.35)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * 1000, y + Math.sin(angle) * 1000);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawChromaticBlob(ctx, x, y, k) {
  const ring = (dx, dy, color) => {
    const grd = ctx.createRadialGradient(x + dx, y + dy, 4, x + dx, y + dy, 44);
    grd.addColorStop(0, color);
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, 44, 0, Math.PI * 2);
    ctx.fill();
  };
  ring(-k, 0, "rgba(255,0,80,.28)");
  ring(k, 0, "rgba(0,180,255,.28)");
  ring(0, k, "rgba(255,200,0,.20)");
}

function drawScanlines(ctx, w, h, t) {
  const alpha = 0.12 * (1 - t);
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
}

function drawFrameChroma(ctx, w, h, k) {
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = `rgba(255,0,80,${0.05 * k})`;
  ctx.fillRect(-k, 0, w, h);
  ctx.fillStyle = `rgba(0,180,255,${0.05 * k})`;
  ctx.fillRect(k, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

function resetLevel(st, items, seed, richFX) {
  st.bubbles = [];
  st.shots = [];
  st.effects = [];
  st.last = 0;
  st.combo.n = 0;
  st.combo.last = 0;

  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);

  const cols = Math.ceil(Math.sqrt(items.length));
  const spacing = Math.min(120, Math.max(90, Math.floor(st.w / (cols + 1))));
  const startY = 100;

  for (let i = 0; i < items.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const bx = spacing + col * spacing + (rnd() - 0.5) * 18 + 40;
    const by = startY + row * spacing + (rnd() - 0.5) * 10;
    const r = 26;

    const hue = (i * 53) % 360;

    st.bubbles.push({
      x: Math.min(st.w - r - 10, Math.max(r + 10, bx)),
      y: Math.min(st.h * 0.64, by),
      r,
      vx: (rnd() - 0.5) * (richFX ? 22 : 10),
      phase: rnd() * Math.PI * 2,
      hue,
      projectIdx: i,
      label: items[i].name,
      caustic: rnd() * Math.PI * 2,
    });
  }
}

/* ----------------- tiny helpers ----------------- */

function makeStars(n, w, h, a) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: Math.random() * w,
      y: Math.random() * h,
      sz: Math.random() < 0.7 ? 1 : 2,
      a: a * (0.6 + Math.random() * 0.8),
      phase: Math.random() * Math.PI * 2,
    });
  }
  return out;
}

function makeDirt(n, w, h) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      p: Math.random() * Math.PI * 2,
    });
  }
  return out;
}

function makeSparks(x, y, hue, combo) {
  const ps = [];
  const count = 26 + Math.min(22, combo * 6);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    const sp = 140 + Math.random() * 220 + combo * 18;
    ps.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      r: 1.8 + Math.random() * 2.6,
      a: 0.9,
      hue,
    });
  }
  return ps;
}

function trimLabel(s) {
  if (!s) return "";
  return s.length <= 18 ? s : s.slice(0, 16) + "…";
}

function normalize(arr) {
  return arr.map((p, i) => ({
    id: i,
    name: p.name || p.title || `Project ${i + 1}`,
    desc: p.desc || p.summary || p.description || "",
    tags: p.tags || p.stack || p.badges || [],
    link: p.link || p.demo || p.href || "",
    github: p.github || p.repo || "",
    impact: p.impact || p.result || "",
  }));
}
