import type { CSSProperties } from "react";
import type { HeaderStyle } from "@/lib/settings";

/** Header appearance options, shared by the live header and the admin preview. */
export const HEADER_VARIANTS: Record<
  HeaderStyle,
  { label: string; bar: string; field: string; style: CSSProperties }
> = {
  light: { label: "Light", bar: "border-q-line bg-white text-q-ink", field: "bg-q-field", style: {} },
  grey: { label: "Grey", bar: "border-q-line bg-q-panel text-q-ink", field: "bg-white", style: {} },
  brand: {
    label: "Brand colour",
    bar: "border-transparent",
    field: "bg-white",
    style: { backgroundColor: "var(--q-primary)", color: "var(--q-primary-ink)" },
  },
};
