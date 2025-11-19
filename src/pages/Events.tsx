import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventSearchForm } from "@/components/EventSearchForm";
import { EventResults } from "@/components/EventResults";
import { Calendar } from "lucide-react";

const Events = () => {
  const [searchResults, setSearchResults] = useState<any>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section with Background */}
        <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30" 
              alt="Événements" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-12">
            <div className="text-center mb-8 animate-fade-in">
              <div className="flex justify-center mb-4">
                <Calendar className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                Découvrez les événements
              </h1>
              <p className="text-lg md:text-xl text-white/95 drop-shadow-md max-w-2xl mx-auto">
                Trouvez les meilleurs événements et activités culturelles
              </p>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <EventSearchForm onResults={setSearchResults} />
            </div>
          </div>
        </div>

        {/* Results Section */}
        {searchResults && (
          <div className="container mx-auto px-4 py-12">
            <EventResults events={searchResults.events} />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Events;
