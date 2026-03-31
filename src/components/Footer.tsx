"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Circle,
  Home,
  Phone,
  Clock,
  Mail,
  MessageSquareText,
  PhoneCall,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const primaryBlue = "#004b9c";
  const footerBg = "#131b2b"; // Dark slate/navy from your design

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
      <div className="absolute top-0 left-0 w-full border-t border-gray-600 z-0"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#131b2b] px-4">
        <div className="relative w-[80px] h-[90px]">
          <Image
            src="/ISportsCricket-Logo.png   "
            alt="iSPORTS Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Main Footer Container */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-24 pb-12 z-10 relative text-gray-200">
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

          {/* Column 4: CONTACT US */}
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
                <span>13 B Street, Karama Dubai</span>
              </li>
              <li className="flex items-center text-[14px]">
                <Phone size={18} className="mr-4 flex-shrink-0 text-gray-300" />
                <span>+971 4 353 3323</span>
              </li>
              <li className="flex items-center text-[14px]">
                <Clock size={18} className="mr-4 flex-shrink-0 text-gray-300" />
                <span>10.00PM - 19.00 (Mon - Sat)</span>
              </li>
              <li className="flex items-center text-[14px]">
                <Mail size={18} className="mr-4 flex-shrink-0 text-gray-300" />
                <a
                  href="mailto:info@isportscricket.com"
                  className="underline hover:text-white transition-colors"
                >
                  info@isportscricket.com
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
            <button
              className="text-white font-semibold text-[13px] py-2.5 px-8 rounded hover:brightness-110 transition-all shadow-md"
              style={{ backgroundColor: primaryBlue }}
            >
              CHAT NOW
            </button>
          </div>

          {/* Action 2: Call & Socials */}
          <div className="flex flex-col items-center text-center px-4 py-8 lg:py-0">
            <PhoneCall
              size={48}
              strokeWidth={1.5}
              className="mb-4 text-white"
            />
            <h4 className="text-white text-[20px] font-bold italic mb-2">
              Call Us +971 52 6514 666
            </h4>
            <p className="text-[13px] text-gray-300 mb-6">
              We're here to answer your questions
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                style={{ backgroundColor: primaryBlue }}
              ></Link>
              <Link
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                style={{ backgroundColor: primaryBlue }}
              ></Link>
              <Link
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                style={{ backgroundColor: primaryBlue }}
              >
                {/* Custom SVG for Pinterest since Lucide doesn't include it natively */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z" />
                </svg>
              </Link>
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
            <button
              className="text-white font-semibold text-[13px] py-2.5 px-8 rounded hover:brightness-110 transition-all shadow-md"
              style={{ backgroundColor: primaryBlue }}
            >
              FIND STORE
            </button>
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
          <strong className="font-semibold">Brand Systems Studio</strong>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
