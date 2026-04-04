"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ShoppingBasket,
  User,
  Truck,
  ShieldCheck,
  Headphones,
  Mail,
  Menu,
  X,
  ChevronDown,
  Phone,
  LogOut,
  Package,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth/AuthModal";
import { useRouter } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  {
    name: "Shop",
    href: "/shop",
    hasDropdown: true,
    dropdown: [
      { name: "Bats", href: "/category/bats" },
      { name: "Balls", href: "/category/balls" },
      { name: "Helmets", href: "/category/helmets" },
      { name: "Clothing & Jersey", href: "/category/clothing" },
      { name: "Shoes", href: "/category/shoes" },
      { name: "Backpacks", href: "/category/backpacks" },
      { name: "Accessories", href: "/category/accessories" },
    ],
  },
  { name: "About us", href: "/about" },
  { name: "Contact us", href: "/contact" },
];

const marqueeItems = [
  { icon: Truck, text: "FREE DELIVERY ON ORDERS OVER AED 500" },
  { icon: ShieldCheck, text: "TRUSTED BY 1000+ GENUINE CUSTOMERS" },
  { icon: Headphones, text: "24/7 CUSTOMER SUPPORT AVAILABLE" },
  { icon: Mail, text: "SIGN UP FOR GREAT DEALS" },
];

const doubledMarquee = [...marqueeItems, ...marqueeItems];

