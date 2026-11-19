"use client";

import { CloseIcon, ChevronRightIcon } from "@/components/icons";

const MENU_ITEMS = [
  { label: "Home", href: "#" },
  { label: "Help Center", href: "#" },
  { label: "Contact Support", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

export default function MenuPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      {/* backdrop — tapping it closes the menu */}
      <button
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/30"
        tabIndex={open ? 0 : -1}
      />

      {/* slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute right-0 top-0 h-full w-[78%] max-w-xs bg-white shadow-card transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <span className="text-sm font-semibold text-ink-900">Menu</span>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100"
          >
            <CloseIcon className="h-[18px] w-[18px]" />
          </button>
        </div>

        <nav className="px-2 py-2">
          <ul className="flex flex-col">
            {MENU_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-medium text-ink-700 hover:bg-ink-100"
                >
                  {item.label}
                  <ChevronRightIcon className="h-4 w-4 text-ink-300" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
