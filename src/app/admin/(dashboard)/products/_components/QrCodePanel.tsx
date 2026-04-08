// src/app/admin/products/_components/QrCodePanel.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Download,
  RefreshCw,
  ScanLine,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

interface QrData {
  qrCode: string | null; // base64 data URL
  qrCodeId: string | null;
  qrScans: number;
  qrLastScanned: string | null;
}

interface QrCodePanelProps {
  /** Product slug — null when the product hasn't been saved yet */
  productSlug: string | null;
  /** Called right after a new QR is generated so the parent can store qrCode */
  onGenerated?: (qrCode: string) => void;
}

export default function QrCodePanel({
  productSlug,
  onGenerated,
}: QrCodePanelProps) {
  const [data, setData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [confirmRegen, setConfirmRegen] = useState(false);

  // ── Fetch QR data ──────────────────────────────────────────────────────────
  const fetchQrData = useCallback(async () => {
    if (!productSlug) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${productSlug}/qr`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error ?? "Failed to load QR data");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    fetchQrData();
  }, [fetchQrData]);

  // ── Generate / Regenerate ──────────────────────────────────────────────────
  const handleGenerate = async (resetScans = false) => {
    if (!productSlug) return;
    setGenerating(true);
    setError("");
    setConfirmRegen(false);
    try {
      const res = await fetch(`/api/products/${productSlug}/qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetScans }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => ({
          qrCode: json.data.qrCode,
          qrCodeId: json.data.qrCodeId,
          qrScans: resetScans ? 0 : (prev?.qrScans ?? 0),
          qrLastScanned: prev?.qrLastScanned ?? null,
        }));
        onGenerated?.(json.data.qrCode);
      } else {
        setError(json.error ?? "Generation failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setGenerating(false);
    }
  };

  // ── Download print-ready PNG ───────────────────────────────────────────────
  const handleDownload = async () => {
    if (!productSlug) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/qr?dl=1`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${productSlug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Copy QR URL ────────────────────────────────────────────────────────────
  const handleCopyUrl = () => {
    if (!data?.qrCodeId) return;
    const base = window.location.origin;
    navigator.clipboard.writeText(`${base}/qr/${data.qrCodeId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (iso: string | null) => {
    if (!iso) return "Never";
    return new Date(iso).toLocaleString("en-AE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Not-saved state ────────────────────────────────────────────────────────
  if (!productSlug) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
          <div className="w-7 h-7 rounded-lg bg-[#e8f0fb] flex items-center justify-center">
            <QrCode size={14} style={{ color: "#004b9c" }} />
          </div>
          <h3 className="text-[13px] font-bold text-gray-800">
            Product QR Code
          </h3>
        </div>
        <div className="p-5">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <QrCode size={24} className="text-gray-300" />
            </div>
            <p className="text-[12px] text-gray-400 max-w-[180px]">
              Save the product first — a unique QR code will be generated
              automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-[#e8f0fb] flex items-center justify-center">
          <QrCode size={14} style={{ color: "#004b9c" }} />
        </div>
        <h3 className="text-[13px] font-bold text-gray-800">Product QR Code</h3>
        {data?.qrCode && (
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            ACTIVE
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
            <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
            <p className="text-[12px] text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={22} className="animate-spin text-[#004b9c]" />
          </div>
        ) : data?.qrCode ? (
          <>
            {/* QR Image */}
            <div className="flex items-center justify-center">
              <div className="relative p-3 rounded-2xl border-2 border-[#004b9c]/15 bg-white shadow-sm">
                <img
                  src={data.qrCode}
                  alt="Product QR Code"
                  className="w-[160px] h-[160px] rounded-lg"
                />
                {/* iSPORTS watermark at bottom */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-0.5 rounded-full bg-[#004b9c] text-white text-[8px] font-black tracking-[0.12em] uppercase shadow">
                  iSPORTS Cricket
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2.5 mt-2">
              <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-[#e8f0fb]/60 border border-[#004b9c]/10">
                <div className="flex items-center gap-1.5">
                  <ScanLine size={12} style={{ color: "#004b9c" }} />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Total Scans
                  </span>
                </div>
                <span className="text-[22px] font-black text-[#004b9c] leading-none">
                  {data.qrScans.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Last Scan
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-gray-700 leading-tight mt-0.5">
                  {formatDate(data.qrLastScanned)}
                </span>
              </div>
            </div>

            {/* QR ID pill */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <code className="text-[11px] font-mono text-gray-500 flex-1 truncate">
                /qr/{data.qrCodeId}
              </code>
              <button
                type="button"
                onClick={handleCopyUrl}
                title="Copy QR URL"
                className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#004b9c] hover:bg-[#e8f0fb] transition-all flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle2 size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
              <a
                href={`/qr/${data.qrCodeId}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Test QR redirect"
                className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#004b9c] hover:bg-[#e8f0fb] transition-all flex-shrink-0"
              >
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-[12px] font-bold transition-all disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #004b9c, #0062cc)",
                }}
              >
                {downloading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                {downloading ? "Preparing…" : "Download Print-Ready PNG"}
              </button>

              {/* Regenerate */}
              <AnimatePresence mode="wait">
                {!confirmRegen ? (
                  <motion.button
                    key="regen-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    type="button"
                    onClick={() => setConfirmRegen(true)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[12px] font-semibold hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-all"
                  >
                    <RefreshCw size={12} /> Regenerate QR Code
                  </motion.button>
                ) : (
                  <motion.div
                    key="regen-confirm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50 space-y-2.5"
                  >
                    <p className="text-[11px] font-semibold text-amber-700">
                      ⚠️ Old printed stickers will stop working. Only regenerate
                      if the current code is damaged.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerate(false)}
                        disabled={generating}
                        className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                      >
                        {generating ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <RefreshCw size={11} />
                        )}
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRegen(false)}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-[11px] font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Print hint */}
            <p className="text-[10.5px] text-gray-400 text-center leading-relaxed">
              Print at 3×3cm or larger for reliable scanning. Laminating the
              sticker extends label life.
            </p>
          </>
        ) : (
          /* No QR yet */
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <QrCode size={28} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-bold text-gray-700">
                No QR code yet
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Generate a unique QR for this product
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-bold disabled:opacity-60 transition-all"
              style={{
                background: "linear-gradient(135deg, #004b9c, #0062cc)",
              }}
            >
              {generating ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <QrCode size={13} />
              )}
              {generating ? "Generating…" : "Generate QR Code"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
