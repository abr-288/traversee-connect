import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Star, MapPin, Clock, Users } from "lucide-react";

const Tours = () => {
  const [priceRange, setPriceRange] = useState([0, 1000000]);

  const tours = [
    {
      id: 1,
      name: "Safari au Parc National de la Comoé",
      location: "Nord de la Côte d'Ivoire",
      price: 250000,
      duration: "3 jours / 2 nuits",
      rating: 4.9,
      reviews: 87,
      image: "/placeholder.svg",
      capacity: "2-8 personnes"
    },
    {
      id: 2,
      name: "Découverte d'Abidjan City Tour",
      location: "Abidjan",
      price: 35000,
      duration: "1 jour",
      rating: 4.6,
      reviews: 124,
      image: "/placeholder.svg",
      capacity: "1-15 personnes"
    },
    {
      id: 3,
      name: "Plages de Grand-Bassam",
      location: "Grand-Bassam",
      price: 45000,
      duration: "1 jour",
      rating: 4.7,
      reviews: 156,
      image: "/placeholder.svg",
      capacity: "2-12 personnes"
    },
    {
      id: 4,
      name: "Randonnée au Mont Nimba",
      location: "Région des Montagnes",
      price: 180000,
      duration: "2 jours / 1 nuit",
      rating: 4.8,
      reviews: 63,
      image: "/placeholder.svg",
      capacity: "2-10 personnes"
    },
    {
      id: 5,
      name: "Visite des Plantations de Cacao",
      location: "San Pedro",
      price: 75000,
      duration: "1 jour",
      rating: 4.5,
      reviews: 94,
      image: "/placeholder.svg",
      capacity: "2-20 personnes"
    },
    {
      id: 6,
      name: "Découverte de Man et ses cascades",
      location: "Man",
      price: 320000,
      duration: "4 jours / 3 nuits",
      rating: 4.9,
      reviews: 71,
      image: "/placeholder.svg",
      capacity: "2-8 personnes"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Circuits & Tours en Côte d'Ivoire</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Filtres</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Destination</label>
                  <Input placeholder="Rechercher une destination..." />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Durée</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="1day">1 jour</SelectItem>
                      <SelectItem value="2-3days">2-3 jours</SelectItem>
                      <SelectItem value="4plus">4+ jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Prix: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} FCFA
                  </label>
                  <Slider
                    min={0}
                    max={1000000}
                    step={10000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type d'activité</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Safari & Nature</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Culture & Histoire</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Plages & Détente</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Aventure</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full">Appliquer les filtres</Button>
              </div>
            </Card>
          </aside>

          {/* Liste des tours */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{tours.length} circuits trouvés</p>
              <Select defaultValue="popular">
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Plus populaires</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="rating">Mieux notés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {tours.map((tour) => (
                <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{tour.name}</h3>
                    
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{tour.location}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(tour.rating)
                                ? "fill-accent text-accent"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {tour.rating} ({tour.reviews} avis)
                      </span>
                    </div>

                    <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{tour.capacity}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">À partir de</p>
                        <p className="text-2xl font-bold text-primary">
                          {tour.price.toLocaleString()} <span className="text-sm">FCFA</span>
                        </p>
                      </div>
                      <Button>Réserver</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tours;
