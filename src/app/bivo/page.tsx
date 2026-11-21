"use client";

import { useEffect, useState, type CSSProperties } from "react";
import BivoAuthCard from "@/components/BivoAuthCard";
import { SpinnerIcon } from "@/components/icons";
import { DEFAULT_BIVO_BRAND, buildBivoCssVars, loadBivoBrand, type BivoBrand } from "@/lib/bivoBrand";

export default function BivoSignInPage() {
  const [brand, setBrand] = useState<BivoBrand>(DEFAULT_BIVO_BRAND);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadBivoBrand().then((res) => {
      if (cancelled) return;
      if (res.ok) setBrand(res.brand);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ready) document.title = `${brand.appName} – Sign in`;
  }, [ready, brand.appName]);

  // All of the admin's Branding/Layout/Form settings are applied as a React inline
  // `style` scoped to this page's own wrapper (buildBivoCssVars, src/lib/bivoBrand.ts)
  // — never written to document.documentElement — so they can never leak into, or be
  // corrupted by, any other page (including the /bivo/admin dashboard itself).
  const cssVars = buildBivoCssVars(brand) as CSSProperties;
  const alignItems = brand.pageAlign === "left" ? "flex-start" : brand.pageAlign === "right" ? "flex-end" : "center";

  return (
    <div
      className="bivo flex min-h-dvh flex-col justify-center"
      style={{
        ...cssVars,
        alignItems,
        paddingLeft: "var(--bivo-page-px)",
        paddingRight: "var(--bivo-page-px)",
        paddingTop: "var(--bivo-page-py)",
        paddingBottom: "var(--bivo-page-py)",
      }}
    >
      {ready ? <BivoAuthCard brand={brand} /> : <SpinnerIcon className="h-6 w-6" style={{ color: "var(--bivo-primary)" }} />}
    </div>
  );
}
