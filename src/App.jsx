import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Projects from "./components/Projects.jsx";
import Contact from "./components/Contact.jsx";
import IntroSequence from "./components/IntroSequence.jsx";
import SkillsShowcase from "./components/SkillsShowcase.jsx";
import Experience from "./components/Experience.jsx";
import Certifications from "./components/Certifications.jsx";

import skills from "./data/skills.js";
import projects from "./data/projects.js";
import experience from "./data/experience.js";
import certifications from "./data/certifications.js";

export default function App() {
  // allow skipping with ?skip=intro or ?skip=1
  const skipQuery = useMemo(() => {
    if (typeof window === "undefined") return false;
    const url = new URL(window.location.href);
    const v = url.searchParams.get("skip");
    return v === "intro" || v === "1";
  }, []);

  // ✅ show intro on every refresh (no localStorage gating)
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return true;
    return !skipQuery;
  });

  // smooth in-page scrolling for #anchors
  useEffect(() => {
    const handler = (e) => {
      const a = e.target.closest("a[href^='#']");
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const socials = {
    name: "Rishita Makkar",
    title: "Data Analyst • AI & BI",
    email: "rishitamakkar0777@gmail.com",
    phone: "+91-7828677657",
    github: "https://github.com/Rishita-rm",
    linkedin: "https://www.linkedin.com/in/rishita-makkar-256851291/",
  };

  // close intro if route changes away from home
  useEffect(() => {
    if (location.pathname !== "/") setShowIntro(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      {showIntro && <IntroSequence onDone={() => setShowIntro(false)} />}

      <Header socials={socials} />

      <main className="mx-auto max-w-6xl px-4">
        <section id="home">
          <Hero />
        </section>
        <section id="skills" className="pt-24">
          <SkillsShowcase title="Core Skills" />
        </section>
        <section id="projects" className="pt-24">
          <Projects projects={projects} />
        </section>
        <section id="experience" className="pt-24">
          <Experience items={experience} />
        </section>
        <section id="certs" className="pt-24">
          <Certifications certs={certifications} />
        </section>
        <section id="contact" className="pt-24 mb-24">
          <Contact socials={socials} />
        </section>
        <footer className="py-14 text-center">
          <div className="mx-auto max-w-4xl px-4">
            {/* thin divider glow */}
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-6"></div>

            {/* tagline */}
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 font-semibold">
                Turning raw data into decision-ready insight
              </span>
              <span className="text-zinc-500">
                {" "}
                — SQL • Python • BI • a pinch of ML
              </span>
            </p>

            {/* copyright */}
            <p className="mt-3 text-[13px] md:text-sm text-zinc-500">
              © {new Date().getFullYear()} {socials.name}. Crafted with focus,
              curiosity, and a love for clean KPIs.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
