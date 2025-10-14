// src/components/InfoButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Info, X } from "lucide-react";

export default function InfoButton() {
  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const scrollYRef = useRef<number>(0);

  const devName = process.env.NEXT_PUBLIC_DEVELOPER_NAME || "Your Name";
  const pmxDesc =
    process.env.NEXT_PUBLIC_PMX_DESC ||
    "Product Manager Accelerator is a community and program designed to help PMs level up with practical training, mentorship, and career support.";
  const pmxUrl =
    process.env.NEXT_PUBLIC_PMX_LINKEDIN_URL ||
    "https://www.linkedin.com/company/product-manager-accelerator/";

  const openModal = () => setOpen(true);

  const closeModal = () => {
    setOpen(false);
    // Restore scroll position after we unfreeze the body
    const y = scrollYRef.current || 0;
    requestAnimationFrame(() => {
      // Re-enable body scrolling
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      document.body.style.removeProperty("overflow");
      window.scrollTo(0, y);
    });
  };

  // Manage focus and body scroll locking while modal is open
  useEffect(() => {
    if (!open) return;

    lastFocusRef.current = document.activeElement as HTMLElement;

    // Freeze background scroll without layout shift
    scrollYRef.current = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    // Focus close button
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);

    // Close on Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey, { passive: true });

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      // Restore focus to the opener
      lastFocusRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 glass hover:scale-[1.02] active:scale-[0.98] transition"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="pmx-info-modal"
      >
        <Info className="h-5 w-5" />
        <span className="hidden sm:inline">Info</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4" // super high z-index so it's above Leaflet panes
          aria-labelledby="pmx-info-title"
          role="dialog"
          aria-modal="true"
          id="pmx-info-modal"
        >
          {/* Backdrop — clicking it closes and returns user to page */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Opaque modal panel (no blur), also above everything */}
          <div
            className="relative z-[2147483647] w-full max-w-lg rounded-2xl bg-white text-slate-900 shadow-2xl ring-1 ring-black/10 dark:bg-slate-900 dark:text-slate-100 dark:ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-5 border-b border-black/10 dark:border-white/10">
              <h2 id="pmx-info-title" className="text-xl font-bold">
                About this app
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="leading-relaxed">
                Built by <strong>{devName}</strong>. This app shows live
                weather, a 5-day forecast, and lets you save historical queries
                with CRUD via a SQL database.
              </p>

              <div className="space-y-2">
                <h3 className="font-semibold">Product Manager Accelerator</h3>
                <p className="leading-relaxed">{pmxDesc}</p>
                <a
                  href={pmxUrl}
                  className="inline-flex items-center gap-2 underline hover:opacity-90"
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit PM Accelerator on LinkedIn
                </a>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
