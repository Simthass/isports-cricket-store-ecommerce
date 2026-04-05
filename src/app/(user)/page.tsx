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

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CategoriesSection />
      <TrendingProducts />
      <Bannerssection />
      <Newslettersection />
      <NewArrivals />
      <Featuredbrands />
      <Truststrip />
      <FeaturedProducts />
      <Testimonialssection />
    </main>
  );
}
