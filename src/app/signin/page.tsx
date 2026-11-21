"use client";

import { useEffect, useState, type CSSProperties } from "react";
import BivoAuthCard, { HeaderBar, PageFooter } from "@/components/BivoAuthCard";
import { SpinnerIcon } from "@/components/icons";
import { DEFAULT_BIVO_BRAND, buildBivoCssVars, loadBivoBrand, type BivoBrand } from "@/lib/bivoBrand";

/**
 * Bivo sign-in, reached from Quilo's "Sign in with Google" button
 * (src/app/page.tsx, the "Or use an existing login" section on the
 * "This wasn't me" screen).
 *
 * Fully admin-configurable at /signin/admin — see BivoBrandEditor.tsx. Styling
 * is applied as a React inline `style` scoped to this page's own wrapper
 * (buildBivoCssVars, src/lib/bivoBrand.ts), never to document.documentElement.
 *
 * Layout restores the original look: a full-width header bar pinned to the
 * top (HeaderBar — logo + "Sign in with {appName}", no back control), the
 * card centered in the remaining space, and a footer below it (PageFooter).
 */
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

  const cssVars = buildBivoCssVars(brand) as CSSProperties;
  const alignItems = brand.pageAlign === "left" ? "flex-start" : brand.pageAlign === "right" ? "flex-end" : "center";

  return (
    <div className="bivo flex min-h-dvh flex-col" style={cssVars}>
      {ready && brand.showHeaderBar && <HeaderBar brand={brand} />}
      <div
        className="flex flex-1 flex-col"
        style={{
          alignItems,
          justifyContent: "center",
          paddingLeft: "var(--bivo-page-px)",
          paddingRight: "var(--bivo-page-px)",
          paddingTop: "var(--bivo-page-py)",
          paddingBottom: "var(--bivo-page-py)",
        }}
      >
        {ready ? <BivoAuthCard brand={brand} /> : <SpinnerIcon className="h-6 w-6" style={{ color: "var(--bivo-primary)" }} />}
        {ready && brand.showPageFooter && <PageFooter brand={brand} />}
      </div>
    </div>
  );
}
