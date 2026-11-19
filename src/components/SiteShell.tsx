"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Header from "@/components/Header";
import MenuPanel from "@/components/MenuPanel";
import Footer from "@/components/Footer";
import { IconDefs } from "@/components/icons";

/**
 * Shared website frame: header, hamburger menu, footer.
 * Both the alert page and the "This wasn't me" page render inside it, so
 * moving between them feels like navigating within one site.
 */
export default function SiteShell({ children, onHome }: { children: ReactNode; onHome: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Keep --header-h in sync so the menu panel starts exactly under the header.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Lock page scroll while the menu is open; Escape closes it.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white" style={{ overflowX: "clip" }}>
      <IconDefs />
      <Header ref={headerRef} menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />
      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} onHome={onHome} />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-4 pt-5 sm:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
