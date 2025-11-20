import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, Star, ArrowLeft, Clock, 
  Camera, Utensils, Mountain, Building2, Waves,
  ThermometerSun
} from "lucide-react";
import { useState, useEffect } from "react";
import { BookingDialog } from "@/components/BookingDialog";
import { useDestinations } from "@/hooks/useDestinations";
import { useWeather, WeatherData } from "@/hooks/useWeather";

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const activities = [
    { icon: Camera, name: "Visite guidée", duration: "3-4h", price: "25 000 FCFA" },
    { icon: Utensils, name: "Gastronomie locale", duration: "2-3h", price: "35 000 FCFA" },
    { icon: Mountain, name: "Randonnée", duration: "5-6h", price: "40 000 FCFA" },
    { icon: Building2, name: "Monuments historiques", duration: "4-5h", price: "30 000 FCFA" },
    { icon: Waves, name: "Activités nautiques", duration: "2-3h", price: "45 000 FCFA" },
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
    <>
      {dialogOpen && (
        <BookingDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          service={{
            id: destination.id,
            name: destination.name,
            price_per_unit: parseInt(destination.price.replace(/\s/g, '')),
            currency: "FCFA",
            type: "stay"
          } as any}
        />
      )}

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
                    className="w-full gradient-primary shadow-primary"
                    size="lg"
                    onClick={() => setDialogOpen(true)}
                  >
                    Réserver maintenant
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="activities" className="mt-12">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activities">Activités</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
            </TabsList>

            {/* Activities Tab */}
            <TabsContent value="activities" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-all hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <activity.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{activity.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Clock className="w-4 h-4" />
                            <span>{activity.duration}</span>
                          </div>
                          <p className="text-primary font-semibold">{activity.price}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {reviews.map((review, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>{review.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{review.author}</h4>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-3">
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
                          <p className="text-muted-foreground">{review.comment}</p>
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
    </>
  );
};

export default DestinationDetail;
