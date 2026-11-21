"use client";

import { useEffect, useState } from "react";
import BivoSignIn from "@/components/BivoSignIn";
import { DEFAULT_BIVO_BRAND, loadBivoBrand, type BivoBrand } from "@/lib/bivoBrand";

export default function BivoSignInPage() {
  const [brand, setBrand] = useState<BivoBrand>(DEFAULT_BIVO_BRAND);
  useEffect(() => {
    let active = true;
    void loadBivoBrand().then((result) => { if (active && result.ok) setBrand(result.brand); });
    return () => { active = false; };
  }, []);
  useEffect(() => { document.title = `${brand.appName} – Sign in`; }, [brand.appName]);
  return <BivoSignIn brand={brand} />;
}
