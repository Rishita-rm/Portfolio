import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Github,
  Linkedin,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
  Clock,
  MapPin,
} from "lucide-react";

/** ContactDeluxe — animated, fun, interview-friendly contact section
 * Usage: <ContactDeluxe socials={socials} />
 * socials: { email, phone, github, linkedin, name?, location? }
 */
export default function ContactDeluxe({ socials = {} }) {
  const {
    name = "Rishita Makkar",
    email = "rishitamakkar0777@gmail.com",
    phone = "+91-7828677657",
    github = "https://github.com/Rishita-rm",
    linkedin = "https://www.linkedin.com/in/rishita-makkar-256851291/",
    location = "India",
  } = socials;

  const now = useMemo(() => new Date(), []);
  const localTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section id="contact" className="relative py-20 md:py-28 overflow-hidden">
      <BackgroundOrbs />

      <div className="mx-auto max-w-6xl px-4 relative">
        {/* Title */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/70 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-300 backdrop-blur">
            <Sparkles size={14} className="text-violet-300" />
            Let’s work together
          </div>
          <h2 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">
            <span className="text-white">Get in touch,</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500">
              I reply fast.
            </span>
          </h2>

          <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              Local time: <span className="text-zinc-200">{localTime}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline-flex items-center gap-2">
              <MapPin size={16} className="text-emerald-400" />
              {location}
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">
              Typical response: <b>within 24h</b>
            </span>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr,1.1fr] gap-8">
          {/* LEFT: Coordinates */}
          <ContactList
            name={name}
            email={email}
            phone={phone}
            github={github}
            linkedin={linkedin}
          />

          {/* RIGHT: Form */}
          <ContactForm emailTo={email} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Left column ---------------- */
function ContactList({ name, email, phone, github, linkedin }) {
  const items = [
    {
      icon: Mail,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      hint: "Copy email",
      external: false,
    },
    {
      icon: Phone,
      label: "Phone",
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
      hint: "Copy number",
      external: false,
    },
    {
      icon: Github,
      label: "GitHub",
      value: github,
      href: github,
      hint: "Open GitHub",
      external: true,
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: linkedin,
      href: linkedin,
      hint: "Open LinkedIn",
      external: true,
    },
  ];

  return (
    <motion.div
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur"
    >
      <div className="text-sm text-zinc-400 mb-3">Coordinates</div>

      <div className="space-y-3">
        {items.map((it, idx) => (
          <Coordinate key={idx} {...it} />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 p-4">
        <div className="text-sm text-zinc-300">
          Open to data analyst roles, internships, and collabs. From ETL to
          dashboards to lightweight ML—happy to help.
        </div>
      </div>
    </motion.div>
  );
}

function Coordinate({ icon: Icon, label, value, href, hint, external }) {
  const [copied, setCopied] = useState(false);

  const copy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
      className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 hover:bg-zinc-900/60 transition"
    >
      <div className="grid place-items-center rounded-lg h-10 w-10 bg-zinc-900 border border-zinc-800">
        <Icon size={18} className="text-amber-300" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs text-zinc-400">{label}</div>
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel="noreferrer"
          className="flex items-center gap-1 text-sm text-zinc-200 truncate hover:underline"
        >
          {value}
          {external && <ExternalLink size={14} className="text-zinc-500" />}
        </a>
      </div>

      <button
        onClick={copy}
        title={hint}
        className="rounded-lg border border-zinc-700 h-9 w-9 grid place-items-center hover:bg-zinc-800 transition"
      >
        <AnimatePresence initial={false} mode="wait">
          {copied ? (
            <motion.span
              key="ok"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
            >
              <Check size={16} className="text-emerald-400" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Copy size={16} className="text-zinc-400" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

/* ---------------- Right column (form) ---------------- */
function ContactForm({ emailTo }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const valid =
    form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.message.trim();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!valid || sending) return;

    setSending(true);
    // no backend: construct a mailto
    const subject = encodeURIComponent(`Portfolio contact from ${form.name}`);
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name}\n${form.email}`
    );
    const url = `mailto:${emailTo}?subject=${subject}&body=${body}`;

    // small delay to show animation then open mail client
    setTimeout(() => {
      window.location.href = url;
      setSent(true);
      setSending(false);
      // keep the confetti visible briefly
      setTimeout(() => setSent(false), 1200);
    }, 500);
  };

  return (
    <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur overflow-hidden">
      <HeaderShimmer />

      <form onSubmit={onSubmit} className="space-y-4 relative z-10">
        <Input
          placeholder="Your name"
          value={form.name}
          onChange={(v) => setForm((s) => ({ ...s, name: v }))}
        />
        <Input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm((s) => ({ ...s, email: v }))}
          rightIcon={<Sparkles size={16} className="text-violet-300" />}
        />
        <TextArea
          placeholder="Message"
          value={form.message}
          onChange={(v) => setForm((s) => ({ ...s, message: v }))}
        />

        <div className="pt-1 flex items-center gap-3">
          <button
            type="submit"
            disabled={!valid || sending}
            className="relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                       border border-amber-400/60 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AnimatePresence initial={false} mode="wait">
              {sending ? (
                <motion.span
                  key="sending"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 4 }}
                  className="inline-flex items-center gap-2"
                >
                  <FlyIcon />
                  Sending…
                </motion.span>
              ) : (
                <motion.span
                  key="send"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 4 }}
                  className="inline-flex items-center gap-2"
                >
                  <Send size={16} />
                  Send
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </form>

      {/* Confetti + flying envelope */}
      <AnimatePresence>{sent && <ConfettiBurst />}</AnimatePresence>
    </div>
  );
}

/* ---------------- UI bits ---------------- */
function Input({ value, onChange, placeholder, type = "text", rightIcon }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-3 outline-none
                   text-sm text-zinc-200 placeholder-zinc-500 focus:border-zinc-600"
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70">
          {rightIcon}
        </div>
      )}
    </div>
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      rows={6}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-3 outline-none
                 text-sm text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 resize-y"
    />
  );
}

function FlyIcon() {
  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: [0, 4, 0], rotate: [0, -8, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <Send size={16} />
    </motion.div>
  );
}

/* Confetti + envelope flight */
function ConfettiBurst() {
  const pieces = Array.from({ length: 18 }, (_, i) => i);
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
    >
      {/* Envelope flight */}
      <motion.div
        className="absolute left-6 bottom-6 text-amber-300"
        initial={{ y: 0, x: 0, rotate: 0, scale: 1 }}
        animate={{ y: -140, x: 300, rotate: -20, scale: 0.9 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Send />
      </motion.div>

      {/* Confetti pieces */}
      {pieces.map((i) => {
        const left = 20 + (i % 9) * 30;
        const delay = i * 0.02;
        return (
          <motion.span
            key={i}
            className="absolute bottom-8 h-2 w-2 rounded-sm"
            style={{ left }}
            initial={{ y: 0, opacity: 1, background: confettiColor(i) }}
            animate={{
              y: -120 - (i % 5) * 12,
              x: (i % 2 ? 1 : -1) * (40 + (i % 5) * 6),
              rotate: 180,
            }}
            transition={{ delay, duration: 0.9, ease: "easeOut" }}
          />
        );
      })}
    </motion.div>
  );
}

function confettiColor(i) {
  const colors = ["#f59e0b", "#22d3ee", "#a78bfa", "#fb7185", "#34d399"];
  return colors[i % colors.length];
}

/* Holo header glint */
function HeaderShimmer() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-10 h-24 opacity-40">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl" />
    </div>
  );
}

/* Background soft orbs */
function BackgroundOrbs() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
      <motion.div
        className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl"
        animate={{ x: [0, 10, -6, 0], y: [0, -8, 6, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
