import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Hotel, Car, Calendar, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickSearch = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("flights");

  const searchTypes = [
    { value: "flights", label: "Vols", icon: Plane, route: "/flights" },
    { value: "hotels", label: "Hôtels", icon: Hotel, route: "/hotels" },
    { value: "cars", label: "Voitures", icon: Car, route: "/cars" },
    { value: "events", label: "Événements", icon: Calendar, route: "/events" }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recherche Rapide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement ce que vous cherchez
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-xl border-0">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                {searchTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value} className="gap-2">
                    <type.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {searchTypes.map((type) => (
                <TabsContent key={type.value} value={type.value}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Départ</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="Ville de départ" className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Destination</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="Ville d'arrivée" className="pl-10" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Date de départ</label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Date de retour</label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Voyageurs</label>
                        <Input type="number" min="1" defaultValue="1" />
                      </div>
                    </div>

                    <Button
                      className="w-full gap-2 gradient-primary shadow-primary"
                      size="lg"
                      onClick={() => navigate(type.route)}
                    >
                      <Search className="w-4 h-4" />
                      Rechercher
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default QuickSearch;
