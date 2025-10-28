import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hotel, Map, Car, Plane, Calendar as CalendarIcon, Search, ArrowRightLeft, ArrowRight, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";
import heroSlide5 from "@/assets/hero-slide-5.jpg";
import { TravelersSelector } from "./TravelersSelector";
import { CityAutocomplete } from "./CityAutocomplete";
import { MultiCityFlightForm } from "./MultiCityFlightForm";

const HERO_SLIDES = [heroSlide1, heroSlide2, heroSlide3, heroSlide4, heroSlide5];

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [activeTab, setActiveTab] = useState("hotel");
  const [tripType, setTripType] = useState<"round-trip" | "one-way" | "multi-city">("round-trip");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Hotel state
  const [hotelDestination, setHotelDestination] = useState("");
  const [hotelAdults, setHotelAdults] = useState(2);
  const [hotelChildren, setHotelChildren] = useState(0);
  const [hotelRooms, setHotelRooms] = useState(1);

  // Flight state
  const [flightFrom, setFlightFrom] = useState("");
  const [flightTo, setFlightTo] = useState("");
  const [flightDate, setFlightDate] = useState<Date>();
  const [flightReturnDate, setFlightReturnDate] = useState<Date>();
  const [flightAdults, setFlightAdults] = useState(1);
  const [flightChildren, setFlightChildren] = useState(0);

  // Tour state
  const [tourDestination, setTourDestination] = useState("");
  const [tourDate, setTourDate] = useState<Date>();
  const [tourAdults, setTourAdults] = useState(2);
  const [tourChildren, setTourChildren] = useState(0);

  // Car state
  const [carLocation, setCarLocation] = useState("");
  const [carPickupDate, setCarPickupDate] = useState<Date>();
  const [carReturnDate, setCarReturnDate] = useState<Date>();

  const handleHotelSearch = () => {
    const params = new URLSearchParams();
    if (hotelDestination) params.set("destination", hotelDestination);
    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    params.set("adults", hotelAdults.toString());
    params.set("children", hotelChildren.toString());
    params.set("rooms", hotelRooms.toString());
    navigate(`/hotels?${params.toString()}`);
  };

  const handleFlightSearch = () => {
    const params = new URLSearchParams();
    if (flightFrom) params.set("from", flightFrom);
    if (flightTo) params.set("to", flightTo);
    if (flightDate) params.set("date", format(flightDate, "yyyy-MM-dd"));
    if (tripType === "round-trip" && flightReturnDate) {
      params.set("returnDate", format(flightReturnDate, "yyyy-MM-dd"));
    }
    params.set("adults", flightAdults.toString());
    params.set("children", flightChildren.toString());
    params.set("tripType", tripType);
    navigate(`/flights?${params.toString()}`);
  };

  const handleTourSearch = () => {
    const params = new URLSearchParams();
    if (tourDestination) params.set("destination", tourDestination);
    if (tourDate) params.set("date", format(tourDate, "yyyy-MM-dd"));
    params.set("adults", tourAdults.toString());
    params.set("children", tourChildren.toString());
    navigate(`/tours?${params.toString()}`);
  };

  const handleCarSearch = () => {
    const params = new URLSearchParams();
    if (carLocation) params.set("location", carLocation);
    if (carPickupDate) params.set("pickupDate", format(carPickupDate, "yyyy-MM-dd"));
    if (carReturnDate) params.set("returnDate", format(carReturnDate, "yyyy-MM-dd"));
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[700px] flex items-center pt-20">
      {/* Background Image Carousel with Overlay */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide}
              alt={`Travel destination ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
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
                  <Input 
                    placeholder="Où allez-vous ?" 
                    className="h-12"
                    value={hotelDestination}
                    onChange={(e) => setHotelDestination(e.target.value)}
                  />
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
                  <TravelersSelector
                    adults={hotelAdults}
                    children={hotelChildren}
                    rooms={hotelRooms}
                    onAdultsChange={setHotelAdults}
                    onChildrenChange={setHotelChildren}
                    onRoomsChange={setHotelRooms}
                    showRooms
                  />
                </div>
              </div>

              <Button 
                onClick={handleHotelSearch}
                className="w-full md:w-auto px-8 h-12 gradient-primary shadow-primary text-lg gap-2"
              >
                <Search className="w-5 h-5" />
                Rechercher
              </Button>
            </TabsContent>

            <TabsContent value="tour" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Destination</label>
                  <Input 
                    placeholder="Où souhaitez-vous aller ?" 
                    className="h-12"
                    value={tourDestination}
                    onChange={(e) => setTourDestination(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tourDate ? format(tourDate, "PPP", { locale: fr }) : "Choisir une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={tourDate} onSelect={setTourDate} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Participants</label>
                  <TravelersSelector
                    adults={tourAdults}
                    children={tourChildren}
                    onAdultsChange={setTourAdults}
                    onChildrenChange={setTourChildren}
                  />
                </div>
              </div>
              <Button 
                onClick={handleTourSearch}
                className="w-full md:w-auto px-8 h-12 gradient-primary shadow-primary text-lg gap-2"
              >
                <Search className="w-5 h-5" />
                Rechercher des circuits
              </Button>
            </TabsContent>

            <TabsContent value="car" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Lieu de prise en charge</label>
                  <Input 
                    placeholder="Ville ou aéroport" 
                    className="h-12"
                    value={carLocation}
                    onChange={(e) => setCarLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date de début</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {carPickupDate ? format(carPickupDate, "PPP", { locale: fr }) : "Date de prise en charge"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={carPickupDate} onSelect={setCarPickupDate} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date de fin</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {carReturnDate ? format(carReturnDate, "PPP", { locale: fr }) : "Date de retour"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={carReturnDate} onSelect={setCarReturnDate} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Button 
                onClick={handleCarSearch}
                className="w-full md:w-auto px-8 h-12 gradient-primary shadow-primary text-lg gap-2"
              >
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
                <button
                  onClick={() => setTripType("multi-city")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
                    tripType === "multi-city"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Multi-destinations
                </button>
              </div>
              
              {tripType === "multi-city" ? (
                <MultiCityFlightForm onSearch={(legs) => {
                  const params = new URLSearchParams();
                  params.set("tripType", "multi-city");
                  params.set("legs", JSON.stringify(legs));
                  params.set("adults", flightAdults.toString());
                  params.set("children", flightChildren.toString());
                  navigate(`/flights?${params.toString()}`);
                }} />
              ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Départ</label>
                  <CityAutocomplete
                    placeholder="Ville de départ"
                    value={flightFrom}
                    onChange={setFlightFrom}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Arrivée</label>
                  <CityAutocomplete
                    placeholder="Destination"
                    value={flightTo}
                    onChange={setFlightTo}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date de départ</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {flightDate ? format(flightDate, "PPP", { locale: fr }) : "Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={flightDate} onSelect={setFlightDate} />
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
                          {flightReturnDate ? format(flightReturnDate, "PPP", { locale: fr }) : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={flightReturnDate} onSelect={setFlightReturnDate} />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Passagers</label>
                  <TravelersSelector
                    adults={flightAdults}
                    children={flightChildren}
                    onAdultsChange={setFlightAdults}
                    onChildrenChange={setFlightChildren}
                  />
                </div>
              </div>
              <Button 
                onClick={handleFlightSearch}
                className="w-full md:w-auto px-8 h-12 gradient-primary shadow-primary text-lg gap-2"
              >
                <Search className="w-5 h-5" />
                Rechercher des vols
              </Button>
              </>
              )}
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
                  <CityAutocomplete
                    placeholder="Ville de départ"
                    value={flightFrom}
                    onChange={setFlightFrom}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Destination</label>
                  <Input 
                    placeholder="Où allez-vous ?" 
                    className="h-12"
                    value={hotelDestination}
                    onChange={(e) => setHotelDestination(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date de départ</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {flightDate ? format(flightDate, "PPP", { locale: fr }) : "Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={flightDate} onSelect={setFlightDate} />
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
                          {flightReturnDate ? format(flightReturnDate, "PPP", { locale: fr }) : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={flightReturnDate} onSelect={setFlightReturnDate} />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Passagers & Chambres</label>
                  <TravelersSelector
                    adults={hotelAdults}
                    children={hotelChildren}
                    rooms={hotelRooms}
                    onAdultsChange={setHotelAdults}
                    onChildrenChange={setHotelChildren}
                    onRoomsChange={setHotelRooms}
                    showRooms
                  />
                </div>
              </div>
              <Button 
                onClick={() => {
                  handleFlightSearch();
                  handleHotelSearch();
                }}
                className="w-full md:w-auto px-8 h-12 gradient-primary shadow-primary text-lg gap-2"
              >
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
