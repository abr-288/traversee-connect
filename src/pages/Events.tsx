import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar } from "lucide-react";

const Events = () => {
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

          <div className="bg-card rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <p className="text-center text-muted-foreground">
              Service de réservation d'événements disponible prochainement
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
