// src/app/admin/products/[slug]/qr-analytics/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  QrCode,
  ScanLine,
  Clock,
  Download,
  RefreshCw,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Package,
  Copy,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface QrStats {
  qrCode: string | null;
  qrCodeId: string | null;
  qrScans: number;
  qrLastScanned: string | null;
}

interface ProductInfo {
  name: string;
  slug: string;
  price: number;
  images: string[];
}

export default function QrAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [qrData, setQrData] = useState<QrStats | null>(null);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [dlLoading, setDlLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [confirmRegen, setConfirmRegen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [qrRes, prodRes] = await Promise.all([
          fetch(`/api/products/${slug}/qr`),
          fetch(`/api/products/${slug}`),
        ]);
        const [qrJson, prodJson] = await Promise.all([
          qrRes.json(),
          prodRes.json(),
        ]);
        if (qrJson.success) setQrData(qrJson.data);
        if (prodJson.success) setProduct(prodJson.data);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

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

  const handleGenerate = async (resetScans = false) => {
    setGenLoading(true);
    setError("");
    setConfirmRegen(false);
    try {
      const res = await fetch(`/api/products/${slug}/qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetScans }),
      });
      const json = await res.json();
      if (json.success) {
        setQrData((prev) => ({
          qrCode: json.data.qrCode,
          qrCodeId: json.data.qrCodeId,
          qrScans: resetScans ? 0 : (prev?.qrScans ?? 0),
          qrLastScanned: prev?.qrLastScanned ?? null,
        }));
      } else {
        setError(json.error ?? "Generation failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setGenLoading(false);
    }
  };

  const handleDownload = async () => {
    setDlLoading(true);
    try {
      const res = await fetch(`/api/products/${slug}/qr?dl=1`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${slug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed");
    } finally {
      setDlLoading(false);
    }
  };

  const handleCopy = () => {
    if (!qrData?.qrCodeId) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/qr/${qrData.qrCodeId}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#004b9c]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <p className="text-[11px] font-semibold text-[#81bf42] tracking-[0.15em] uppercase mb-1">
            QR Code Management
          </p>
          <h2
            className="text-[22px] font-black text-gray-900 tracking-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {product?.name ?? slug}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${slug}`}>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 text-[12.5px] font-semibold text-gray-600 hover:bg-gray-50 transition-all">
              <ArrowLeft size={14} /> Edit Product
            </button>
          </Link>
          <Link href="/admin/products">
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 text-[12.5px] font-semibold text-gray-600 hover:bg-gray-50 transition-all">
              All Products
            </button>
          </Link>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 border border-red-100">
          <AlertCircle size={15} className="text-red-500" />
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: QR image + actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center gap-5"
        >
          {qrData?.qrCode ? (
            <>
              <div className="relative p-4 rounded-2xl border-2 border-[#004b9c]/20 bg-white shadow-md">
                <img
                  src={qrData.qrCode}
                  alt="Product QR Code"
                  className="w-[180px] h-[180px] rounded-xl"
                />
                <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-[#004b9c] text-white text-[9px] font-black tracking-[0.14em] uppercase shadow-lg">
                  iSPORTS Cricket
                </div>
              </div>

              {/* URL pill */}
              <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <code className="text-[11px] font-mono text-gray-500 flex-1 truncate">
                  {window?.location?.origin}/qr/{qrData.qrCodeId}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#004b9c] transition-all"
                >
                  {copied ? (
                    <CheckCircle2 size={12} className="text-green-500" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
                <a
                  href={`/qr/${qrData.qrCodeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#004b9c] transition-all"
                >
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Download */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={dlLoading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-[13px] font-bold disabled:opacity-60 transition-all"
                style={{
                  background: "linear-gradient(135deg, #004b9c, #0062cc)",
                }}
              >
                {dlLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {dlLoading ? "Preparing PNG…" : "Download Print-Ready PNG"}
              </button>

              {/* Regenerate */}
              {!confirmRegen ? (
                <button
                  type="button"
                  onClick={() => setConfirmRegen(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[12px] font-semibold hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-all"
                >
                  <RefreshCw size={13} /> Regenerate QR Code
                </button>
              ) : (
                <div className="w-full p-3.5 rounded-xl border border-amber-200 bg-amber-50 space-y-3">
                  <p className="text-[12px] text-amber-700 font-medium">
                    ⚠️ Printed stickers using the old code will stop working.
                    Only regenerate if the current code is damaged or
                    compromised.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerate(false)}
                      disabled={genLoading}
                      className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-bold disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {genLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <RefreshCw size={12} />
                      )}
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRegen(false)}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-[12px] font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                <QrCode size={32} className="text-gray-300" />
              </div>
              <p className="text-[13px] text-gray-500 text-center">
                No QR code generated yet
              </p>
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                disabled={genLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #004b9c, #0062cc)",
                }}
              >
                {genLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <QrCode size={14} />
                )}
                Generate QR Code
              </button>
            </div>
          )}
        </motion.div>

        {/* Right: Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 grid grid-cols-2 gap-4 content-start"
        >
          {/* Scan count */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#e8f0fb] flex items-center justify-center">
                <ScanLine size={16} style={{ color: "#004b9c" }} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  Total QR Scans
                </p>
                <p className="text-[28px] font-black text-[#004b9c] leading-none">
                  {(qrData?.qrScans ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
            {(qrData?.qrScans ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-semibold">
                <TrendingUp size={12} /> Customers are scanning this product!
              </div>
            )}
          </div>

          {/* Last scanned */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={13} className="text-gray-400" />
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                Last Scanned
              </p>
            </div>
            <p className="text-[13px] font-bold text-gray-800">
              {formatDate(qrData?.qrLastScanned ?? null)}
            </p>
          </div>

          {/* QR Code ID */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <QrCode size={13} className="text-gray-400" />
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                Code ID
              </p>
            </div>
            <code className="text-[13px] font-mono font-bold text-gray-800">
              {qrData?.qrCodeId ?? "—"}
            </code>
          </div>

          {/* Product info */}
          {product && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package
                      size={20}
                      className="text-gray-300 m-auto mt-2.5"
                    />
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-900">
                    {product.name}
                  </p>
                  <p className="text-[12px] text-gray-400">
                    /{product.slug} · AED {product.price.toLocaleString()}
                  </p>
                </div>
                <a
                  href={`/shop/products/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-500 hover:text-[#004b9c] hover:border-[#004b9c]/30 transition-all"
                >
                  <ExternalLink size={12} /> View on Store
                </a>
              </div>
            </div>
          )}

          {/* Printing guidance */}
          <div className="bg-[#e8f0fb] rounded-2xl border border-[#004b9c]/10 p-4 col-span-2">
            <p className="text-[11px] font-black text-[#004b9c] uppercase tracking-wider mb-2">
              📋 Printing Tips
            </p>
            <ul className="text-[11.5px] text-gray-600 space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <span className="text-[#004b9c] font-bold mt-0.5">·</span> Print
                at minimum 3×3cm — larger codes scan faster in bright light.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#004b9c] font-bold mt-0.5">·</span> Use
                high-contrast labels (dark QR on white background).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#004b9c] font-bold mt-0.5">·</span>{" "}
                Laminate labels to protect from dirt, moisture, and wear.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#004b9c] font-bold mt-0.5">·</span> The
                QR URL uses a short code so it stays scannable even if the
                product is renamed.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#004b9c] font-bold mt-0.5">·</span> Test
                with Android + iPhone before mass-printing.
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
