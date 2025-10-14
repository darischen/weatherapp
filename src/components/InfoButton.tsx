"use client";
import { useState } from "react";
import { Info } from "lucide-react";

export default function InfoButton() {
  const [open, setOpen] = useState(false);
  const pmxDesc = process.env.NEXT_PUBLIC_PMX_DESC || "PM Accelerator: learn product by building. Mentorship + portfolio sprints + community.";
  const pmxUrl = process.env.NEXT_PUBLIC_PMX_LINKEDIN_URL || "https://www.linkedin.com/company/product-manager-accelerator/";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass px-3 py-2 rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition"
        title="About PM Accelerator"
      >
        <Info className="w-4 h-4" />
        Info
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="glass max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-semibold">Product Manager Accelerator</h2>
              <button onClick={()=>setOpen(false)} className="px-2 py-1 rounded hover:bg-white/10">✕</button>
            </div>
            <p className="leading-relaxed">{pmxDesc}</p>
            <a
              href={pmxUrl}
              target="_blank"
              className="inline-block mt-4 underline hover:opacity-80"
              rel="noreferrer"
            >
              Visit PM Accelerator on LinkedIn
            </a>
          </div>
        </div>
      )}
    </>
  );
}
