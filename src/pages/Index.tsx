import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DestinationsSection from "@/components/DestinationsSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { AITravelAdvisor } from "@/components/AITravelAdvisor";
import { Boss } from "@/components/Boss";
import StatsSection from "@/components/StatsSection";
import FeaturedServices from "@/components/FeaturedServices";
import QuickSearch from "@/components/QuickSearch";
import SpecialOffers from "@/components/SpecialOffers";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <QuickSearch />
        <DestinationsSection />
        <FeaturedServices />
        <SpecialOffers />
        
        {/* AI Travel Advisor Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Planifiez votre voyage avec l'IA
              </h2>
              <p className="text-muted-foreground text-lg">
                Obtenez des recommandations personnalisées pour votre prochaine destination
              </p>
            </div>
            <AITravelAdvisor />
          </div>
        </section>
        
        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <Footer />
      <Boss />
    </div>
  );
};

export default Index;