// ── Avatar helper — initials circle if no image ──────────────────────
function UserAvatar({
  name,
  image,
  size = 32,
}: {
  name?: string | null;
  image?: string | null;
  size?: number;
}) {
  if (image) {
    return (
      <div
        className="rounded-full overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={image}
          alt={name ?? "User"}
          width={size}
          height={size}
          className="object-cover"
        />
      </div>
    );
  }
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";
  return (
    <div
      className="rounded-full bg-[#004b9c] text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export default function Header() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cartCount] = useState(2);
  const [searchValue, setSearchValue] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setAccountOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* ── Top Utility Bar ── */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#002f6c] hidden lg:block">
        <div className="max-w-[1400px] mx-auto px-10 flex items-center justify-between h-9">
          <div className="flex items-center gap-1.5 text-white text-[11px] font-medium tracking-wide">
            <Phone size={11} className="text-[#81bf42]" />
            <span>+971 52 6514 666</span>
            <span className="mx-3 text-white">|</span>
            <span>info@isportscricket.com</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-medium tracking-wide">
            <Link
              href="/product"
              className="text-white hover:text-[#81bf42] transition-colors duration-150"
            >
              Track Order
            </Link>
            <Link
              href="/store-locator"
              className="text-white hover:text-[#81bf42] transition-colors duration-150"
            >
              Store Locator
            </Link>

            {/* Top bar: Sign In / Sign Out */}
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="text-white hover:text-[#81bf42] transition-colors duration-150"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthOpen(true);
                }}
                className="text-white hover:text-[#81bf42] transition-colors duration-150"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header
        className={`fixed left-0 w-full z-40 bg-white transition-all duration-300 lg:top-9 top-0 ${scrolled ? "shadow-[0_4px_30px_rgba(0,75,156,0.13)]" : "shadow-sm"}`}
      >
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10">
          <div className="flex items-center h-[76px] gap-6 lg:gap-10">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative w-[155px] h-[52px]">
                <Image
                  src="/ISportsCricket-Logo.png"
                  alt="iSPORTS Cricket"
                  fill
                  sizes="155px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() =>
                    link.hasDropdown && setActiveDropdown(link.name)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 px-4 py-2 rounded-lg text-[14px] font-medium text-gray-800 hover:text-[#004b9c] hover:bg-blue-50/70 transition-all duration-150"
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <ChevronDown
                        size={12}
                        className={`text-gray-400 transition-transform duration-200 ${activeDropdown === link.name ? "rotate-180 text-[#004b9c]" : ""}`}
                      />
                    )}
                    <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#81bf42] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>

                  <AnimatePresence>
                    {link.hasDropdown && activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-[0_8px_40px_rgba(0,75,156,0.15)] border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="py-2">
                          {link.dropdown?.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-100 group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#81bf42] mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0">
              {/* Search */}
              <div className="relative hidden lg:flex items-center group">
                <Search
                  className="absolute left-3.5 text-gray-400 group-focus-within:text-[#004b9c] transition-colors duration-200 pointer-events-none z-10"
                  size={15}
                />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Quickly search for products"
                  className="w-[310px] xl:w-[360px] bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#004b9c] focus:bg-white focus:ring-2 focus:ring-[#004b9c]/10 rounded-xl pl-10 pr-4 py-[9px] text-[13px] text-gray-700 placeholder-gray-400 outline-none transition-all duration-200"
                />
                {searchValue && (
                  <button
                    onClick={() => setSearchValue("")}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="hidden lg:block w-px h-8 bg-gray-200 mx-1" />

              {/* ── Account Area — changes based on login state ── */}
              {isLoggedIn ? (
                // Logged in: avatar + name + dropdown
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-blue-50 transition-all duration-150 group"
                  >
                    <UserAvatar
                      name={session.user?.name}
                      image={session.user?.image}
                      size={32}
                    />
                    <div className="hidden xl:flex flex-col items-start leading-tight">
                      <span className="text-[12px] font-bold text-gray-800 max-w-[90px] truncate">
                        {session.user?.name?.split(" ")[0] ?? "Account"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {isAdmin ? "Admin" : "My Account"}
                      </span>
                    </div>
                    <ChevronDown
                      size={13}
                      className={`text-gray-400 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Account Dropdown */}
                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,75,156,0.15)] border border-gray-100 overflow-hidden z-50"
                      >
                        {/* User info header */}
                        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-3">
                          <UserAvatar
                            name={session.user?.name}
                            image={session.user?.image}
                            size={36}
                          />
                          <div className="flex flex-col leading-tight overflow-hidden">
                            <span className="text-[13px] font-bold text-gray-900 truncate">
                              {session.user?.name ?? "User"}
                            </span>
                            <span className="text-[11px] text-gray-400 truncate">
                              {session.user?.email}
                            </span>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-2">
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setAccountOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#004b9c] hover:bg-blue-50 transition-colors duration-100"
                            >
                              <LayoutDashboard
                                size={15}
                                className="text-[#004b9c]"
                              />
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            href="/account"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-100"
                          >
                            <User size={15} className="text-gray-400" />
                            My Account
                          </Link>
                          <Link
                            href="/account/orders"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-100"
                          >
                            <Package size={15} className="text-gray-400" />
                            My Orders
                          </Link>
                          <Link
                            href="/account/settings"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-100"
                          >
                            <Settings size={15} className="text-gray-400" />
                            Settings
                          </Link>
                        </div>

                        {/* Sign out */}
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors duration-100"
                          >
                            <LogOut size={15} className="text-red-400" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Not logged in: plain account icon
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthOpen(true);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-[#004b9c] hover:bg-blue-50 transition-all duration-150"
                  title="Sign In"
                >
                  <User size={21} strokeWidth={1.7} />
                </button>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-[#004b9c] hover:bg-blue-50 transition-all duration-150"
                title="Cart"
              >
                <ShoppingBasket size={21} strokeWidth={1.7} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#81bf42] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </Link>

              <div className="hidden md:block w-px h-8 bg-gray-200 mx-1" />

              {/* Register CTA — hidden when logged in */}
              {!isLoggedIn && (
                <button
                  onClick={() => router.push("/register")}
                  className="hidden md:inline-flex items-center gap-2 px-5 py-[9px] rounded-xl text-white text-[12px] font-bold tracking-[0.08em] bg-[#004b9c] hover:bg-[#003d82] active:scale-[0.97] transition-all duration-150 shadow-[0_2px_12px_rgba(0,75,156,0.3)] hover:shadow-[0_4px_20px_rgba(0,75,156,0.4)] whitespace-nowrap"
                >
                  REGISTER NOW
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-700 hover:border-[#004b9c] hover:text-[#004b9c] hover:bg-blue-50 transition-all duration-150"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="h-[3px] bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />

        {/* Marquee */}
        <div className="bg-[#004b9c] overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap py-[8px]"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
          >
            {doubledMarquee.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-8 flex-shrink-0"
                >
                  <Icon
                    size={13}
                    className="text-[#81bf42] flex-shrink-0"
                    strokeWidth={2.5}
                  />
                  <span className="text-white text-[11px] font-bold tracking-[0.14em] uppercase">
                    {item.text}
                  </span>
                  <span className="text-[#81bf42]/50 text-[8px] ml-6">◆</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              className="fixed top-0 left-0 z-40 w-[310px] h-full bg-white shadow-2xl flex flex-col lg:hidden"
            >
              <div className="h-1.5 bg-gradient-to-r from-[#004b9c] via-[#81bf42] to-[#004b9c]" />

              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="relative w-[130px] h-[44px]">
                  <Image
                    src="/ISportsCricket-Logo.png"
                    alt="iSPORTS"
                    fill
                    sizes="130px"
                    className="object-contain object-left"
                  />
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Mobile user info if logged in */}
              {isLoggedIn && (
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-blue-50/50">
                  <UserAvatar
                    name={session.user?.name}
                    image={session.user?.image}
                    size={38}
                  />
                  <div className="flex flex-col leading-tight overflow-hidden">
                    <span className="text-[13px] font-bold text-gray-900 truncate">
                      {session.user?.name}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate">
                      {session.user?.email}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Search */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-[13px] placeholder-gray-400 focus:outline-none focus:border-[#004b9c]"
                  />
                </div>
              </div>

              {/* Mobile Nav */}
              <nav className="flex flex-col px-3 py-3 flex-1 gap-0.5 overflow-y-auto">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold tracking-wider text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-150"
                    >
                      {link.name}
                      {link.hasDropdown && (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </Link>
                    {link.hasDropdown && (
                      <div className="ml-4 mb-1 border-l-2 border-[#81bf42]/30 pl-3">
                        {link.dropdown?.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center py-2 px-2 text-[12.5px] text-gray-600 hover:text-[#004b9c] transition-colors rounded-lg hover:bg-blue-50"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Mobile account links when logged in */}
                {isLoggedIn && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      My Account
                    </p>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#004b9c] hover:bg-blue-50"
                      >
                        <LayoutDashboard size={15} /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004b9c]"
                    >
                      <User size={15} className="text-gray-400" /> My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004b9c]"
                    >
                      <Package size={15} className="text-gray-400" /> My Orders
                    </Link>
                    <Link
                      href="/account/settings"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004b9c]"
                    >
                      <Settings size={15} className="text-gray-400" /> Settings
                    </Link>
                  </div>
                )}
              </nav>

              {/* Mobile Footer */}
              <div className="px-4 py-4 border-t border-gray-100 flex flex-col gap-2.5">
                {isLoggedIn ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 text-[12px] font-bold tracking-wider rounded-xl transition-colors duration-150 border border-red-200"
                  >
                    <LogOut size={14} /> SIGN OUT
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => router.push("/register")}
                      className="flex items-center justify-center w-full py-3 bg-[#004b9c] hover:bg-[#003d82] text-white text-[12px] font-bold tracking-wider rounded-xl transition-colors duration-150"
                    >
                      REGISTER NOW
                    </button>
                    <button
                      onClick={() => router.push("/login v")}
                      className="flex items-center justify-center w-full py-2.5 border border-gray-200 text-gray-700 hover:border-[#004b9c] hover:text-[#004b9c] text-[12px] font-bold tracking-wider rounded-xl transition-colors duration-150"
                    >
                      SIGN IN
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Spacer */}
      <div className="h-[103px] lg:h-[139px]" />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
}
