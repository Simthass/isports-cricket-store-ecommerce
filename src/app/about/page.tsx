"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Users,
  Target,
  MapPin,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  return (
    <main className="relative w-full bg-white font-['Poppins',_sans-serif] overflow-hidden pt-24 lg:pt-32 pb-20">
      {/* ── Background Ambient Orbs ── */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#004b9c]/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[-10%] w-[40vw] h-[40vw] bg-[#81bf42]/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-16">
        {/* ══════════════════════════════════════════════
            1. HERO SECTION
        ══════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20 lg:mb-32"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-[2px] w-8 bg-[#81bf42]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#81bf42]">
              Our Story
            </span>
            <div className="h-[2px] w-8 bg-[#81bf42]" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.05] uppercase italic mb-8"
          >
            Elevating The Game <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004b9c] to-[#002f6c]">
              Across The UAE.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl"
          >
            Born from a passion for the pitch, iSPORTS is the UAE's premier
            destination for professional-grade cricket equipment. We bridge the
            gap between elite gear and passionate players.
          </motion.p>
        </motion.div>

        {/* ══════════════════════════════════════════════
            2. CINEMATIC IMAGE GRID
        ══════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px] mb-24 lg:mb-32"
        >
          {/* Main Large Image */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-8 relative rounded-3xl overflow-hidden h-[400px] md:h-full group"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
            <Image
              src="/about-main.jpg" // Place image in public folder
              alt="Cricketer holding premium bat"
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          {/* Side Stacked Images */}
          <div className="md:col-span-4 flex flex-col gap-6 h-[400px] md:h-full">
            <motion.div
              variants={fadeUp}
              className="relative flex-1 rounded-3xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[#004b9c]/20 mix-blend-multiply z-10" />
              <Image
                src="/about-store.jpg" // Place image in public folder
                alt="iSPORTS Storefront"
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="relative flex-1 rounded-3xl overflow-hidden bg-gray-50 flex items-center justify-center p-8 border border-gray-100"
            >
              <div className="text-center">
                <h3 className="text-5xl font-black text-[#004b9c] mb-2">15+</h3>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                  Global Brands
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════
            3. CORE VALUES (BENTO GRID)
        ══════════════════════════════════════════════ */}
        <div className="mb-24 lg:mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight italic">
              What Drives <span className="text-[#004b9c]">Us.</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: ShieldCheck,
                title: "100% Authentic",
                desc: "As authorized dealers for MRF, Gray-Nicolls, and Adidas, we guarantee the authenticity of every stitch and willow.",
                color: "text-[#004b9c]",
                bg: "bg-[#e8f0fb]",
              },
              {
                icon: Zap,
                title: "Hyper-Local Speed",
                desc: "Based in Sharjah & Ajman, our localized logistics ensure your gear hits your doorstep before your next match.",
                color: "text-[#81bf42]",
                bg: "bg-[#eef7e0]",
              },
              {
                icon: Target,
                title: "Pro-Level Curation",
                desc: "We don't just stock catalogs. We hand-pick equipment tested and trusted by professional athletes worldwide.",
                color: "text-[#004b9c]",
                bg: "bg-[#e8f0fb]",
              },
              {
                icon: Users,
                title: "Community First",
                desc: "More than a store, we are a hub for the UAE cricket community. Providing expert advice via WhatsApp, 24/7.",
                color: "text-[#81bf42]",
                bg: "bg-[#eef7e0]",
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${value.bg} flex items-center justify-center mb-6`}
                >
                  <value.icon size={24} className={value.color} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════
            4. OUR LOCATIONS
        ══════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="bg-gray-900 rounded-[40px] p-10 lg:p-16 relative overflow-hidden"
        >
          {/* Abstract Dark Background Elements */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#004b9c] rounded-full blur-[120px] opacity-40" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center justify-between">
            <motion.div variants={fadeUp} className="max-w-xl">
              <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6 italic">
                Step Into <br />{" "}
                <span className="text-[#81bf42]">The Arena.</span>
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                Experience the weight of an English Willow or the fit of a
                high-end helmet in person. Visit our physical branches tailored
                for the UAE's cricketing community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4">
                  <MapPin className="text-[#81bf42]" size={20} />
                  <div>
                    <p className="text-white font-bold text-sm">
                      Sharjah Branch
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Flagship Store
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4">
                  <MapPin className="text-[#004b9c]" size={20} />
                  <div>
                    <p className="text-white font-bold text-sm">Ajman Branch</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Click & Collect Hub
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="flex-shrink-0">
              <Link
                href="/store-locator"
                className="group flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full text-sm font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl"
              >
                Get Directions
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
