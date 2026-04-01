import HeroBanner from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import TrendingProducts from "@/components/home/TrendingProducts";

export default function HomePage() {
  return (
    <main>
      <HeroBanner />
      <CategoriesSection />
      <TrendingProducts />
    </main>
  );
}
