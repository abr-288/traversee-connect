import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Star, Tag } from "lucide-react";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";
import { ActivitySearchForm } from "@/components/ActivitySearchForm";
import { Price } from "@/components/ui/price";

const Activities = () => {
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activities = [
    {
      id: 1,
      name: "Visite Guidée d'Abidjan",
      location: "Abidjan",
      image: "https://images.unsplash.com/photo-1583338505874-0cd6e2b57407",
      duration: "4 heures",
      groupSize: "2-15 personnes",
      category: "Culture",
      rating: 4.7,
      reviews: 234,
      price: 15000,
      description: "Découvrez les quartiers emblématiques d'Abidjan avec un guide local"
    },
    {
      id: 2,
      name: "Cours de Cuisine Ivoirienne",
      location: "Abidjan, Cocody",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d",
      duration: "3 heures",
      groupSize: "4-10 personnes",
      category: "Gastronomie",
      rating: 4.9,
      reviews: 156,
      price: 25000,
      description: "Apprenez à préparer des plats traditionnels ivoiriens"
    },
    {
      id: 3,
      name: "Sortie en Bateau Lagune Ébrié",
      location: "Lagune Ébrié",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
      duration: "2 heures",
      groupSize: "2-20 personnes",
      category: "Nature",
      rating: 4.6,
      reviews: 189,
      price: 20000,
      description: "Croisière relaxante sur la lagune avec vue sur la skyline"
    },
    {
      id: 4,
      name: "Randonnée Cascade de Man",
      location: "Man",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      duration: "6 heures",
      groupSize: "5-12 personnes",
      category: "Aventure",
      rating: 4.8,
      reviews: 98,
      price: 35000,
      description: "Trek à travers la forêt jusqu'aux cascades spectaculaires"
    },
    {
      id: 5,
      name: "Atelier Batik et Tissage",
      location: "Korhogo",
      image: "https://images.unsplash.com/photo-1522202757859-7472b0973c69",
      duration: "3 heures",
      groupSize: "3-8 personnes",
      category: "Artisanat",
      rating: 4.7,
      reviews: 67,
      price: 18000,
      description: "Initiez-vous aux techniques traditionnelles de tissage Sénoufo"
    },
    {
      id: 6,
      name: "Safari Photo Parc de la Comoé",
      location: "Parc de la Comoé",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801",
      duration: "8 heures",
      groupSize: "2-6 personnes",
      category: "Safari",
      rating: 4.9,
      reviews: 143,
      price: 85000,
      description: "Safari photo avec guide naturaliste dans la plus grande réserve"
    },
    {
      id: 7,
      name: "Dégustation Chocolat à Adzopé",
      location: "Adzopé",
      image: "https://images.unsplash.com/photo-1511381939415-e44015466834",
      duration: "4 heures",
      groupSize: "4-15 personnes",
      category: "Gastronomie",
      rating: 4.8,
      reviews: 112,
      price: 28000,
      description: "Visite de plantation et dégustation de chocolat ivoirien"
    },
    {
      id: 8,
      name: "Plongée Sous-Marine Assinie",
      location: "Assinie",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
      duration: "3 heures",
      groupSize: "2-8 personnes",
      category: "Sports nautiques",
      rating: 4.6,
      reviews: 87,
      price: 45000,
      description: "Exploration des fonds marins avec instructeur certifié"
    },
    {
      id: 9,
      name: "Concert Zouglou Live",
      location: "Abidjan, Marcory",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
      duration: "3 heures",
      groupSize: "Illimité",
      category: "Musique",
      rating: 4.7,
      reviews: 278,
      price: 12000,
      description: "Soirée musicale avec les meilleurs artistes Zouglou"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative py-32 bg-gradient-to-r from-primary/90 to-secondary/90 overflow-hidden">
        <img 
          src="/src/assets/destination-city.jpg" 
          alt="Activities" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">Activités & Expériences</h1>
            <p className="text-2xl md:text-3xl text-white/95 font-medium">Vivez des moments uniques avec nos activités sélectionnées</p>
          </div>
          <ActivitySearchForm />
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={activity.image} 
                  alt={activity.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {activity.category}
                </div>
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{activity.rating}</span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{activity.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    {activity.location}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-primary" />
                      {activity.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-primary" />
                      {activity.groupSize}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">À partir de</p>
                    <Price 
                      amount={activity.price} 
                      fromCurrency="XOF"
                      className="text-2xl font-bold text-primary"
                      showLoader={true}
                    />
                  </div>
                  <Button 
                    className="gradient-primary shadow-primary"
                    onClick={() => {
                      setSelectedActivity({
                        id: activity.id.toString(),
                        name: activity.name,
                        price_per_unit: activity.price,
                        currency: "FCFA",
                        type: "activity",
                        location: activity.location
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
      </main>

      {selectedActivity && (
        <BookingDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          service={selectedActivity}
        />
      )}

      <Footer />
    </div>
  );
};

export default Activities;
