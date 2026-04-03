"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, ExternalLink,
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white font-poppins">

      {/* ══════════════════════════════════════
          SECTION 1 — CONTACT US
      ══════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-16 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">

          {/* ── Left: Info ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
              <span className="text-[#81bf42] text-[11px] font-bold tracking-[0.2em] uppercase">
                iSPORTS Cricket UAE
              </span>
            </div>

            {/* Big bold heading matching site style */}
            <h1 className="font-black uppercase leading-none tracking-tight mb-6">
              <span className="block text-5xl lg:text-7xl text-gray-900 italic">
                CONTACT
              </span>
              <span
                className="block text-5xl lg:text-7xl italic"
                style={{ color: "#004b9c", WebkitTextStroke: "2px #004b9c" }}
              >
                US
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-[15px] leading-relaxed mb-10 max-w-sm">
              iSPORTS Cricket is conveniently located in Karama, Dubai. You can contact us via e-mail, phone or simply walk in.
            </p>

            {/* Address */}
            <div className="flex items-start gap-3 mb-6">
              <MapPin size={18} className="text-[#81bf42] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
              <div>
                <p className="text-gray-900 font-bold text-[15px]">
                  13 B Street, Karama, Dubai, UAE
                </p>
                <p className="text-gray-400 text-[13px] mt-1 flex items-center gap-1.5">
                  <Clock size={12} strokeWidth={2} />
                  Monday – Saturday | 10:00 AM – 7:00 PM
                </p>
              </div>
            </div>

            {/* Phone */}
            <a
              href="tel:+971526514666"
              className="flex items-center gap-3 mb-4 group w-fit"
            >
              <Phone size={17} className="text-[#81bf42]" strokeWidth={2.5} />
              <span className="text-gray-900 font-bold text-[15px] group-hover:text-[#004b9c] transition-colors duration-150 flex items-center gap-2">
                +971 52 6514 666
                <span className="text-gray-300 text-[12px] group-hover:text-[#004b9c] transition-colors">→</span>
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:info@isportscricket.com"
              className="flex items-center gap-3 mb-10 group w-fit"
            >
              <Mail size={17} className="text-[#81bf42]" strokeWidth={2.5} />
              <span className="text-gray-900 font-bold text-[15px] group-hover:text-[#004b9c] transition-colors duration-150 flex items-center gap-2">
                info@isportscricket.com
                <span className="text-gray-300 text-[12px] group-hover:text-[#004b9c] transition-colors">→</span>
              </span>
            </a>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#004b9c] hover:text-[#004b9c] hover:bg-blue-50 transition-all duration-200"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#004b9c] hover:text-[#004b9c] hover:bg-blue-50 transition-all duration-200"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            </div>
          </motion.div>

          {/* ── Right: Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_4px_40px_rgba(0,75,156,0.08)]"
          >
            <p className="text-gray-500 text-[14px] mb-7 font-medium">
              Chat with us or fill out this form:
            </p>

            {submitted ? (
              <div className="flex flex-col items-start gap-4 py-10">
                <CheckCircle2 size={48} className="text-[#81bf42]" strokeWidth={1.5} />
                <h3 className="text-2xl font-black text-gray-800 uppercase italic">Message Sent!</h3>
                <p className="text-gray-500 text-[14px]">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", message: "" });
                    setAgreed(false);
                  }}
                  className="mt-2 text-[13px] font-bold text-[#004b9c] hover:underline"
                >
                  ← Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full border-b-2 border-gray-100 hover:border-gray-200 focus:border-[#004b9c] outline-none py-3 text-[14px] text-gray-800 placeholder-gray-300 bg-transparent transition-colors duration-200"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full border-b-2 border-gray-100 hover:border-gray-200 focus:border-[#004b9c] outline-none py-3 text-[14px] text-gray-800 placeholder-gray-300 bg-transparent transition-colors duration-200"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Describe your project</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full border-b-2 border-gray-100 hover:border-gray-200 focus:border-[#004b9c] outline-none py-3 text-[14px] text-gray-800 placeholder-gray-300 bg-transparent transition-colors duration-200 resize-none"
                  />
                </div>

                {/* Privacy checkbox */}
                <div className="flex items-start gap-3 mt-1">
                  <div
                    onClick={() => setAgreed(!agreed)}
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-150 ${
                      agreed ? "bg-[#004b9c] border-[#004b9c]" : "border-gray-300 hover:border-[#004b9c]"
                    }`}
                  >
                    {agreed && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-[12px] text-gray-400 leading-relaxed cursor-pointer" onClick={() => setAgreed(!agreed)}>
                    By submitting this form, you agree to our{" "}
                    <a href="/privacy" className="text-[#004b9c] hover:underline font-semibold">Privacy Policy</a>.
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!agreed}
                  className={`mt-2 flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-white text-[13px] font-black tracking-[0.12em] uppercase transition-all duration-200 ${
                    agreed
                      ? "bg-[#004b9c] hover:bg-[#003d82] shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_6px_28px_rgba(0,75,156,0.4)] active:scale-[0.97]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send size={14} strokeWidth={2.5} />
                  Submit
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — HOW TO FIND US
      ══════════════════════════════════════ */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-16 lg:py-24">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
              <span className="text-[#81bf42] text-[11px] font-bold tracking-[0.2em] uppercase">
                Karama, Dubai
              </span>
            </div>
            <h2 className="font-black uppercase leading-none tracking-tight">
              <span className="block text-4xl lg:text-6xl text-gray-900 italic">HOW TO</span>
              <span className="block text-4xl lg:text-6xl italic text-[#004b9c]">FIND US</span>
            </h2>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full h-[360px] lg:h-[440px] rounded-2xl overflow-hidden border border-gray-200 mb-5 shadow-[0_4px_30px_rgba(0,75,156,0.08)]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.5395633013!2d55.29424!3d25.24925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5cec6dc0e8f7%3A0x3ee8ba39f33c5f40!2sAl%20Karama%2C%20Dubai!5e0!3m2!1sen!2sae!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

          {/* Open in Google Maps */}
          <a
            href="https://maps.google.com/?q=Al+Karama+Dubai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[12px] font-black text-[#004b9c] border-2 border-[#004b9c]/20 px-5 py-2.5 rounded-xl hover:bg-[#004b9c] hover:text-white hover:border-[#004b9c] tracking-wider uppercase transition-all duration-200 mb-12"
          >
            <ExternalLink size={13} strokeWidth={2.5} />
            Open in Google Maps
          </a>

          {/* Store Photos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              { label: "Store Front", bg: "bg-[#004b9c]/8" },
              { label: "Interior", bg: "bg-[#81bf42]/8" },
              { label: "Equipment Wall", bg: "bg-[#004b9c]/5" },
            ].map((photo, i) => (
              <div
                key={i}
                className={`${photo.bg} rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-gray-100 hover:border-[#004b9c]/20 transition-all duration-200`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <MapPin size={20} className="text-[#004b9c]" strokeWidth={1.5} />
                  </div>
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{photo.label}</p>
                  <p className="text-[11px] text-gray-300 mt-0.5">Add store photo</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Visit site */}
          <motion.a
            href="#"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 mt-10 text-[15px] font-black text-gray-800 hover:text-[#004b9c] transition-colors duration-200 group uppercase tracking-wider"
          >
            <span className="text-[#81bf42] text-lg group-hover:translate-x-1 transition-transform duration-150">↗</span>
            Visit site
          </motion.a>

        </div>
      </section>

    </div>
  );
}