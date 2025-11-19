import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FlightSearchForm } from "@/components/FlightSearchForm";

const Flights = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section with Background */}
        <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05" 
              alt="Vol" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-12">
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                Rechercher des vols
              </h1>
              <p className="text-lg md:text-xl text-white/95 drop-shadow-md max-w-2xl mx-auto">
                Comparez et réservez les meilleurs vols aux meilleurs prix
              </p>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <FlightSearchForm />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Flights;
