import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Hotel, Car, Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UnifiedForm, UnifiedFormField, UnifiedSubmitButton } from "@/components/forms";

const QuickSearch = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("flights");

  const searchTypes = [
    { value: "flights", label: "Vols", icon: Plane, route: "/flights" },
    { value: "hotels", label: "Hôtels", icon: Hotel, route: "/hotels" },
    { value: "cars", label: "Voitures", icon: Car, route: "/cars" },
    { value: "events", label: "Événements", icon: Calendar, route: "/events" }
  ];

  const handleSearch = (route: string) => (e: React.FormEvent) => {
    e.preventDefault();
    navigate(route);
  };

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
                  <UnifiedForm onSubmit={handleSearch(type.route)} variant="search">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <UnifiedFormField
                          label="Départ"
                          name="departure"
                          placeholder="Ville de départ"
                          icon={MapPin}
                        />
                        <UnifiedFormField
                          label="Destination"
                          name="destination"
                          placeholder="Ville d'arrivée"
                          icon={MapPin}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <UnifiedFormField
                          label="Date de départ"
                          name="departureDate"
                          type="date"
                        />
                        <UnifiedFormField
                          label="Date de retour"
                          name="returnDate"
                          type="date"
                        />
                        <UnifiedFormField
                          label="Voyageurs"
                          name="travelers"
                          type="number"
                          defaultValue="1"
                          min={1}
                        />
                      </div>

                      <UnifiedSubmitButton fullWidth>
                        Rechercher
                      </UnifiedSubmitButton>
                    </div>
                  </UnifiedForm>
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
