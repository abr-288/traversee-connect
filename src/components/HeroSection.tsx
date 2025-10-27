import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hotel, Map, Car, Plane, Calendar as CalendarIcon, Users, Search, ArrowRightLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import heroImage from "@/assets/hero-beach.jpg";

const HeroSection = () => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [activeTab, setActiveTab] = useState("hotel");
  const [tripType, setTripType] = useState<"round-trip" | "one-way">("round-trip");

  return (
    <section className="relative min-h-[700px] flex items-center pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Beautiful beaches of Ivory Coast"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Explorez le Monde Ensemble !
          </h1>
          <p className="text-xl text-white/90 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Découvrez des hôtels magnifiques, des circuits uniques et des expériences inoubliables en Côte d'Ivoire
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-5xl mx-auto bg-background rounded-2xl shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-6 h-auto p-1 bg-muted">
              <TabsTrigger value="hotel" className="gap-2 py-3">
                <Hotel className="w-4 h-4" />
                <span className="hidden sm:inline">Hôtels</span>
              </TabsTrigger>
              <TabsTrigger value="flight" className="gap-2 py-3">
                <Plane className="w-4 h-4" />
                <span className="hidden sm:inline">Vols</span>
              </TabsTrigger>
              <TabsTrigger value="flight-hotel" className="gap-2 py-3">
                <Plane className="w-4 h-4" />
                <Hotel className="w-4 h-4" />
                <span className="hidden sm:inline">Vol+Hôtel</span>
              </TabsTrigger>
              <TabsTrigger value="tour" className="gap-2 py-3">
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Circuits</span>
              </TabsTrigger>
              <TabsTrigger value="car" className="gap-2 py-3">
                <Car className="w-4 h-4" />
                <span className="hidden sm:inline">Voitures</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hotel" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Destination</label>
                  <Input placeholder="Où allez-vous ?" className="h-12" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Check-in</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, "PPP", { locale: fr }) : "Date d'arrivée"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Check-out</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, "PPP", { locale: fr }) : "Date de départ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Voyageurs</label>
                  <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                    <Users className="mr-2 h-4 w-4" />
                    2 Adultes, 1 Chambre
                  </Button>
                </div>
              </div>

              <Button className="w-full md:w-auto px-8 h-12 gradient-primary shadow-primary text-lg gap-2">
                <Search className="w-5 h-5" />
                Rechercher
              </Button>
            </TabsContent>

            <TabsContent value="tour" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Destination</label>
                  <Input placeholder="Où souhaitez-vous aller ?" className="h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Choisir une date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Participants</label>
                  <Input placeholder="Nombre de personnes" type="number" className="h-12" />
                </div>
              </div>
              <Button className="w-full md:w-auto px-8 h-12 gradient-primary shadow-primary text-lg gap-2">
                <Search className="w-5 h-5" />
                Rechercher des circuits
              </Button>
            </TabsContent>

            <TabsContent value="car" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Lieu de prise en charge</label>
                  <Input placeholder="Ville ou aéroport" className="h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date de début</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Date de prise en charge
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date de fin</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Date de retour
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Button className="w-full md:w-auto px-8 h-12 gradient-primary shadow-primary text-lg gap-2">
                <Search className="w-5 h-5" />
                Rechercher des voitures
              </Button>
            </TabsContent>

            <TabsContent value="flight" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setTripType("round-trip")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
                    tripType === "round-trip"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Aller-retour
                </button>
                <button
                  onClick={() => setTripType("one-way")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
                    tripType === "one-way"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  Aller simple
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Départ</label>
                  <Input placeholder="Ville de départ" className="h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Arrivée</label>
                  <Input placeholder="Destination" className="h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date de départ</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
                {tripType === "round-trip" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Date de retour</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Passagers</label>
                  <Input placeholder="Nombre de passagers" type="number" className="h-12" />
                </div>
              </div>
              <Button className="w-full md:w-auto px-8 h-12 gradient-primary shadow-primary text-lg gap-2">
                <Search className="w-5 h-5" />
                Rechercher des vols
              </Button>
            </TabsContent>

            <TabsContent value="flight-hotel" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setTripType("round-trip")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
                    tripType === "round-trip"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Aller-retour
                </button>
                <button
                  onClick={() => setTripType("one-way")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
                    tripType === "one-way"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  Aller simple
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Départ</label>
                  <Input placeholder="Ville de départ" className="h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Destination</label>
                  <Input placeholder="Où allez-vous ?" className="h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date de départ</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" />
                    </PopoverContent>
                  </Popover>
                </div>
                {tripType === "round-trip" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Date de retour</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Passagers & Chambres</label>
                  <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                    <Users className="mr-2 h-4 w-4" />
                    2 Adultes, 1 Chambre
                  </Button>
                </div>
              </div>
              <Button className="w-full md:w-auto px-8 h-12 gradient-primary shadow-primary text-lg gap-2">
                <Search className="w-5 h-5" />
                Rechercher Vol + Hôtel
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
