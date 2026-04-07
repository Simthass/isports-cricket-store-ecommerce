"use client";

import { useState } from "react";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import TrendingProducts from "@/components/home/TrendingProducts";
import Bannerssection from "@/components/home/Bannerssection";
import Newslettersection from "@/components/home/Newslettersection";
import NewArrivals from "@/components/home/NewArrivals";
import Featuredbrands from "@/components/home/Featuredbrands";
import Truststrip from "@/components/home/Truststrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Testimonialssection from "@/components/home/Testimonialssection";
import AuthModal from "@/components/auth/AuthModal";

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleAuthRequired = () => {
    setAuthMode("login");
    setAuthModalOpen(true);
  };

  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <Featuredbrands />
      <TrendingProducts />
      <Bannerssection />
      <Newslettersection />
      <NewArrivals />
      <Truststrip />
      <FeaturedProducts />
      <Testimonialssection />
    </main>
  );
}
