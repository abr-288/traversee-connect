import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FlightSearchForm } from "@/components/FlightSearchForm";

const Flights = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Rechercher des vols
            </h1>
            <p className="text-lg text-muted-foreground">
              Comparez et réservez les meilleurs vols aux meilleurs prix
            </p>
          </div>
          
          <FlightSearchForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Flights;
