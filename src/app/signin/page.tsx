"use client";

import { useEffect, useState } from "react";
import BivoSignIn from "@/components/BivoSignIn";
import { SpinnerIcon } from "@/components/icons";
import { DEFAULT_BIVO_BRAND, loadBivoBrand, type BivoBrand } from "@/lib/bivoBrand";

/**
 * Bivo sign-in, reached from Quilo's "Sign in with Google" button
 * (src/app/page.tsx). Its branding and copy are controlled from /signin/admin.
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

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <SpinnerIcon className="h-6 w-6 text-[#1d4ed8]" />
      </div>
    );
  }
  return <BivoSignIn brand={brand} />;
}
