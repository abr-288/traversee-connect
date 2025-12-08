import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Star, Sparkles, Loader2, Palmtree, Wifi, Coffee, Car, Waves, Shield, Clock, Heart, Users, CheckCircle } from "lucide-react";
import { WeatherWidget } from "@/components/WeatherWidget";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { StaySearchForm } from "@/components/StaySearchForm";
import { BookingDialog } from "@/components/BookingDialog";
import { useState, useEffect } from "react";
import { Price } from "@/components/ui/price";
import { useStaySearch } from "@/hooks/useStaySearch";
import { LazyImage } from "@/components/ui/lazy-image";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import bannerStays from "@/assets/banner-stays.jpg";

// Types de séjours
const stayTypes = [
  { id: "villa", name: "Villas", icon: Palmtree, color: "bg-green-500" },
  { id: "apartment", name: "Appartements", icon: Coffee, color: "bg-blue-500" },
  { id: "beach", name: "Bord de mer", icon: Waves, color: "bg-cyan-500" },
  { id: "luxury", name: "Luxe", icon: Star, color: "bg-amber-500" },
];

// Features des séjours
const stayFeatures = [
  { icon: Shield, title: "Réservation sécurisée", description: "Paiement 100% sécurisé" },
  { icon: Clock, title: "Annulation gratuite", description: "Jusqu'à 48h avant" },
  { icon: Users, title: "Support 24/7", description: "À votre écoute" },
  { icon: CheckCircle, title: "Qualité vérifiée", description: "Tous nos hébergements sont inspectés" },
];

const Stays = () => {
  const { t } = useTranslation();
  const [selectedStay, setSelectedStay] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { stays, loading, searchStays } = useStaySearch();
  
  useEffect(() => {
    searchStays();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredStays = selectedType
    ? stays.filter(stay => stay.type?.toLowerCase().includes(selectedType))
    : stays;

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
        <LazyImage 
          src={bannerStays}
          alt="Séjours et Escapades" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
        <div className="relative z-10 container mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <Palmtree className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {t("stays.title", "Séjours et Escapades")}
            </h1>
            <p className="text-lg md:text-xl text-white/95 drop-shadow-md max-w-2xl mx-auto">
              {t("stays.subtitle", "Découvrez nos forfaits séjours tout compris")}
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StaySearchForm />
          </motion.div>
        </div>
      </div>

      {/* Types de séjours */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {t("stays.types", "Types de séjours")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stayTypes.map((type) => (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                  selectedType === type.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className={`${type.color} p-4 rounded-full mb-4`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold">{type.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <main className="flex-1 container mx-auto px-4 py-8">

        {/* Weather and Currency Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <WeatherWidget city="Abidjan" />
          <CurrencyConverter />
        </div>

        {/* Titre section résultats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {selectedType 
                ? `${stayTypes.find(t => t.id === selectedType)?.name || 'Séjours'}`
                : t("stays.available", "Séjours disponibles")}
            </h2>
            <p className="text-muted-foreground">
              {filteredStays.length} {t("stays.found", "hébergements trouvés")}
            </p>
          </div>
          {selectedType && (
            <Button variant="outline" onClick={() => setSelectedType(null)}>
              Voir tout
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredStays.length === 0 ? (
          <div className="text-center py-20">
            <Palmtree className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              {t("stays.noResults", "Aucun séjour disponible")}
            </p>
            <Button className="mt-4" onClick={() => setSelectedType(null)}>
              Voir tous les séjours
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStays.map((stay, index) => (
              <motion.div
                key={stay.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all group h-full">
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
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`absolute top-4 right-4 bg-white/80 hover:bg-white ${
                        favorites.includes(stay.id) ? 'text-red-500' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(stay.id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(stay.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2 line-clamp-1">{stay.name}</h3>
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

                    {/* Amenities icons */}
                    <div className="flex gap-3 mb-4">
                      <Badge variant="outline" className="text-xs">
                        <Wifi className="w-3 h-3 mr-1" /> WiFi
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Coffee className="w-3 h-3 mr-1" /> Petit-déj
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Car className="w-3 h-3 mr-1" /> Parking
                      </Badge>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold mb-2">{t("stays.highlights", "Points forts")} :</p>
                      <ul className="grid grid-cols-2 gap-1 text-xs">
                        {stay.highlights?.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-primary"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("common.from", "À partir de")}</p>
                        <Price 
                          amount={stay.price_per_unit} 
                          fromCurrency={stay.currency}
                          className="text-2xl font-bold text-primary"
                          showLoader={true}
                        />
                      </div>
                      <Button 
                        className="bg-primary text-primary-foreground font-semibold"
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
                        {t("common.book", "Réserver")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Features Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {t("stays.whyUs", "Pourquoi réserver avec nous ?")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stayFeatures.map((feature, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="pt-4">
                  <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
