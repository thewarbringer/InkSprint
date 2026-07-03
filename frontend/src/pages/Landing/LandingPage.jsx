import AnimatedBackground from "../../components/common/AnimatedBackground.jsx";
import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";
import HeroSection from "./sections/HeroSection.jsx";
import StatsSection from "./sections/StatsSection.jsx";
import FeaturesSection from "./sections/FeaturesSection.jsx";
import HowItWorksSection from "./sections/HowItWorksSection.jsx";
import LeaderboardSection from "./sections/LeaderboardSection.jsx";
import TestimonialsSection from "./sections/TestimonialsSection.jsx";
import FAQSection from "./sections/FAQSection.jsx";
import CTASection from "./sections/CTASection.jsx";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AnimatedBackground />

      <div className="relative z-[3]">
        <Navbar />
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <LeaderboardSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
