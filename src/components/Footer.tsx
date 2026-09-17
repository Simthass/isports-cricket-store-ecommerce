"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import {
  Circle,
  Home,
  Phone,
  Clock,
  Mail,
  MessageSquareText,
  PhoneCall,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Footer = () => {
  const primaryBlue = "#004b9c";
  const footerBg = "#131b2b";
  const settings = useSiteSettings();
  const [hoursExpanded, setHoursExpanded] = React.useState(false);

  // Opening hours data
  const openingHours = [
    { day: "Monday", hours: "9:30 AM – 2:00 PM & 4:30 – 10:00 PM" },
    { day: "Tuesday", hours: "9:30 AM – 2:30 PM & 4:30 – 10:00 PM" },
    { day: "Wednesday", hours: "9:30 AM – 2:00 PM & 4:30 – 10:00 PM" },
    { day: "Thursday", hours: "9:30 AM – 2:00 PM & 4:30 – 10:00 PM" },
    { day: "Friday", hours: "9:30 AM – 2:00 PM & 4:30 – 10:00 PM" },
    { day: "Saturday", hours: "9:30 AM – 2:00 PM & 4:30 – 10:00 PM" },
    { day: "Sunday", hours: "9:30 AM – 2:00 PM & 4:30 – 10:00 PM" },
  ];

  // Get today's hours
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayHours =
    openingHours.find((h) => h.day === today)?.hours || "9:30 AM – 10:00 PM";

  const categories = ["Balls", "Helmets", "Clothing", "Bats", "Shoes"];
  const brands = ["Adidas", "Nike", "Shrey", "MoonWalkr", "Morrant"];
  const accounts = [
    "Sign in",
    "Sign up",
    "My Account",
    "About Us",
    "Contact us",
  ];

  return (
    <footer
      className="relative font-poppins mt-20"
      style={{ backgroundColor: footerBg }}
    >
      {/* 1. Top Border & Overlapping Logo */}
      <div className="flex justify-center pt-10 pb-6">
        <div className="relative w-[100px] h-[100px]">
          <Image
            src="/ISportsCricket-Logo.png"
            alt="iSPORTS Logo"
            fill
            sizes="100px"
            className="object-contain"
          />
        </div>
      </div>

      {/* Main Footer Container */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-4 pb-12 z-10 relative text-gray-200">
        {/* 2. Top Links Grid (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: CATEGORY */}
          <div>
            <h3 className="text-white font-semibold text-[16px] mb-6 tracking-wide">
              CATEGORY
            </h3>
            <ul className="space-y-4">
              {categories.map((item) => (
                <li key={item}>
                  <Link
                    href={`/category/${item.toLowerCase()}`}
                    className="flex items-center text-[14px] hover:text-white transition-colors group"
                  >
                    <Circle
                      size={10}
                      strokeWidth={3}
                      className="mr-3 text-gray-300 group-hover:text-white"
                    />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: TOP BRANDS */}
          <div>
            <h3 className="text-white font-semibold text-[16px] mb-6 tracking-wide">
              TOP BRANDS
            </h3>
            <ul className="space-y-4">
              {brands.map((item) => (
                <li key={item}>
                  <Link
                    href={`/brand/${item.toLowerCase()}`}
                    className="flex items-center text-[14px] hover:text-white transition-colors group"
                  >
                    <Circle
                      size={10}
                      strokeWidth={3}
                      className="mr-3 text-gray-300 group-hover:text-white"
                    />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: ACCOUNT */}
          <div>
            <h3 className="text-white font-semibold text-[16px] mb-6 tracking-wide">
              ACCOUNT
            </h3>
            <ul className="space-y-4">
              {accounts.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="flex items-center text-[14px] hover:text-white transition-colors group"
                  >
                    <Circle
                      size={10}
                      strokeWidth={3}
                      className="mr-3 text-gray-300 group-hover:text-white"
                    />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: CONTACT US & HOURS */}
          <div>
            <h3 className="text-white font-semibold text-[16px] mb-6 tracking-wide">
              CONTACT US
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start text-[14px]">
                <Home
                  size={18}
                  className="mr-4 mt-0.5 flex-shrink-0 text-gray-300"
                />
                <span>{settings.address || "13 B Street, Karama Dubai"}</span>
              </li>
              <li className="flex items-center text-[14px]">
                <Phone size={18} className="mr-4 flex-shrink-0 text-gray-300" />
                <span>{settings.phone || "+971 52 6514 666"}</span>
              </li>

              {/* Opening Hours - Today's Hours */}
              <li className="flex flex-col text-[14px]">
                <div className="flex items-start">
                  <Clock
                    size={18}
                    className="mr-4 mt-0.5 flex-shrink-0 text-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-semibold text-white">
                        Today ({today})
                      </span>
                      <span className="text-gray-300 text-[12px]">
                        {todayHours}
                      </span>
                    </div>

                    {/* Expandable Full Schedule */}
                    <button
                      onClick={() => setHoursExpanded(!hoursExpanded)}
                      className="flex items-center gap-1 mt-2 text-[11px] text-gray-400 hover:text-white transition-colors"
                    >
                      {hoursExpanded ? (
                        <>
                          <ChevronUp size={12} /> Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={12} /> View full weekly schedule
                        </>
                      )}
                    </button>

                    {hoursExpanded && (
                      <div className="mt-3 pt-2 border-t border-gray-700 space-y-1.5">
                        {openingHours.map((item) => (
                          <div
                            key={item.day}
                            className="flex justify-between text-[11px]"
                          >
                            <span
                              className={
                                item.day === today
                                  ? "text-white font-semibold"
                                  : "text-gray-400"
                              }
                            >
                              {item.day}
                            </span>
                            <span
                              className={
                                item.day === today
                                  ? "text-white"
                                  : "text-gray-500"
                              }
                            >
                              {item.hours}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>

              <li className="flex items-center text-[14px]">
                <Mail size={18} className="mr-4 flex-shrink-0 text-gray-300" />
                <a
                  href={`mailto:${settings.email}`}
                  className="underline hover:text-white transition-colors"
                >
                  {settings.email || "info@isportscricket.com"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="w-full border-t border-gray-600 my-12"></div>

        {/* 3. Bottom Action Grid (3 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-600">
          {/* Action 1: Chat */}
          <div className="flex flex-col items-center text-center px-4 py-8 lg:py-0">
            <MessageSquareText
              size={48}
              strokeWidth={1.5}
              className="mb-4 text-white"
            />
            <h4 className="text-white text-[20px] font-bold italic mb-2">
              Need Help?
            </h4>
            <p className="text-[13px] text-gray-300 mb-6">
              Chat with one of our customer service reps
            </p>
            <a
              href={`https://wa.me/${settings.whatsappNumber?.replace(/[^0-9]/g, "") || "971526514666"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold text-[13px] py-2.5 px-8 rounded hover:brightness-110 transition-all shadow-md inline-block"
              style={{ backgroundColor: primaryBlue }}
            >
              CHAT NOW
            </a>
          </div>

          {/* Action 2: Call & Socials */}
          <div className="flex flex-col items-center text-center px-4 py-8 lg:py-0">
            <PhoneCall
              size={48}
              strokeWidth={1.5}
              className="mb-4 text-white"
            />
            <h4 className="text-white text-[20px] font-bold italic mb-2">
              Call Us {settings.phone || "+971 52 6514 666"}
            </h4>
            <p className="text-[13px] text-gray-300 mb-6">
              We're here to answer your questions
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {/* Facebook */}
              {settings.facebook && (
                <Link
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                  style={{ backgroundColor: primaryBlue }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </Link>
              )}

              {/* Instagram */}
              {settings.instagram && (
                <Link
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                  style={{ backgroundColor: primaryBlue }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </Link>
              )}

              {/* TikTok */}
              {settings.tiktok && (
                <Link
                  href={settings.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                  style={{ backgroundColor: primaryBlue }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.58a6.34 6.34 0 0 0 8.88 5.3 6.34 6.34 0 0 0 3.73-5.3V8.42a7.32 7.32 0 0 0 4.28 1.42V6.33a4.57 4.57 0 0 1-2.3-.64z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {/* Action 3: Store Locator */}
          <div className="flex flex-col items-center text-center px-4 py-8 lg:py-0">
            <MapPin size={48} strokeWidth={1.5} className="mb-4 text-white" />
            <h4 className="text-white text-[20px] font-bold italic mb-2">
              Store Locator
            </h4>
            <p className="text-[13px] text-gray-300 mb-6">
              Explore a retail store or outlet near you.
            </p>
            <Link
              href="/store-locator"
              className="text-white font-semibold text-[13px] py-2.5 px-8 rounded hover:brightness-110 transition-all shadow-md inline-block"
              style={{ backgroundColor: primaryBlue }}
            >
              FIND STORE
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Bottom Copyright Bar */}
      <div
        className="w-full py-4 px-4 text-center text-white text-[12px] md:text-[13px]"
        style={{ backgroundColor: primaryBlue }}
      >
        <p>
          © Copyright iSportsCricket All Rights Reserved 2026. Developed By{" "}
          <strong className="font-semibold">TwoStack</strong>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
