import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Star, TrendingUp, Calendar, Users, Plane, Heart } from "lucide-react";

const Destinations = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const popularDestinations = [
    {
      city: "Paris",
      country: "France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      description: "La ville lumière, capitale de la mode et de la gastronomie",
      price: "À partir de 450 000 XOF",
      rating: 4.8,
      trending: true,
      tags: ["Culture", "Gastronomie", "Shopping"],
    },
    {
      city: "Dubaï",
      country: "Émirats Arabes Unis",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
      description: "Luxe et modernité dans le désert",
      price: "À partir de 550 000 XOF",
      rating: 4.9,
      trending: true,
      tags: ["Luxe", "Shopping", "Plage"],
    },
    {
      city: "Marrakech",
      country: "Maroc",
      image: "https://images.unsplash.com/photo-1558969697-1bbde4489068?w=800",
      description: "La perle rouge du Maroc",
      price: "À partir de 280 000 XOF",
      rating: 4.7,
      trending: false,
      tags: ["Culture", "Aventure", "Gastronomie"],
    },
    {
      city: "New York",
      country: "États-Unis",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
      description: "La ville qui ne dort jamais",
      price: "À partir de 680 000 XOF",
      rating: 4.8,
      trending: true,
      tags: ["Culture", "Shopping", "Vie Nocturne"],
    },
    {
      city: "Istanbul",
      country: "Turquie",
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
      description: "Entre l'Orient et l'Occident",
      price: "À partir de 320 000 XOF",
      rating: 4.6,
      trending: false,
      tags: ["Culture", "Histoire", "Gastronomie"],
    },
    {
      city: "Bali",
      country: "Indonésie",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
      description: "Paradis tropical et spiritualité",
      price: "À partir de 590 000 XOF",
      rating: 4.9,
      trending: true,
      tags: ["Plage", "Nature", "Détente"],
    },
    {
      city: "Le Caire",
      country: "Égypte",
      image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800",
      description: "L'histoire millénaire des pharaons",
      price: "À partir de 350 000 XOF",
      rating: 4.5,
      trending: false,
      tags: ["Histoire", "Culture", "Aventure"],
    },
    {
      city: "Rome",
      country: "Italie",
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
      description: "La ville éternelle",
      price: "À partir de 420 000 XOF",
      rating: 4.8,
      trending: false,
      tags: ["Histoire", "Culture", "Gastronomie"],
    },
  ];

  const africanDestinations = [
    {
      city: "Dakar",
      country: "Sénégal",
      image: "https://images.unsplash.com/photo-1578730647099-46d97c00d33d?w=800",
      description: "Vibrant carrefour culturel d'Afrique de l'Ouest",
      price: "À partir de 150 000 XOF",
      rating: 4.5,
      tags: ["Culture", "Plage", "Musique"],
    },
    {
      city: "Zanzibar",
      country: "Tanzanie",
      image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800",
      description: "Îles aux épices et plages paradisiaques",
      price: "À partir de 480 000 XOF",
      rating: 4.9,
      tags: ["Plage", "Nature", "Détente"],
    },
    {
      city: "Le Cap",
      country: "Afrique du Sud",
      image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800",
      description: "Entre montagne et océan",
      price: "À partir de 520 000 XOF",
      rating: 4.8,
      tags: ["Nature", "Vin", "Aventure"],
    },
    {
      city: "Essaouira",
      country: "Maroc",
      image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800",
      description: "Ville côtière au charme authentique",
      price: "À partir de 250 000 XOF",
      rating: 4.6,
      tags: ["Plage", "Culture", "Sports"],
    },
  ];

  const filteredDestinations = searchQuery
    ? popularDestinations.filter(
        (dest) =>
          dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : popularDestinations;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-br from-primary via-primary-dark to-primary-darker overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Explorez le Monde
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Découvrez des destinations incroyables et créez des souvenirs inoubliables
          </p>

          <div className="w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher une destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="popular" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="popular">
                <Star className="mr-2 h-4 w-4" />
                Populaires
              </TabsTrigger>
              <TabsTrigger value="africa">
                <MapPin className="mr-2 h-4 w-4" />
                Afrique
              </TabsTrigger>
              <TabsTrigger value="trending">
                <TrendingUp className="mr-2 h-4 w-4" />
                Tendances
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popular">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredDestinations.map((dest, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={dest.image}
                        alt={dest.city}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {dest.trending && (
                        <Badge className="absolute top-4 right-4 bg-secondary">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Tendance
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-4 left-4 bg-white/80 hover:bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">{dest.city}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{dest.rating}</span>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {dest.country}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {dest.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {dest.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          {dest.price}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/flights?to=${dest.city}`)}
                        >
                          <Plane className="mr-2 h-4 w-4" />
                          Voir les vols
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="africa">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {africanDestinations.map((dest, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={dest.image}
                        alt={dest.city}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-4 left-4 bg-white/80 hover:bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">{dest.city}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{dest.rating}</span>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {dest.country}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {dest.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {dest.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          {dest.price}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/flights?to=${dest.city}`)}
                        >
                          <Plane className="mr-2 h-4 w-4" />
                          Voir les vols
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trending">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularDestinations
                  .filter((dest) => dest.trending)
                  .map((dest, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={dest.image}
                          alt={dest.city}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Badge className="absolute top-4 right-4 bg-secondary">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Tendance
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-4 left-4 bg-white/80 hover:bg-white"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-xl">{dest.city}</CardTitle>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{dest.rating}</span>
                          </div>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {dest.country}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {dest.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {dest.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-primary">
                            {dest.price}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/flights?to=${dest.city}`)}
                          >
                            <Plane className="mr-2 h-4 w-4" />
                            Voir les vols
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Destinations;
