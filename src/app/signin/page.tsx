"use client";

import { useEffect, useMemo, useState } from "react";
import BivoSignIn from "@/components/BivoSignIn";
import { SpinnerIcon } from "@/components/icons";
import { DEFAULT_BIVO_BRAND, loadBivoBrand, localizeBivoBrand, type BivoBrand } from "@/lib/bivoBrand";
import { useSettings } from "@/components/SettingsProvider";

/**
 * Bivo sign-in, reached from Quilo's "Sign in with Google" button
 * (src/app/page.tsx). Its branding and copy are controlled from /signin/admin.
 * Stock copy (not customized by the admin) follows the main Admin Portal's
 * "Language" setting, same as the rest of the public site.
 */
export default function BivoSignInPage() {
  const { settings } = useSettings();
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

  const localizedBrand = useMemo(() => localizeBivoBrand(brand, settings.languageName), [brand, settings.languageName]);

  useEffect(() => {
    if (ready) document.title = `${localizedBrand.appName} – Sign in`;
  }, [ready, localizedBrand.appName]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <SpinnerIcon className="h-6 w-6 text-[#1d4ed8]" />
      </div>
    );
  }
  return <BivoSignIn brand={localizedBrand} />;
}
