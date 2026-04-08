// src/app/qr-not-found/page.tsx
import Link from "next/link";

export default function QrNotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-6">
      <div className="w-20 h-20 rounded-3xl bg-[#e8f0fb] flex items-center justify-center">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#004b9c"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M20 14h.01M20 17h.01M20 20h.01M17 20h.01M14 20h.01" />
        </svg>
      </div>
      <div className="text-center max-w-sm">
        <h1 className="text-[22px] font-black text-gray-900 mb-2">
          QR Code Not Recognised
        </h1>
        <p className="text-[14px] text-gray-400">
          This QR code doesn't match any product in our store. It may have been
          removed or the code is damaged.
        </p>
      </div>
      <Link
        href="/shop"
        className="px-6 py-3 bg-[#004b9c] text-white text-[13px] font-bold rounded-xl hover:bg-[#003d82] transition-colors"
      >
        Browse Our Shop
      </Link>
    </div>
  );
}
