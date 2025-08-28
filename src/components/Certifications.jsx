import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function CertBook({ certs = [] }) {
  const pages = useMemo(() => certs.map(normalizeCert), [certs]);
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1); // page turn direction

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, i, pages.length]);

  const go = (d) => {
    setDir(d);
    setI((x) => (x + d + pages.length) % pages.length);
  };

  if (!open) {
    return <Cover onOpen={() => setOpen(true)} count={pages.length} />;
  }

  const page = pages[i];

  return (
    <section className="relative">
      <div className="mb-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-3">
          <BookOpen size={18} className="text-amber-400" />
          <span className="text-xl md:text-2xl font-extrabold">
            Certificates
          </span>
        </div>
        <div className="text-xs text-zinc-400">
          Page <span className="font-semibold">{i + 1}</span> / {pages.length}
        </div>
      </div>

      {/* Book container with perspective */}
      <div
        className="relative rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 overflow-hidden"
        style={{ perspective: "1400px" }}
      >
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Left page (meta / vendor / domain) */}
          <LeftLeaf meta={page} />

          {/* Right page (animated) */}
          <div className="relative min-h-[280px]">
            <AnimatePresence mode="wait" custom={dir}>
              <RightLeaf key={page.id} page={page} dir={dir} />
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-2">
            <NavBtn onClick={() => go(-1)} aria="Previous">
              <ChevronLeft />
            </NavBtn>
            <NavBtn onClick={() => go(+1)} aria="Next">
              <ChevronRight />
            </NavBtn>
          </div>

          <Dots total={pages.length} active={i} onPick={(n) => setI(n)} />
        </div>
      </div>

      {/* subtle holo shimmer for book */}
      <style>{`
        .foilText {
          background: linear-gradient(92deg,#ffd166 0%,#ff758c 35%,#a78bfa 60%,#66e3ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 0 10px rgba(255,209,102,.18));
        }
      `}</style>
    </section>
  );
}

/* ---------------- Cover ---------------- */

