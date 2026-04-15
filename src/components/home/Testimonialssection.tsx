"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Star, ArrowUpRight, Quote } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────
interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  review: string;
}

interface TestimonialCardProps {
  item: Testimonial;
}

// ─── Testimonials Data ────────────────────────────────────────────
const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Ajith Kumar",
    role: "Cricket Coach · Dubai",
    avatar: "/Testimonials/AK.jpg",
    rating: 5,
    review:
      "iSPORTS has completely transformed how our academy sources equipment. The quality of the Gray-Nicolls bats we ordered was exceptional — delivered same day to Sharjah. Absolutely brilliant service.",
  },
  {
    id: 2,
    name: "Joseph Vijay",
    role: "Club Captain · Ajman CC",
    avatar: "/Testimonials/Vijay.png",
    rating: 5,
    review:
      "Ordered Shrey helmets and Kookaburra balls for our entire squad. The WhatsApp ordering made it so easy — got a confirmation within minutes and delivery was next morning. Highly recommended.",
  },
  {
    id: 3,
    name: "Rajinikanth S.",
    role: "Amateur Cricketer · Sharjah",
    avatar: "/Testimonials/rajini.jpg",
    rating: 5,
    review:
      "Best cricket store in the UAE without question. Found my MRF bat here at the best price. The Cash on Delivery option made me feel totally safe ordering online for the first time.",
  },
  {
    id: 4,
    name: "Virat Mehta",
    role: "Professional Player · Abu Dhabi",
    avatar: "/testimonials/kamal.jpg",
    rating: 5,
    review:
      "The staff's product knowledge is incredible. They helped me pick the right English willow grade for my playing style over WhatsApp. Delivery was faster than I expected — outstanding.",
  },
  {
    id: 5,
    name: "Rohit Sharma A.",
    role: "Weekend League · Dubai",
    avatar: "/testimonials/ram.jpg",
    rating: 5,
    review:
      "Bought Adidas spike shoes and a full kit from iSPORTS. Everything was authentic, well-packaged, and arrived in perfect condition. The Tabby installment option was a real bonus.",
  },
  {
    id: 6,
    name: "Sachin Patel",
    role: "School Team Coach · Sharjah",
    avatar: "/testimonials/vj.jpg",
    rating: 5,
    review:
      "Sourced equipment for 22 students in one order. The team was incredibly helpful coordinating the bulk purchase via WhatsApp. Every item was exactly as described. Will order again every season.",
  },
];

// Double for seamless loop
const MARQUEE_ITEMS = [...TESTIMONIALS, ...TESTIMONIALS];

// ─── Star Row ────────────────────────────────────────────────────
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={0}
          fill={i < count ? "#81bf42" : "#e2e8f0"}
        />
      ))}
    </div>
  );
}

