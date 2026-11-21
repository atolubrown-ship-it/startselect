"use client";

import { useEffect, useState } from "react";
import BivoAuthCard from "@/components/BivoAuthCard";
import { SpinnerIcon } from "@/components/icons";
import { DEFAULT_BIVO_BRAND, loadBivoBrand, type BivoBrand } from "@/lib/bivoBrand";

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

  return (
    <div className="bivo flex min-h-dvh items-center justify-center px-4 py-10">
      {ready ? (
        <BivoAuthCard initialBrand={brand} />
      ) : (
        <SpinnerIcon className="h-6 w-6" style={{ color: "var(--bivo-primary)" }} />
      )}
    </div>
  );
}
