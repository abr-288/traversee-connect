import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Star, ArrowLeft, Clock, 
  Camera, Utensils, Mountain, Building2, Waves,
  ThermometerSun
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDestinations } from "@/hooks/useDestinations";
import { useWeather, WeatherData } from "@/hooks/useWeather";

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const { data: destinations } = useDestinations();
  const { getWeather } = useWeather();
  const destination = destinations?.find(d => d.id === id);

  useEffect(() => {
    if (destination?.name) {
      getWeather(destination.name).then(data => {
        if (data) setWeather(data);
      });
    }
  }, [destination?.name]);

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Destination non trouvée</h2>
          <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  // Generate additional images for gallery
  const galleryImages = [
    destination.image,
    `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80`,
    `https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80`,
    `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80`,
  ];

  // Generate activities based on destination category
  const activities = [
    { icon: Camera, name: "Visite guidée de la ville", duration: "3-4h", price: "25 000 FCFA", description: "Explorez les sites emblématiques avec un guide local expérimenté" },
    { icon: Utensils, name: "Découverte gastronomique", duration: "2-3h", price: "35 000 FCFA", description: "Dégustez les spécialités culinaires locales authentiques" },
    { icon: Mountain, name: "Randonnée & Nature", duration: "5-6h", price: "40 000 FCFA", description: "Parcourez les paysages naturels spectaculaires de la région" },
    { icon: Building2, name: "Patrimoine culturel", duration: "4-5h", price: "30 000 FCFA", description: "Visitez les monuments historiques et musées incontournables" },
    { icon: Waves, name: "Activités nautiques", duration: "2-3h", price: "45 000 FCFA", description: "Sports et loisirs aquatiques pour tous les niveaux" },
    { icon: ThermometerSun, name: "Expérience locale", duration: "Full day", price: "50 000 FCFA", description: "Immersion complète dans la culture et les traditions locales" },
  ];

  const availabilities = [
    { date: "Aujourd'hui", slots: 5, status: "available" },
    { date: "Demain", slots: 8, status: "available" },
    { date: new Date(Date.now() + 2 * 86400000).toLocaleDateString('fr-FR'), slots: 3, status: "limited" },
    { date: new Date(Date.now() + 3 * 86400000).toLocaleDateString('fr-FR'), slots: 0, status: "full" },
    { date: new Date(Date.now() + 4 * 86400000).toLocaleDateString('fr-FR'), slots: 12, status: "available" },
  ];

  const reviews = [
    {
      author: "Marie Dubois",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
      rating: 5,
      date: "Il y a 2 semaines",
      comment: "Destination absolument magnifique ! L'accueil était chaleureux et les paysages à couper le souffle."
    },
    {
      author: "Jean Martin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
      rating: 4,
      date: "Il y a 1 mois",
      comment: "Très belle expérience. Quelques points d'amélioration mais globalement très satisfait."
    },
    {
      author: "Sophie Laurent",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
      rating: 5,
      date: "Il y a 2 mois",
      comment: "Un voyage inoubliable ! Je recommande vivement cette destination."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-background border-b">
          <div className="container mx-auto px-4 py-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Image */}
            <div className="space-y-4">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={galleryImages[selectedImage]}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-4">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-24 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImage === idx ? "ring-4 ring-primary" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{destination.location}</span>
                </div>
                <h1 className="text-4xl font-bold mb-4">{destination.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-secondary text-secondary" />
                    <span className="font-semibold">{destination.rating}</span>
                    <span className="text-muted-foreground">({destination.reviews} avis)</span>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground">{destination.description}</p>
              </div>

              {/* Weather Widget */}
              {weather && (
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Météo actuelle</h3>
                        <div className="flex items-center gap-4">
                          <ThermometerSun className="w-8 h-8 text-orange-500" />
                          <div>
                            <p className="text-3xl font-bold">{weather.temperature}°C</p>
                            <p className="text-muted-foreground capitalize">{weather.condition}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Humidité: {weather.humidity}%</p>
                        <p className="text-sm text-muted-foreground">Vent: {weather.windSpeed} km/h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Booking Card */}
              <Card className="bg-gradient-card shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-primary">{destination.price}</span>
                      <span className="text-muted-foreground ml-2">FCFA / nuit</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full gradient-primary shadow-primary hover:shadow-xl transition-all"
                    onClick={() => {
                      const params = new URLSearchParams({
                        type: 'stay',
                        name: destination.name,
                        price: destination.price.replace(/\s/g, ''),
                        currency: 'FCFA',
                        location: destination.location,
                        serviceId: destination.id,
                      });
                      navigate(`/booking/stay?${params.toString()}`);
                    }}
                  >
                    Réserver maintenant
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Details Section */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold">À propos de cette destination</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {destination.description}
                  </p>
                  
                  {/* Category Badge */}
                  {destination.category && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-muted-foreground">Catégorie:</span>
                        <Badge variant="secondary" className="text-sm">
                          {destination.category}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {destination.amenities && destination.amenities.length > 0 && (
                    <div className="pt-4 border-t space-y-3">
                      <h4 className="font-semibold text-lg">Équipements et services</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {destination.amenities.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {destination.highlights && destination.highlights.length > 0 && (
                    <div className="pt-4 border-t space-y-3">
                      <h4 className="font-semibold text-lg">Points forts</h4>
                      <div className="space-y-2">
                        {destination.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Star className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Availability Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">Disponibilités</h3>
                  <div className="space-y-3">
                    {availabilities.map((avail, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm font-medium">{avail.date}</span>
                        <div className="flex items-center gap-2">
                          {avail.status === 'available' && (
                            <>
                              <span className="text-xs text-muted-foreground">{avail.slots} places</span>
                              <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                                Disponible
                              </Badge>
                            </>
                          )}
                          {avail.status === 'limited' && (
                            <>
                              <span className="text-xs text-muted-foreground">{avail.slots} places</span>
                              <Badge className="bg-orange-500/10 text-orange-700 hover:bg-orange-500/20">
                                Limité
                              </Badge>
                            </>
                          )}
                          {avail.status === 'full' && (
                            <Badge variant="destructive" className="opacity-60">
                              Complet
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-bold">Informations pratiques</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Check-in: 14h00 - Check-out: 11h00</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{destination.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span>Annulation gratuite jusqu'à 24h avant</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="activities" className="mt-12">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activities">Activités & Excursions</TabsTrigger>
              <TabsTrigger value="reviews">Avis Clients ({reviews.length})</TabsTrigger>
            </TabsList>

            {/* Activities Tab */}
            <TabsContent value="activities" className="mt-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Activités et excursions disponibles</h3>
                <p className="text-muted-foreground">
                  Profitez d'une large gamme d'activités pour enrichir votre séjour
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.map((activity, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-all hover-lift group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                          <activity.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{activity.name}</h3>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Durée: {activity.duration}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <p className="text-primary font-bold text-lg">{activity.price}</p>
                            <Button size="sm" variant="outline" className="hover:bg-primary/5">
                              Réserver
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              {/* Rating Summary */}
              <Card className="mb-6 bg-gradient-to-br from-secondary/5 to-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">{destination.rating}</div>
                      <div className="flex items-center gap-1 justify-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(destination.rating)
                                ? "fill-secondary text-secondary"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{destination.reviews} avis</p>
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const percentage = Math.random() * 100; // Simulé
                        return (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm font-medium w-12">{stars} ⭐</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-secondary rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Avis des voyageurs</h3>
                {reviews.map((review, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {review.author[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{review.author}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? "fill-secondary text-secondary"
                                          : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  Séjour vérifié
                                </Badge>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">{review.date}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm">
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                              👍 Utile (12)
                            </button>
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                              Répondre
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
