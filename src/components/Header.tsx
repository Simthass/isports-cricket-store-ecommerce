// src/components/layout/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useSiteSettings } from "@/components/providers/SiteSettingsProvider";
import SearchBar from "@/components/search/SearchBar";
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
  ChevronRight,
  Phone,
  LogOut,
  Package,
  LayoutDashboard,
  Tag,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

// ── Types ─────────────────────────────────────────────────────
interface NavSubCategory {
  name: string;
  slug: string;
}

interface NavCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  subCategories?: NavSubCategory[];
}

interface NavBrand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

const staticNavLinks = [
  { name: "Home", href: "/" },
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

// ── Avatar ─────────────────────────────────────────────────────
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

// ── Shop Mega-Menu with subcategory fly-out ───────────────────
function ShopMegaMenu({
  categories,
  brands,
  onClose,
}: {
  categories: NavCategory[];
  brands: NavBrand[];
  onClose: () => void;
}) {
  const [activePanel, setActivePanel] = useState<"categories" | "brands">(
    "categories",
  );
  // Track which category is hovered to show its subs
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

  const hoveredCat = categories.find((c) => c._id === hoveredCatId) ?? null;
  const showSubPanel =
    activePanel === "categories" &&
    hoveredCat &&
    (hoveredCat.subCategories?.length ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.18 }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-2xl shadow-[0_16px_60px_rgba(0,75,156,0.18)] border border-gray-100 overflow-hidden z-50"
      style={{ width: showSubPanel ? 720 : 560 }}
      onMouseLeave={() => setHoveredCatId(null)}
    >
      <div className="flex h-full">
        {/* Left sidebar */}
        <div className="w-[180px] flex-shrink-0 bg-[#f8f9fc] border-r border-gray-100 p-3 flex flex-col gap-1">
          <p className="text-[9px] font-black text-gray-400 tracking-[0.18em] uppercase px-3 pt-1 pb-2">
            Browse By
          </p>
          <button
            onMouseEnter={() => setActivePanel("categories")}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${activePanel === "categories" ? "bg-[#004b9c] text-white shadow-[0_4px_14px_rgba(0,75,156,0.28)]" : "text-gray-600 hover:bg-white hover:text-[#004b9c]"}`}
          >
            <span className="flex items-center gap-2.5">
              <Layers
                size={14}
                className={
                  activePanel === "categories" ? "text-white" : "text-[#004b9c]"
                }
              />
              Categories
            </span>
            <ChevronRight
              size={12}
              className={
                activePanel === "categories" ? "text-white/70" : "text-gray-300"
              }
            />
          </button>
          <button
            onMouseEnter={() => setActivePanel("brands")}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${activePanel === "brands" ? "bg-[#004b9c] text-white shadow-[0_4px_14px_rgba(0,75,156,0.28)]" : "text-gray-600 hover:bg-white hover:text-[#004b9c]"}`}
          >
            <span className="flex items-center gap-2.5">
              <Tag
                size={14}
                className={
                  activePanel === "brands" ? "text-white" : "text-[#81bf42]"
                }
              />
              Brands
            </span>
            <ChevronRight
              size={12}
              className={
                activePanel === "brands" ? "text-white/70" : "text-gray-300"
              }
            />
          </button>
          <div className="mt-auto pt-3 border-t border-gray-200">
            <Link
              href="/shop"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold text-[#004b9c] hover:bg-white transition-colors"
            >
              View All Products →
            </Link>
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1 p-4 max-h-[360px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activePanel === "categories" ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.14 }}
              >
                <p className="text-[9px] font-black text-gray-400 tracking-[0.18em] uppercase mb-3">
                  All Categories
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((cat) => {
                    const hasSubs = (cat.subCategories?.length ?? 0) > 0;
                    const isHov = hoveredCatId === cat._id;
                    return (
                      <div
                        key={cat._id}
                        onMouseEnter={() => setHoveredCatId(cat._id)}
                      >
                        <Link
                          href={`/shop?category=${cat.slug}`}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 transition-all duration-150 group w-full ${isHov ? "bg-blue-50 text-[#004b9c]" : "hover:bg-blue-50 hover:text-[#004b9c]"}`}
                        >
                          {cat.image ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#004b9c]/8 flex items-center justify-center flex-shrink-0">
                              <Layers size={14} className="text-[#004b9c]" />
                            </div>
                          )}
                          <span className="text-[13px] font-medium group-hover:font-semibold transition-all truncate flex-1">
                            {cat.name}
                          </span>
                          {hasSubs && (
                            <ChevronRight
                              size={12}
                              className="text-gray-300 flex-shrink-0"
                            />
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="brands"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.14 }}
              >
                <p className="text-[9px] font-black text-gray-400 tracking-[0.18em] uppercase mb-3">
                  All Brands
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {brands.map((brand) => (
                    <Link
                      key={brand._id}
                      href={`/brand/${brand.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-[#004b9c] text-gray-700 transition-all duration-150 group"
                    >
                      {brand.logo ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 p-1">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={28}
                            height={28}
                            className="object-contain w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#81bf42]/10 flex items-center justify-center flex-shrink-0">
                          <Tag size={14} className="text-[#81bf42]" />
                        </div>
                      )}
                      <span className="text-[13px] font-medium group-hover:font-semibold transition-all truncate">
                        {brand.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sub-category fly-out panel */}
        <AnimatePresence>
          {showSubPanel && hoveredCat && (
            <motion.div
              key={hoveredCat._id + "-subs"}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="w-[160px] flex-shrink-0 border-l border-gray-100 bg-[#fafbff] p-3 max-h-[360px] overflow-y-auto"
              onMouseEnter={() => setHoveredCatId(hoveredCat._id)}
            >
              <p className="text-[9px] font-black text-gray-400 tracking-[0.15em] uppercase px-2 pt-1 pb-2 truncate">
                {hoveredCat.name}
              </p>
              <div className="flex flex-col gap-0.5">
                <Link
                  href={`/shop?category=${hoveredCat.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-bold text-[#004b9c] hover:bg-blue-100 transition-colors"
                >
                  All {hoveredCat.name}
                </Link>
                {hoveredCat.subCategories!.map((sc) => (
                  <Link
                    key={sc.slug}
                    href={`/shop?category=${hoveredCat.slug}__${sc.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium text-gray-600 hover:bg-blue-50 hover:text-[#004b9c] transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                    {sc.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main Header ───────────────────────────────────────────────
export default function Header() {
  const { data: session, status } = useSession();
  const { cartCount } = useCart();
  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";
  const settings = useSiteSettings();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const [navBrands, setNavBrands] = useState<NavBrand[]>([]);
  const [navLoading, setNavLoading] = useState(true);

  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileBrandOpen, setMobileBrandOpen] = useState(false);
  // Track which mobile category has its subs expanded
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/shop/nav-data")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setNavCategories(json.data.categories ?? []);
          setNavBrands(json.data.brands ?? []);
        }
      })
      .finally(() => setNavLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setAccountOpen(false);
      if (shopRef.current && !shopRef.current.contains(e.target as Node))
        setShopMenuOpen(false);
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
      {/* Top Utility Bar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-[#002f6c] hidden lg:block">
        <div className="max-w-[1400px] mx-auto px-10 flex items-center justify-between h-9">
          <div className="flex items-center gap-1.5 text-white text-[11px] font-medium tracking-wide">
            <Phone size={11} className="text-[#81bf42]" />
            <span>{settings.phone || "+971 52 6514 666"}</span>
            <span className="mx-3 text-white">|</span>
            <span>{settings.email || "info@isportscricket.com"}</span>
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
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="text-white hover:text-[#81bf42] transition-colors duration-150"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="text-white hover:text-[#81bf42] transition-colors duration-150"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`fixed left-0 w-full z-40 bg-white transition-all duration-300 lg:top-9 top-0 ${scrolled ? "shadow-[0_4px_30px_rgba(0,75,156,0.13)]" : "shadow-sm"}`}
      >
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10">
          <div className="flex items-center h-[76px] gap-6 lg:gap-10">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative w-[155px] h-[52px]">
                <Image
                  src={settings.logo || "/ISportsCricket-Logo.png"}
                  alt={settings.siteTitle}
                  fill
                  sizes="155px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              <Link
                href="/"
                className="group relative flex items-center gap-1 px-4 py-2 rounded-lg text-[14px] font-medium text-gray-800 hover:text-[#004b9c] hover:bg-blue-50/70 transition-all duration-150"
              >
                Home
                <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#81bf42] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>

              {/* Shop mega menu */}
              <div
                ref={shopRef}
                className="relative"
                onMouseEnter={() => setShopMenuOpen(true)}
                onMouseLeave={() => setShopMenuOpen(false)}
              >
                <Link
                  href="/shop"
                  className="group relative flex items-center gap-1 px-4 py-2 rounded-lg text-[14px] font-medium text-gray-800 hover:text-[#004b9c] hover:bg-blue-50/70 transition-all duration-150"
                >
                  Shop
                  <ChevronDown
                    size={12}
                    className={`text-gray-400 transition-transform duration-200 ${shopMenuOpen ? "rotate-180 text-[#004b9c]" : ""}`}
                  />
                  <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#81bf42] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
                <AnimatePresence>
                  {shopMenuOpen && !navLoading && (
                    <ShopMegaMenu
                      categories={navCategories}
                      brands={navBrands}
                      onClose={() => setShopMenuOpen(false)}
                    />
                  )}
                </AnimatePresence>
              </div>

              {staticNavLinks
                .filter((l) => l.name !== "Home")
                .map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="group relative flex items-center gap-1 px-4 py-2 rounded-lg text-[14px] font-medium text-gray-800 hover:text-[#004b9c] hover:bg-blue-50/70 transition-all duration-150"
                  >
                    {link.name}
                    <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#81bf42] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                ))}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0">
              <SearchBar className="hidden lg:block w-[310px] xl:w-[360px]" />
              <div className="hidden lg:block w-px h-8 bg-gray-200 mx-1" />

              {isLoggedIn ? (
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
                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,75,156,0.15)] border border-gray-100 overflow-hidden z-50"
                      >
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
                              />{" "}
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            href="/account"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-100"
                          >
                            <User size={15} className="text-gray-400" /> My
                            Account
                          </Link>
                          <Link
                            href="/account/orders"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-100"
                          >
                            <Package size={15} className="text-gray-400" /> My
                            Orders
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors duration-100"
                          >
                            <LogOut size={15} className="text-red-400" /> Sign
                            Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-[#004b9c] hover:bg-blue-50 transition-all duration-150"
                  title="Sign In"
                >
                  <User size={21} strokeWidth={1.7} />
                </button>
              )}

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

              {!isLoggedIn && (
                <button
                  onClick={() => router.push("/register")}
                  className="hidden md:inline-flex items-center gap-2 px-5 py-[9px] rounded-xl text-white text-[12px] font-bold tracking-[0.08em] bg-[#004b9c] hover:bg-[#003d82] active:scale-[0.97] transition-all duration-150 shadow-[0_2px_12px_rgba(0,75,156,0.3)] hover:shadow-[0_4px_20px_rgba(0,75,156,0.4)] whitespace-nowrap"
                >
                  REGISTER NOW
                </button>
              )}

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

      {/* Mobile Drawer */}
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

              <nav className="flex flex-col px-3 py-3 flex-1 gap-0.5 overflow-y-auto">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-[13px] font-bold tracking-wider text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-150"
                >
                  Home
                </Link>

                {/* Shop with expandable sub-menu */}
                <div>
                  <button
                    onClick={() => setMobileShopOpen(!mobileShopOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-[13px] font-bold tracking-wider text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-150"
                  >
                    Shop
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200 ${mobileShopOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileShopOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden ml-4 border-l-2 border-[#004b9c]/20 pl-3"
                      >
                        <Link
                          href="/shop"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center py-2 px-2 text-[12.5px] font-bold text-[#004b9c] hover:bg-blue-50 rounded-lg"
                        >
                          View All Products
                        </Link>

                        {/* Categories */}
                        <button
                          onClick={() => setMobileCatOpen(!mobileCatOpen)}
                          className="flex items-center justify-between w-full py-2 px-2 text-[12.5px] text-gray-600 hover:text-[#004b9c] hover:bg-blue-50 rounded-lg font-semibold"
                        >
                          <span className="flex items-center gap-2">
                            <Layers size={13} className="text-[#004b9c]" />{" "}
                            Categories
                          </span>
                          <ChevronDown
                            size={12}
                            className={`transition-transform ${mobileCatOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {mobileCatOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden ml-4 border-l border-gray-200 pl-2"
                            >
                              {navCategories.map((cat) => {
                                const hasSubs =
                                  (cat.subCategories?.length ?? 0) > 0;
                                const isExpanded =
                                  mobileExpandedCat === cat._id;
                                return (
                                  <div key={cat._id}>
                                    <div className="flex items-center">
                                      <Link
                                        href={`/shop?category=${cat.slug}`}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex-1 flex items-center py-1.5 px-2 text-[12px] text-gray-600 hover:text-[#004b9c] hover:bg-blue-50 rounded-lg transition-colors"
                                      >
                                        {cat.name}
                                      </Link>
                                      {hasSubs && (
                                        <button
                                          onClick={() =>
                                            setMobileExpandedCat(
                                              isExpanded ? null : cat._id,
                                            )
                                          }
                                          className="p-1.5 text-gray-400 hover:text-[#004b9c]"
                                        >
                                          <ChevronRight
                                            size={12}
                                            className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                          />
                                        </button>
                                      )}
                                    </div>
                                    <AnimatePresence>
                                      {isExpanded && hasSubs && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{
                                            height: "auto",
                                            opacity: 1,
                                          }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="overflow-hidden ml-3 border-l border-gray-100 pl-2"
                                        >
                                          {cat.subCategories!.map((sc) => (
                                            <Link
                                              key={sc.slug}
                                              href={`/shop?category=${cat.slug}__${sc.slug}`}
                                              onClick={() =>
                                                setMobileOpen(false)
                                              }
                                              className="flex items-center gap-1.5 py-1.5 px-2 text-[11px] text-gray-500 hover:text-[#004b9c] hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                                              {sc.name}
                                            </Link>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Brands */}
                        <button
                          onClick={() => setMobileBrandOpen(!mobileBrandOpen)}
                          className="flex items-center justify-between w-full py-2 px-2 text-[12.5px] text-gray-600 hover:text-[#004b9c] hover:bg-blue-50 rounded-lg font-semibold"
                        >
                          <span className="flex items-center gap-2">
                            <Tag size={13} className="text-[#81bf42]" /> Brands
                          </span>
                          <ChevronDown
                            size={12}
                            className={`transition-transform ${mobileBrandOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {mobileBrandOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden ml-4 border-l border-gray-200 pl-2"
                            >
                              {navBrands.map((brand) => (
                                <Link
                                  key={brand._id}
                                  href={`/brand/${brand.slug}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center py-1.5 px-2 text-[12px] text-gray-600 hover:text-[#004b9c] hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  {brand.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/about"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-[13px] font-bold tracking-wider text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-150"
                >
                  About us
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-[13px] font-bold tracking-wider text-gray-700 hover:bg-blue-50 hover:text-[#004b9c] transition-colors duration-150"
                >
                  Contact us
                </Link>

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
                  </div>
                )}
              </nav>

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
                      onClick={() => router.push("/login")}
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
    </>
  );
}
