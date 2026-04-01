"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquareText,
  CheckCircle2,
} from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    label: "Visit Us",
    value: "13 B Street, Karama, Dubai, UAE",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+971 52 6514 666 / +971 4 353 3323",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "info@isportscricket.com",
  },
  {
    icon: Clock,
    label: "Opening Hours",
    value: "Mon – Sat: 10:00 AM – 7:00 PM",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wire up to API route later
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero Banner ── */}
      <section className="bg-[#004b9c] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, #81bf42 0%, transparent 60%)",
          }}
        />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 lg:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#81bf42] text-[12px] font-bold tracking-[0.2em] uppercase mb-3">
              iSPORTS Cricket UAE
            </p>
            <h1 className="text-white text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Get In Touch
            </h1>
            <p className="text-blue-200 text-[15px] max-w-md">
              Have a question about cricket gear or your order? Our team is
              ready to help.
            </p>
          </motion.div>
        </div>
        {/* Accent bottom line */}
        <div className="h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />
      </section>

      {/* ── Main Content ── */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Left: Contact Info Cards ── */}
          <div className="flex flex-col gap-5">
            <h2 className="text-[#004b9c] text-[12px] font-bold tracking-[0.18em] uppercase mb-1">
              Contact Information
            </h2>
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#004b9c]/20 transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#004b9c]/8 flex items-center justify-center flex-shrink-0">
                    <Icon
                      size={20}
                      className="text-[#004b9c]"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#81bf42] tracking-widest uppercase mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-gray-700 text-[14px] font-medium leading-snug">
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Map embed */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mt-1 h-[220px]"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7!2d55.298!3d25.248!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zKarama+Dubai!5e0!3m2!1sen!2sae!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>

          {/* ── Right: Contact Form ── */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-4">
                <CheckCircle2
                  size={56}
                  className="text-[#81bf42]"
                  strokeWidth={1.5}
                />
                <h3 className="text-2xl font-bold text-gray-800">
                  Message Sent!
                </h3>
                <p className="text-gray-500 text-[15px] max-w-sm">
                  Thanks for reaching out. Our team will get back to you within
                  24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="mt-4 px-7 py-2.5 rounded-xl border border-[#004b9c] text-[#004b9c] text-[13px] font-semibold hover:bg-[#004b9c] hover:text-white transition-all duration-200"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <MessageSquareText
                    size={22}
                    className="text-[#004b9c]"
                    strokeWidth={1.8}
                  />
                  <div>
                    <h2 className="text-[20px] font-bold text-gray-800">
                      Send Us a Message
                    </h2>
                    <p className="text-gray-400 text-[13px]">
                      We typically reply within 1 business day
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Ahmed Al Mansoori"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Order inquiry, Product availability..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us how we can help you..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#004b9c] focus:ring-2 focus:ring-[#004b9c]/10 transition-all resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
                    <p className="text-gray-400 text-[12px]">
                      <span className="text-red-400">*</span> Required fields
                    </p>
                    <button
                      type="submit"
                      className="flex items-center gap-2.5 px-8 py-3 rounded-xl bg-[#004b9c] hover:bg-[#003d82] text-white text-[13px] font-bold tracking-wider shadow-[0_4px_20px_rgba(0,75,156,0.3)] hover:shadow-[0_6px_24px_rgba(0,75,156,0.4)] active:scale-[0.97] transition-all duration-200"
                    >
                      <Send size={15} strokeWidth={2} />
                      SEND MESSAGE
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