function Cover({ onOpen, count }) {
  return (
    <section className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-8">
        {/* gilded frame */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
            <Sparkles size={18} className="text-violet-300" />
            <span>Portfolio Artifact</span>
          </div>

          <h2 className="mt-3 text-4xl md:text-5xl font-black foilText">
            Certificates
          </h2>
          <p className="mt-2 text-zinc-400">
            A curated book of {count} credentials. Open and flip through — each
            page includes verify links and notes.
          </p>

          <button
            onClick={onOpen}
            className="mt-6 rounded-xl bg-white text-zinc-900 px-5 py-2 text-sm font-semibold shadow"
          >
            Open the book
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pages ---------------- */

function LeftLeaf({ meta }) {
  return (
    <div
      className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="text-xs text-zinc-400">{meta.when || "—"}</div>
      <div className="mt-1 text-xl font-extrabold leading-tight">
        {meta.vendor}
      </div>
      <div className="text-sm text-zinc-400">{meta.domain}</div>

      {!!meta.tags.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {meta.tags.slice(0, 6).map((t) => (
            <span
              key={t}
              className="text-[11px] rounded-full border border-zinc-700 px-2 py-[2px] text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="text-[11px] text-zinc-400 mb-1">About</div>
        <p className="text-sm text-zinc-300">
          Issued by <span className="font-semibold">{meta.vendor}</span>. This
          credential validates skills aligned to{" "}
          <span className="font-semibold">{meta.domain}</span>.
        </p>
      </div>
    </div>
  );
}

const leaf = {
  enter: (dir) => ({
    opacity: 0,
    x: dir > 0 ? 120 : -120,
    rotateY: dir > 0 ? 28 : -28,
  }),
  center: { opacity: 1, x: 0, rotateY: 0 },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -120 : 120,
    rotateY: dir > 0 ? -28 : 28,
  }),
};

function RightLeaf({ page, dir }) {
  // quick one-line description from vendor/domain/tags
  const summary = `Credential by ${page.vendor} in ${page.domain}.${
    page.tags?.length ? ` Skills: ${page.tags.slice(0, 4).join(", ")}.` : ""
  }`;

  return (
    <motion.div
      custom={dir}
      variants={leaf}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="h-full rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-inner"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-semibold border border-zinc-700">
          {shortVendor(page.vendor)}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-zinc-400">
            {page.vendor} • {page.domain}
          </div>
          <div className="font-semibold leading-snug text-lg">{page.title}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[11px] text-zinc-400">{page.when}</div>

          {page.verify ? (
            <a
              href={page.verify}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
              title="Verify"
            >
              <BadgeCheck size={14} />
              Verify
              <ExternalLink size={12} />
            </a>
          ) : (
            <div className="mt-1 text-[11px] text-zinc-500 italic">
              No public verification link
            </div>
          )}
        </div>
      </div>

      {/* NEW: short description */}
      <p className="mt-3 text-sm text-zinc-300">{summary}</p>

      {/* NEW: skills chips on right page */}
      {!!page.tags?.length && (
        <div className="mt-3 flex flex-wrap gap-2">
          {page.tags.slice(0, 6).map((t) => (
            <span
              key={t}
              className="text-[11px] rounded-full border border-zinc-700 px-2 py-[2px] text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Evidence block (now always filled via fallback) */}
      {!!page.evidence?.length && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-[11px] text-zinc-400 mb-1">Evidence</div>
          <ul className="space-y-2">
            {page.evidence.slice(0, 4).map((e, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 block h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-sm text-zinc-300">{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

/* ---------------- Dots + Nav ---------------- */

function NavBtn({ onClick, children, aria }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className="h-10 w-10 grid place-items-center rounded-full border border-zinc-700 bg-zinc-900/70 hover:bg-zinc-800/70"
    >
      {children}
    </button>
  );
}

function Dots({ total, active, onPick }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onPick(idx)}
          className={`h-2.5 w-2.5 rounded-full border transition ${
            idx === active
              ? "bg-amber-400 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,.5)]"
              : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
          }`}
          aria-label={`Go to page ${idx + 1}`}
        />
      ))}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function normalizeCert(c, i) {
  const title = c.title || c.name || `Certificate ${i + 1}`;
  const when = c.when || c.date || "";
  const verify = c.verify || c.url || c.link || "";
  const id = c.id || c.credentialId || title.replace(/\s+/g, "-").toLowerCase();

  const vendor = c.vendor || guessVendor(title);
  const domain = c.domain || guessDomain(title);
  const tags = c.tags || guessTags(title);

  // NEW: smart evidence fallback
  const fallbackEvidence = [
    `Validated knowledge in ${domain.toLowerCase()}.`,
    tags.length
      ? `Hands-on with ${tags.slice(0, 3).join(", ")}.`
      : `Completed proctored assessment.`,
    `Issued by ${vendor}.`,
  ];

  return {
    id,
    title,
    when,
    verify,
    vendor,
    domain,
    tags,
    evidence: c.evidence || c.proof || fallbackEvidence,
  };
}

function guessVendor(s = "") {
  const t = s.toLowerCase();
  if (t.includes("ibm")) return "IBM";
  if (t.includes("cisco")) return "Cisco";
  if (t.includes("azure") || t.includes("microsoft")) return "Microsoft";
  if (t.includes("aws") || t.includes("amazon")) return "Amazon Web Services";
  if (t.includes("google") || t.includes("gcp")) return "Google";
  return "Provider";
}
function shortVendor(v) {
  const parts = v.split(" ");
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
function guessDomain(s = "") {
  const t = s.toLowerCase();
  if (t.includes("security") || t.includes("cyber")) return "Security";
  if (t.includes("network") || t.includes("ccna")) return "Networking";
  if (
    t.includes("azure") ||
    t.includes("aws") ||
    t.includes("cloud") ||
    t.includes("gcp")
  )
    return "Cloud";
  return "Data";
}
function guessTags(s = "") {
  const t = s.toLowerCase();
  const out = [];
  if (t.includes("python")) out.push("Python");
  if (t.includes("data")) out.push("Data");
  if (t.includes("science") || t.includes("ml")) out.push("ML/AI");
  if (t.includes("azure")) out.push("Azure");
  if (t.includes("security")) out.push("Security");
  if (t.includes("network")) out.push("Networking");
  return out.length ? out : ["Upskilling"];
}
