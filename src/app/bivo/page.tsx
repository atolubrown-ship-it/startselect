"use client";

import { useEffect, useState } from "react";
import BivoAuthCard from "@/components/BivoAuthCard";
import { SpinnerIcon } from "@/components/icons";
import { DEFAULT_BIVO_BRAND, loadBivoBrand, type BivoBrand } from "@/lib/bivoBrand";
import { readableOn } from "@/lib/settings";

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

  // Push the admin's Colours + Layout settings into CSS variables, same pattern as
  // the rest of the site (see SettingsProvider.tsx) — these names are only ever
  // referenced inside .bivo-scoped rules, so this never affects the rest of the site.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bivo-primary", brand.buttonColor);
    root.style.setProperty("--bivo-primary-ink", readableOn(brand.buttonColor));
    root.style.setProperty("--bivo-link", brand.linkColor);
    root.style.setProperty("--bivo-page-max-width", `${brand.pageMaxWidth}px`);
    root.style.setProperty("--bivo-page-px", `${brand.pagePaddingX}px`);
    root.style.setProperty("--bivo-page-py", `${brand.pagePaddingY}px`);
    root.style.setProperty("--bivo-column-gap", `${brand.columnGap}px`);
    root.style.setProperty("--bivo-heading-size", `${brand.headingSize}px`);
    root.style.setProperty("--bivo-input-height", `${brand.inputHeight}px`);
    root.style.setProperty("--bivo-input-border-width", `${brand.inputBorderWidth}px`);
  }, [
    brand.buttonColor,
    brand.linkColor,
    brand.pageMaxWidth,
    brand.pagePaddingX,
    brand.pagePaddingY,
    brand.columnGap,
    brand.headingSize,
    brand.inputHeight,
    brand.inputBorderWidth,
  ]);

  return (
    <div
      className="bivo flex min-h-dvh flex-col items-center justify-center"
      style={{ paddingLeft: "var(--bivo-page-px)", paddingRight: "var(--bivo-page-px)", paddingTop: "var(--bivo-page-py)", paddingBottom: "var(--bivo-page-py)" }}
    >
      {ready ? <BivoAuthCard brand={brand} /> : <SpinnerIcon className="h-6 w-6" style={{ color: "var(--bivo-primary)" }} />}
    </div>
  );
}
