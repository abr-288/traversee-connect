import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Star, Sparkles } from "lucide-react";

const Stays = () => {
  const stays = [
    {
      id: 1,
      name: "Safari au Parc de la Comoé",
      location: "Parc National de la Comoé",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801",
      duration: "3 jours / 2 nuits",
      type: "Safari & Nature",
      rating: 4.8,
      reviews: 124,
      price: 245000,
      highlights: ["Safari guidé", "Hébergement en lodge", "Repas inclus", "Guide francophone"]
    },
    {
      id: 2,
      name: "Séjour Balnéaire à Assinie",
      location: "Assinie-Mafia",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
      duration: "5 jours / 4 nuits",
      type: "Plage & Détente",
      rating: 4.9,
      reviews: 256,
      price: 320000,
      highlights: ["Resort 4 étoiles", "Plage privée", "Sports nautiques", "All inclusive"]
    },
    {
      id: 3,
      name: "Découverte de Man",
      location: "Man, Région des Montagnes",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      duration: "4 jours / 3 nuits",
      type: "Culture & Aventure",
      rating: 4.7,
      reviews: 89,
      price: 185000,
      highlights: ["Cascades", "Villages authentiques", "Randonnée", "Hébergement local"]
    },
    {
      id: 4,
      name: "Week-end à Grand-Bassam",
      location: "Grand-Bassam",
      image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21",
      duration: "2 jours / 1 nuit",
      type: "Patrimoine UNESCO",
      rating: 4.6,
      reviews: 178,
      price: 95000,
      highlights: ["Ville historique", "Plage", "Musée colonial", "Restaurants locaux"]
    },
    {
      id: 5,
      name: "Retraite Spirituelle à Yamoussoukro",
      location: "Yamoussoukro",
      image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24",
      duration: "3 jours / 2 nuits",
      type: "Culture & Spiritualité",
      rating: 4.5,
      reviews: 67,
      price: 125000,
      highlights: ["Basilique Notre-Dame", "Palais présidentiel", "Lac aux caïmans", "Guide culturel"]
    },
    {
      id: 6,
      name: "Aventure en Forêt à Taï",
      location: "Parc National de Taï",
      image: "https://images.unsplash.com/photo-1511497584788-876760111969",
      duration: "4 jours / 3 nuits",
      type: "Écotourisme",
      rating: 4.9,
      reviews: 45,
      price: 295000,
      highlights: ["Forêt primaire UNESCO", "Observation chimpanzés", "Trekking guidé", "Écotourisme"]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Séjours et Escapades</h1>
          <p className="text-muted-foreground text-lg">
            Découvrez nos forfaits séjours tout compris pour des vacances inoubliables
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stays.map((stay) => (
            <Card key={stay.id} className="overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={stay.image} 
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
                    <p className="text-2xl font-bold text-primary">
                      {stay.price.toLocaleString()} <span className="text-sm">FCFA</span>
                    </p>
                  </div>
                  <Button className="gradient-primary shadow-primary">
                    Réserver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Stays;
