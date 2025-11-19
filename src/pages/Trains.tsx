import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrainSearchForm } from "@/components/TrainSearchForm";
import { TrainResults } from "@/components/TrainResults";
import { Train } from "lucide-react";
import { useTranslation } from "react-i18next";

const Trains = () => {
  const { t } = useTranslation();
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
              src="https://images.unsplash.com/photo-1474487548417-781cb71495f3" 
              alt="Train" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-12">
            <div className="text-center mb-8 animate-fade-in">
              <div className="flex justify-center mb-4">
                <Train className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                {t('nav.trains')}
              </h1>
              <p className="text-lg md:text-xl text-white/95 drop-shadow-md max-w-2xl mx-auto">
                Trouvez les meilleurs trajets en train pour vos voyages à travers le monde
              </p>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <TrainSearchForm onResults={setSearchResults} />
            </div>
          </div>
        </div>

        {/* Results Section */}
        {searchResults && (
          <div className="container mx-auto px-4 py-12">
            <TrainResults trains={searchResults.trains} />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Trains;
