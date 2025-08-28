import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  Menu,
  X,
  Sparkles,
  Home,
  Zap,
  Briefcase,
  ChartColumnIncreasing,
  Award,
  Phone,
} from "lucide-react";

const NAV = [
  { id: "home", label: "Home", Icon: Home },
  { id: "skills", label: "Skills", Icon: Zap },
  { id: "projects", label: "Projects", Icon: Briefcase },
  { id: "experience", label: "Experience", Icon: ChartColumnIncreasing },
  { id: "certs", label: "Certs", Icon: Award },
  { id: "contact", label: "Contact", Icon: Phone },
];

export default function Header({ socials }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  // --- scroll progress bar (top thin bar)
  const { scrollYProgress } = useScroll();

  // --- section highlighting via IntersectionObserver
  useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);

    const obs = new IntersectionObserver(
      (entries) => {
        // pick the most visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.15, 0.35, 0.6] }
    );

    nodes.forEach((n) => obs.observe(n));
    return () => {
      nodes.forEach((n) => obs.unobserve(n));
      obs.disconnect();
    };
  }, []);

  // --- large screen nav
  const DesktopNav = () => (
    <nav className="hidden md:flex items-center gap-1 text-sm">
      {NAV.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            className={`group relative rounded-full px-4 py-2.5 transition ${
              isActive ? "text-white" : "text-zinc-300 hover:text-white"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {/* active pill */}
            {isActive && (
              <motion.span
                layoutId="active-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/25 to-amber-400/25"
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">
              <Icon
                size={16}
                className={isActive ? "text-amber-300" : "text-red-400"}
              />
              {label}
            </span>
          </a>
        );
      })}
    </nav>
  );

  // --- mobile drawer
  const MobileNav = () => (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="absolute right-0 top-0 h-full w-80 bg-zinc-900 border-l border-zinc-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo />
                <div>
                  <div className="font-semibold">
                    {socials?.name ?? "Your Name"}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {socials?.title ?? "Data Analyst"}
                  </div>
                </div>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-zinc-800"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-1">
              {NAV.map(({ id, label, Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                    active === id
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={18} className="text-amber-300" />
                  <span className="text-sm">{label}</span>
                </a>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <IconLink href={socials?.github} title="GitHub">
                <Github size={18} />
              </IconLink>
              <IconLink href={socials?.linkedin} title="LinkedIn">
                <Linkedin size={18} />
              </IconLink>
              <IconLink href={`mailto:${socials?.email}`} title="Email">
                <Mail size={18} />
              </IconLink>
            </div>

            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white text-zinc-900 px-4 py-2.5 text-sm font-semibold"
            >
              <Mail size={16} />
              Hire me
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* top scroll progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[1000] bg-gradient-to-r from-red-500 to-amber-400 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <header className="sticky top-3 z-[900]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            {/* left: brand */}
            <a href="#home" className="flex items-center gap-3">
              <Logo />
              <div className="hidden sm:block">
                <div className="font-semibold leading-none">
                  {socials?.name ?? "Your Name"}
                </div>
                <div className="text-xs text-zinc-400 leading-none mt-0.5">
                  {socials?.title ?? "Data Analyst • AI & BI"}
                </div>
              </div>
            </a>

            {/* center: nav */}
            <DesktopNav />

            {/* right: actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center">
                <IconLink href={socials?.github} title="GitHub">
                  <Github size={18} />
                </IconLink>
                <IconLink href={socials?.linkedin} title="LinkedIn">
                  <Linkedin size={18} />
                </IconLink>
              </div>

              <a
                href="#contact"
                className="hidden md:inline-flex items-center gap-2 rounded-xl bg-white text-zinc-900 px-3.5 py-2 text-sm font-semibold"
              >
                <Mail size={16} />
                Hire me
              </a>

              <button
                className="md:hidden p-2 rounded-lg hover:bg-zinc-800"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav />
    </>
  );
}

/* ----------------- bits ----------------- */

function Logo() {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-amber-400 text-white shadow-md">
      <Sparkles size={18} />
    </div>
  );
}

function IconLink({ href, title, children }) {
  const isExternal = href?.startsWith("http");
  if (!href)
    return (
      <span className="mx-1 inline-grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed">
        {children}
      </span>
    );
  return (
    <a
      href={href}
      title={title}
      aria-label={title}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="mx-1 inline-grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
    >
      {children}
    </a>
  );
}
