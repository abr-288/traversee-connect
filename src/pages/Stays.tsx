import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Star, Sparkles, Loader2 } from "lucide-react";
import { WeatherWidget } from "@/components/WeatherWidget";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { StaySearchForm } from "@/components/StaySearchForm";
import { BookingDialog } from "@/components/BookingDialog";
import { useState, useEffect } from "react";
import { Price } from "@/components/ui/price";
import { useStaySearch } from "@/hooks/useStaySearch";
import { LazyImage } from "@/components/ui/lazy-image";

const Stays = () => {
  const [selectedStay, setSelectedStay] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { stays, loading, searchStays } = useStaySearch();
  
  useEffect(() => {
    searchStays();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative py-16 md:py-32 bg-gradient-to-r from-primary/90 to-secondary/90 overflow-hidden">
        <img 
          src="/src/assets/hero-beach.jpg" 
          alt="Stays" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">Séjours et Escapades</h1>
            <p className="text-2xl md:text-3xl text-white/95 font-medium">Découvrez nos forfaits séjours tout compris</p>
          </div>
          <StaySearchForm />
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">

        {/* Weather and Currency Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <WeatherWidget city="Abidjan" />
          <CurrencyConverter />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : stays.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Aucun séjour disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stays.map((stay) => (
            <Card key={stay.id} className="overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative h-48 overflow-hidden">
                <LazyImage 
                  src={stay.image_url || 'https://images.unsplash.com/photo-1516426122078-c23e76319801'} 
                  alt={stay.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {stay.type}
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">{stay.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    {stay.location}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      {stay.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {stay.rating} ({stay.reviews})
                    </span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold mb-2">Points forts :</p>
                  <ul className="grid grid-cols-2 gap-1 text-xs">
                    {stay.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-primary"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">À partir de</p>
                    <Price 
                      amount={stay.price_per_unit} 
                      fromCurrency={stay.currency}
                      className="text-2xl font-bold text-primary"
                      showLoader={true}
                    />
                  </div>
                  <Button 
                    className="gradient-primary shadow-primary"
                    onClick={() => {
                      setSelectedStay({
                        id: stay.id,
                        name: stay.name,
                        price_per_unit: stay.price_per_unit,
                        currency: stay.currency,
                        type: "stay",
                        location: stay.location
                      });
                      setDialogOpen(true);
                    }}
                  >
                    Réserver
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </main>

      {selectedStay && (
        <BookingDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          service={selectedStay}
        />
      )}

      <Footer />
    </div>
  );
};

export default Stays;
