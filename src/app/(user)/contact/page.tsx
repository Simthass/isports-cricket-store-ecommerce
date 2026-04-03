"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle2,
  ExternalLink, ChevronDown,
} from "lucide-react";

const FAQS = [
  {
    q: "Do you deliver across all UAE Emirates?",
    a: "Yes! We deliver to Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain. Orders over AED 500 get free delivery. Same-day delivery is available in Dubai and Sharjah.",
  },
  {
    q: "Are all your products 100% authentic?",
    a: "Absolutely. iSPORTS Cricket is an authorized retailer for all brands we carry including MRF, SS Ton, Shrey, Kookaburra, Adidas, and more. Every product comes with the manufacturer's warranty.",
  },
  {
    q: "Can I return or exchange a product?",
    a: "Yes, we offer a 14-day hassle-free return and exchange policy. Products must be unused and in original packaging. Simply WhatsApp us and we'll arrange the return pickup at no extra cost.",
  },
  {
    q: "Do you offer bat knocking and preparation services?",
    a: "Yes! We offer professional bat knocking, oiling, and gripping services in-store at our Karama, Dubai location. Walk in or call us to book an appointment.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 2–4 business days across UAE. Express next-day delivery is available for AED 50. Dubai and Sharjah orders placed before 2PM often arrive same day.",
  },
  {
    q: "Can I visit your store to try equipment before buying?",
    a: "Absolutely! Our store is open Monday to Saturday, 10:00 AM – 7:00 PM at 13 B Street, Karama, Dubai. Our expert staff will help you pick the perfect gear.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
          HERO BANNER
      ══════════════════════════════════════ */}
      <section className="relative bg-[#004b9c] overflow-hidden min-h-[280px] lg:min-h-[340px] flex items-end">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#004b9c]" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, #81bf42 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, #003d82 0%, transparent 50%),
                                radial-gradient(circle at 60% 60%, #002f6c 0%, transparent 40%)`,
            }}
          />
          {/* Cricket texture lines */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                #ffffff,
                #ffffff 1px,
                transparent 1px,
                transparent 60px
              )`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16 pb-12 pt-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-[3px] bg-[#81bf42] rounded-full" />
              <span className="text-[#81bf42] text-[11px] font-black tracking-[0.25em] uppercase">
                iSPORTS Cricket UAE
              </span>
            </div>
            <h1 className="font-black uppercase leading-none tracking-tight">
              <span className="block text-5xl lg:text-7xl text-white italic">WE ARE ALWAYS HERE FOR YOU</span>
            </h1>
            <p className="text-blue-200 text-[15px] mt-4 max-w-lg leading-relaxed">
              Got a question about cricket gear? Need expert advice? Our team of passionate cricketers is ready to help.
            </p>
          </motion.div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
      </section>

      {/* ══════════════════════════════════════
          SECTION 1 — INFO + FORM
      ══════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-16 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* ── Left: Info ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
              <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">Get In Touch</span>
            </div>
            <h2 className="font-black uppercase leading-none tracking-tight mb-4">
              <span className="block text-4xl lg:text-5xl text-gray-900 italic">CONTACT US</span>
            </h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-10 max-w-sm">
              iSPORTS Cricket is conveniently located in Karama, Dubai. You can contact us via e-mail, phone or simply walk in.
            </p>

            {/* Info Cards */}
            <div className="flex flex-col gap-4 mb-10">
              {/* Address */}
              <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-[#004b9c]/20 hover:shadow-sm transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#004b9c]/8 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-[#004b9c]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#81bf42] tracking-[0.15em] uppercase mb-0.5">Our Location</p>
                  <p className="text-gray-800 font-bold text-[14px]">13 B Street, Karama, Dubai, UAE</p>
                  <p className="text-gray-400 text-[12px] mt-0.5 flex items-center gap-1.5">
                    <Clock size={11} strokeWidth={2} />
                    Mon – Sat | 10:00 AM – 7:00 PM
                  </p>
                </div>
              </div>

              {/* Phone */}
              <a
                href="tel:+971526514666"
                className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-[#004b9c]/20 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#004b9c]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#004b9c] transition-colors duration-200">
                  <Phone size={18} className="text-[#004b9c] group-hover:text-white transition-colors duration-200" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#81bf42] tracking-[0.15em] uppercase mb-0.5">Call Centre</p>
                  <p className="text-gray-800 font-bold text-[14px] group-hover:text-[#004b9c] transition-colors">+971 52 6514 666</p>
                  <p className="text-gray-400 text-[12px] mt-0.5">+971 4 353 3323</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:info@isportscricket.com"
                className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-[#004b9c]/20 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#004b9c]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#004b9c] transition-colors duration-200">
                  <Mail size={18} className="text-[#004b9c] group-hover:text-white transition-colors duration-200" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#81bf42] tracking-[0.15em] uppercase mb-0.5">Email</p>
                  <p className="text-gray-800 font-bold text-[14px] group-hover:text-[#004b9c] transition-colors">info@isportscricket.com</p>
                  <p className="text-gray-400 text-[12px] mt-0.5">We reply within 24 hours</p>
                </div>
              </a>
            </div>

            {/* Social Network */}
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-3">Social Network</p>
              <div className="flex items-center gap-3">
                {[
                  {
                    label: "Facebook",
                    svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
                    fill: true,
                  },
                  {
                    label: "Instagram",
                    svg: (
                      <>
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <circle cx="12" cy="12" r="4"/>
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                      </>
                    ),
                    fill: false,
                  },
                  {
                    label: "WhatsApp",
                    svg: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>,
                    fill: true,
                    href: "https://wa.me/971526514666",
                    green: true,
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href || "#"}
                    target={social.href ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      social.green
                        ? "border-green-200 text-green-500 hover:bg-green-500 hover:text-white hover:border-green-500"
                        : "border-gray-200 text-gray-500 hover:border-[#004b9c] hover:text-[#004b9c] hover:bg-blue-50"
                    }`}
                  >
                    <svg
                      width="17" height="17" viewBox="0 0 24 24"
                      fill={social.fill ? "currentColor" : "none"}
                      stroke={social.fill ? "none" : "currentColor"}
                      strokeWidth="1.8"
                    >
                      {social.svg}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Right: Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_8px_48px_rgba(0,75,156,0.1)]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-[3px] bg-[#81bf42] rounded-full" />
              <span className="text-[#81bf42] text-[10px] font-black tracking-[0.2em] uppercase">Quick Response Guaranteed</span>
            </div>
            <h3 className="text-[20px] font-black text-gray-800 italic uppercase mb-1">Send Us a Message</h3>
            <p className="text-gray-400 text-[13px] mb-7">Define your goals and let us know how we can help.</p>

            {submitted ? (
              <div className="flex flex-col items-start gap-4 py-10">
                <div className="w-14 h-14 rounded-full bg-[#81bf42]/10 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-[#81bf42]" strokeWidth={1.8} />
                </div>
                <h3 className="text-2xl font-black text-gray-800 uppercase italic">Message Sent!</h3>
                <p className="text-gray-500 text-[14px] leading-relaxed">
                  Thanks for reaching out! Our team will get back to you within 24 hours. For urgent queries, WhatsApp us directly.
                </p>
                <a
                  href="https://wa.me/971526514666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-[12px] font-black tracking-wider uppercase transition-all"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp Instead
                </a>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", message: "" }); setAgreed(false); }}
                  className="text-[13px] font-bold text-[#004b9c] hover:underline"
                >
                  ← Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">First Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Ahmed"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-gray-50/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+971 XX XXX XXXX"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-gray-50/50"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-gray-50/50"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all bg-gray-50/50 resize-none"
                  />
                </div>

                {/* Privacy */}
                <div className="flex items-start gap-3">
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
                  <span
                    className="text-[12px] text-gray-400 leading-relaxed cursor-pointer"
                    onClick={() => setAgreed(!agreed)}
                  >
                    By submitting this form, you agree to our{" "}
                    <a href="/privacy" className="text-[#004b9c] hover:underline font-semibold">Privacy Policy</a>.
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!agreed}
                  className={`mt-1 flex items-center justify-center gap-2.5 w-full py-4 rounded-xl text-white text-[13px] font-black tracking-[0.12em] uppercase transition-all duration-200 ${
                    agreed
                      ? "bg-[#004b9c] hover:bg-[#003d82] shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_8px_32px_rgba(0,75,156,0.4)] active:scale-[0.97]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send size={15} strokeWidth={2.5} />
                  Send Message
                </button>

                {/* WhatsApp alt */}
                <a
                  href="https://wa.me/971526514666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-[12px] font-black tracking-wider uppercase transition-all duration-200 active:scale-[0.97] border-2 border-green-200 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Or Chat on WhatsApp
                </a>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — MAP
      ══════════════════════════════════════ */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
              <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">Karama, Dubai</span>
            </div>
            <h2 className="font-black uppercase leading-none tracking-tight">
              <span className="block text-3xl lg:text-5xl text-gray-900 italic">HOW TO FIND US</span>
            </h2>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full h-[380px] lg:h-[460px] rounded-2xl overflow-hidden border border-gray-200 shadow-[0_4px_30px_rgba(0,75,156,0.08)] mb-5"
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

          <a
            href="https://maps.google.com/?q=13+B+Street+Karama+Dubai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[12px] font-black text-[#004b9c] border-2 border-[#004b9c]/20 px-5 py-2.5 rounded-xl hover:bg-[#004b9c] hover:text-white hover:border-[#004b9c] tracking-wider uppercase transition-all duration-200"
          >
            <ExternalLink size={13} strokeWidth={2.5} />
            Open in Google Maps
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — FAQ
      ══════════════════════════════════════ */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">

            {/* Left: Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-[3px] bg-[#81bf42] rounded-full" />
                <span className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase">FAQ</span>
              </div>
              <h2 className="font-black uppercase leading-tight tracking-tight mb-6">
                <span className="block text-3xl lg:text-4xl text-gray-900 italic">FREQUENTLY ASKED QUESTIONS</span>
              </h2>
              <p className="text-gray-400 text-[14px] leading-relaxed mb-8">
                Can't find the answer you're looking for? Reach out to our team directly.
              </p>
              <a
                href="https://wa.me/971526514666"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white text-[12px] font-black tracking-wider uppercase transition-all duration-200 active:scale-[0.97]"
                style={{ backgroundColor: "#25D366" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Ask on WhatsApp
              </a>
            </motion.div>

            {/* Right: Accordion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-2 flex flex-col gap-0"
            >
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className={`border-b border-gray-100 ${i === 0 ? "border-t" : ""}`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                  >
                    <span className={`text-[14px] font-bold leading-snug transition-colors duration-150 ${
                      openFaq === i ? "text-[#004b9c]" : "text-gray-800 group-hover:text-[#004b9c]"
                    }`}>
                      {faq.q}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      openFaq === i
                        ? "bg-[#004b9c] text-white rotate-180"
                        : "bg-gray-100 text-gray-400 group-hover:bg-[#004b9c]/10 group-hover:text-[#004b9c]"
                    }`}>
                      <ChevronDown size={14} strokeWidth={2.5} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-500 text-[14px] leading-relaxed pb-5 pr-10">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BOTTOM CTA STRIP
      ══════════════════════════════════════ */}
      <section className="bg-[#004b9c] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #81bf42 0%, transparent 60%)" }}
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16 py-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[#81bf42] text-[11px] font-black tracking-[0.2em] uppercase mb-1">Still Have Questions?</p>
            <h3 className="text-white text-2xl lg:text-3xl font-black italic uppercase leading-tight">
              Our Cricket Experts Are Ready To Help
            </h3>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a
              href="https://wa.me/971526514666"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-[12px] font-black tracking-wider uppercase transition-all active:scale-[0.97]"
              style={{ backgroundColor: "#25D366" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
            <a
              href="tel:+971526514666"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-[#004b9c] bg-white text-[12px] font-black tracking-wider uppercase hover:bg-gray-100 transition-all active:scale-[0.97]"
            >
              Call Us Now
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}