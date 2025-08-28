// src/components/DataBackdrop.jsx
import { useEffect, useMemo, useRef } from "react";

/** Global, fixed Marvel-themed animated backdrop (no wash-out) */
export default function DataBackdrop() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      {/* solid dark base prevents white haze */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />

      {/* red/gold mesh glows (normal blend over dark base) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(800px 360px at 10% -10%, rgba(255,72,72,.28), transparent 70%),
            radial-gradient(800px 360px at 90% -10%, rgba(255,214,102,.20), transparent 70%),
            radial-gradient(1000px 540px at 50% 110%, rgba(255,72,72,.10), transparent 70%)
          `,
        }}
      />

      {/* animated layers */}
      <DigitsRain
        palette={["rgba(255,80,80,0.72)", "rgba(255,214,102,0.72)"]}
      />
      <BarField
        topColor="rgba(255,214,102,0.90)"
        bottomColor="rgba(255,72,72,0.20)"
      />

      {/* gentle vignette for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
    </div>
  );
}

/* -------- digits rain -------- */
function DigitsRain({ palette }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    let raf, w, h, cols, fontSize, y;
    const glyphs = "0123456789%$#Σµπ∑";
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      fontSize = Math.max(12, Math.round(w / 70));
      ctx.font = `${fontSize}px ui-monospace, Menlo, monospace`;
      cols = Math.floor(w / (fontSize + 4));
      y = new Array(cols).fill(0).map(() => Math.random() * h);
    };
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const step = () => {
      // slight trail
      ctx.fillStyle = "rgba(5,6,12,0.42)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < cols; i++) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * (fontSize + 4);
        ctx.fillStyle = palette[i % palette.length];
        ctx.fillText(char, x, y[i]);
        y[i] += fontSize * (0.9 + Math.random() * 0.6);
        if (y[i] > h + 40) y[i] = -20 - Math.random() * 120;
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, palette]);

  return <canvas ref={ref} className="absolute inset-0 opacity-35" />;
}

/* -------- breathing bar skyline -------- */
function BarField({ topColor, bottomColor }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    let raf,
      w,
      h,
      t = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      const bars = Math.min(80, Math.floor(w / 16));
      const baseY = h * 0.72;

      for (let i = 0; i < bars; i++) {
        const x = (i / bars) * w;
        const noise =
          Math.sin((i * 0.35 + t) * 0.7) * 0.4 +
          Math.cos((i * 0.13 + t) * 1.2) * 0.3;
        const hgt = Math.max(8, h * 0.22 * (0.6 + (0.4 * (noise + 1)) / 2));
        const grd = ctx.createLinearGradient(x, baseY - hgt, x, baseY);
        grd.addColorStop(0, topColor);
        grd.addColorStop(1, bottomColor);
        ctx.fillStyle = grd;
        ctx.fillRect(x, baseY - hgt, w / bars - 3, hgt);
      }

      t += 0.02;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, topColor, bottomColor]);

  return <canvas ref={ref} className="absolute inset-0 opacity-30" />;
}

/* -------- reduced-motion hook -------- */
function useReducedMotion() {
  return useMemo(
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    []
  );
}