// ─── Single Testimonial Card ──────────────────────────────────────
function TestimonialCard({ item }: TestimonialCardProps) {
  return (
    <div
      className="group relative flex-shrink-0 w-[340px] mx-3 bg-white rounded-2xl p-5 border border-[#004b9c]/08 shadow-[0_2px_16px_rgba(0,75,156,0.06)] hover:shadow-[0_12px_40px_rgba(0,75,156,0.12)] hover:-translate-y-1 hover:border-[#004b9c]/18 transition-all duration-300 ease-out cursor-default"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Quote icon — top right */}
      <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-[#e8f0fb] flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-200">
        <Quote size={12} strokeWidth={2} className="text-[#004b9c]" />
      </div>

      {/* Stars */}
      <Stars count={item.rating} />

      {/* Review text */}
      <p className="text-gray-600 text-[13px] font-normal leading-[1.7] mt-3 mb-5 line-clamp-3">
        {item.review}
      </p>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-[#004b9c]/10 via-[#81bf42]/20 to-transparent mb-4" />

      {/* Author row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#81bf42]/30 flex-shrink-0">
            <Image
              src={item.avatar}
              alt={item.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-gray-900 text-[13px] font-bold leading-tight">
              {item.name}
            </span>
            <span className="text-gray-400 text-[11px] font-normal leading-tight">
              {item.role}
            </span>
          </div>
        </div>

        {/* Arrow icon */}
        <div className="w-8 h-8 rounded-full border border-[#004b9c]/12 flex items-center justify-center group-hover:bg-[#004b9c] group-hover:border-[#004b9c] transition-all duration-200">
          <ArrowUpRight
            size={13}
            strokeWidth={2.2}
            className="text-[#004b9c]/40 group-hover:text-white transition-colors duration-200"
          />
        </div>
      </div>

      {/* Bottom accent rule on hover */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-2xl">
        <div className="h-[2.5px] w-full bg-gradient-to-r from-[#004b9c] to-[#81bf42] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="relative w-full bg-white overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Subtle dot texture */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #004b9c12 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#81bf42]/06 blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#004b9c]/06 blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Main Content */}
      <div className="relative max-w-[1400px] mx-auto px-5 lg:px-12 mb-14">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* LEFT: Headline + Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.52, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-6 h-full"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5">
              <div className="h-[3px] w-8 rounded-full bg-[#81bf42]" />
              <span className="text-[10.5px] font-semibold tracking-[0.24em] uppercase text-[#81bf42]">
                Customer Stories
              </span>
            </div>

            {/* Headline block */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl rounded-tr-none p-6 pb-5 border border-[#004b9c]/08 shadow-[0_4px_24px_rgba(0,75,156,0.07)]">
                <div
                  className="absolute -top-px -right-px w-10 h-10 bg-white"
                  style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
                />

                <h2
                  className="text-gray-900 font-black leading-[1.1] tracking-tight"
                  style={{ fontSize: "clamp(2rem, 3.8vw, 3rem)" }}
                >
                  Hear From Our{" "}
                  <span
                    className="text-transparent"
                    style={{
                      WebkitTextStroke: "2px #004b9c",
                      paintOrder: "stroke fill",
                    }}
                  >
                    Satisfied
                  </span>
                  <br />
                  Clients Have <span className="text-[#004b9c]">
                    To Say
                  </span>{" "}
                  <span className="text-gray-900">🏏</span>
                </h2>

                <p className="text-gray-400 text-[13.5px] font-normal leading-relaxed mt-3 max-w-[380px]">
                  Over 1,000 UAE cricketers trust iSPORTS for their gear. Here's
                  what they're saying about us.
                </p>

                {/* Mini stat row */}
                <div className="flex items-center gap-6 mt-5">
                  {[
                    { val: "1K+", lbl: "Happy Players" },
                    { val: "4.9★", lbl: "Average Rating" },
                    { val: "UAE", lbl: "Based & Trusted" },
                  ].map((s, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <div className="w-px h-8 bg-[#004b9c]/10" />}
                      <div className="flex flex-col">
                        <span className="text-[#004b9c] font-black text-[1.2rem] leading-none">
                          {s.val}
                        </span>
                        <span className="text-gray-400 text-[10.5px] font-medium tracking-wide uppercase mt-0.5">
                          {s.lbl}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Cricket image */}
            <div className="relative rounded-3xl overflow-hidden h-[300px] lg:h-[340px] shadow-xl flex-1">
              <Image
                src="/testimonial.png"
                alt="Cricket player in action"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#004b9c]/30 via-transparent to-transparent" />
              <div className="absolute top-0 left-0 w-1 h-16 bg-gradient-to-b from-[#004b9c] to-[#81bf42] rounded-br-full" />

              <div className="absolute bottom-5 right-5 flex flex-col items-end">
                <span className="text-white font-black text-[2.8rem] leading-none tracking-tight drop-shadow-lg">
                  10.7K+
                </span>
                <span className="text-white/70 text-[11px] font-semibold tracking-[0.18em] uppercase">
                  Orders Delivered
                </span>
              </div>

              <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-[#81bf42] animate-pulse" />
                <span className="text-white text-[11px] font-semibold tracking-wide">
                  Verified Reviews
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Stacked review cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.52,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="flex flex-col gap-4 h-full"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] font-semibold tracking-[0.22em] uppercase text-[#004b9c]/50">
                Latest Reviews
              </span>
              <div className="flex items-center gap-1.5">
                <Stars count={5} />
                <span className="text-[11.5px] font-bold text-[#004b9c]">
                  5.0
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 flex-1">
              {TESTIMONIALS.slice(0, 3).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.42, delay: 0.18 + i * 0.1 }}
                  className="flex-1"
                >
                  <div className="group relative bg-[#f8faff] hover:bg-white rounded-2xl p-5 border border-[#004b9c]/08 hover:border-[#004b9c]/18 shadow-[0_1px_12px_rgba(0,75,156,0.05)] hover:shadow-[0_10px_36px_rgba(0,75,156,0.10)] transition-all duration-300 ease-out hover:-translate-y-0.5 h-full flex flex-col">
                    <Stars count={item.rating} />
                    <p className="text-gray-600 text-[12.5px] font-normal leading-[1.7] mt-2.5 mb-4 line-clamp-2 flex-1">
                      {item.review}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#81bf42]/30 flex-shrink-0">
                          <Image
                            src={item.avatar}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                        <div>
                          <p className="text-gray-900 text-[12.5px] font-bold leading-tight">
                            {item.name}
                          </p>
                          <p className="text-gray-400 text-[11px] font-normal leading-tight">
                            {item.role}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full border border-[#004b9c]/14 flex items-center justify-center group-hover:bg-[#004b9c] group-hover:border-[#004b9c] transition-all duration-200">
                        <ArrowUpRight
                          size={12}
                          strokeWidth={2.2}
                          className="text-[#004b9c]/40 group-hover:text-white transition-colors duration-200"
                        />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-2xl">
                      <div className="h-[2px] w-full bg-gradient-to-r from-[#004b9c] to-[#81bf42] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative"
      >
        <div className="max-w-[1400px] mx-auto px-5 lg:px-12 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#004b9c]/15" />
            <span className="text-[10px] font-semibold tracking-[0.26em] uppercase text-[#004b9c]/40 flex-shrink-0">
              More Reviews
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#004b9c]/15" />
          </div>
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-20 lg:w-32 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-20 lg:w-32 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />

        <div className="flex overflow-hidden pb-4">
          <div className="flex items-stretch will-change-transform animate-testimonial-marquee">
            {MARQUEE_ITEMS.map((item, idx) => (
              <TestimonialCard key={`${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Keyframes animation */}
      <style jsx>{`
        @keyframes testimonial-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-testimonial-marquee {
          animation: testimonial-marquee 38s linear infinite;
        }
        .animate-testimonial-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
