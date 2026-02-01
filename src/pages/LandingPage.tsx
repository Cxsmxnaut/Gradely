import { Navbar } from "@/app/components/Navbar";
import { Hero } from "@/app/components/Hero";
import { Features } from "@/app/components/Features";
import { HowItWorks } from "@/app/components/HowItWorks";
import { Footer } from "@/app/components/Footer";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar onGetStarted={() => window.location.href = '/login'} />
      <Hero onGetStarted={() => window.location.href = '/login'} />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}
