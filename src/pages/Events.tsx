import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EventSearchForm } from "@/components/EventSearchForm";
import { EventResults } from "@/components/EventResults";
import { Calendar } from "lucide-react";

const Events = () => {
  const [searchResults, setSearchResults] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Calendar className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Découvrez les événements
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trouvez les meilleurs événements et activités culturelles
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <EventSearchForm onResults={setSearchResults} />
            {searchResults && <EventResults events={searchResults.events} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
