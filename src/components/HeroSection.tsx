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
  const [activeTab, setActiveTab] = useState("flight");
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

  const handleCarSearch = () => {
    const params = new URLSearchParams();
    if (carLocation) params.set("location", carLocation);
    if (carPickupDate) params.set("pickupDate", format(carPickupDate, "yyyy-MM-dd"));
    if (carReturnDate) params.set("returnDate", format(carReturnDate, "yyyy-MM-dd"));
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[850px] flex items-center pt-16 md:pt-20">
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
      <div className="container relative z-10 mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-14">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-3 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Voyagez partout, réservez en un clic
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-white/95 mb-6 md:mb-10 font-normal animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Trouvez les meilleures offres pour vos vols, hôtels, trains et bien plus encore
          </p>
        </div>

        {/* Search Card - Opodo Style */}
        <div className="max-w-6xl mx-auto bg-background rounded-lg md:rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-auto p-0 bg-background border-b flex justify-start overflow-x-auto rounded-none gap-0">
              <TabsTrigger value="flight" className="gap-1.5 md:gap-2 py-3 md:py-4 px-3 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0">
                <Plane className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-base">Vols</span>
              </TabsTrigger>
              <TabsTrigger value="hotel" className="gap-1.5 md:gap-2 py-3 md:py-4 px-3 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0">
                <Hotel className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-base">Hôtels</span>
              </TabsTrigger>
              <TabsTrigger value="flight-hotel" className="gap-1.5 md:gap-2 py-3 md:py-4 px-3 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0">
                <Plane className="w-3 h-3 md:w-4 md:h-4" />
                <Hotel className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-base">Vol+Hôtel</span>
              </TabsTrigger>
              <TabsTrigger value="car" className="gap-1.5 md:gap-2 py-3 md:py-4 px-3 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0">
                <Car className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-base">Voitures</span>
              </TabsTrigger>
            </TabsList>

            {/* Flight Tab */}
            <TabsContent value="flight" className="p-4 md:p-6">
              <div className="mb-4 flex flex-wrap gap-2 md:gap-3">
                <button
                  onClick={() => setTripType("round-trip")}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition-smooth ${
                    tripType === "round-trip"
                      ? "bg-secondary text-primary font-medium"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span className="hidden sm:inline">Aller-retour</span>
                  <span className="sm:hidden">A-R</span>
                </button>
                <button
                  onClick={() => setTripType("one-way")}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition-smooth ${
                    tripType === "one-way"
                      ? "bg-secondary text-primary font-medium"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ArrowRight className="w-3 h-3" />
                  <span className="hidden sm:inline">Aller simple</span>
                  <span className="sm:hidden">A-S</span>
                </button>
                <button
                  onClick={() => setTripType("multi-city")}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm transition-smooth ${
                    tripType === "multi-city"
                      ? "bg-secondary text-primary font-medium"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span className="hidden sm:inline">Multi-destinations</span>
                  <span className="sm:hidden">Multi</span>
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
              <div className="flex flex-col lg:flex-row lg:items-end gap-0 lg:gap-0 bg-background rounded-lg overflow-hidden">
                <div className="flex-1 p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Départ de</label>
                  <CityAutocomplete
                    placeholder="Ville ou aéroport"
                    value={flightFrom}
                    onChange={setFlightFrom}
                    className="h-10 border-0 px-0 focus-visible:ring-0"
                  />
                </div>
                
                <div className="flex-1 p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Arrivée à</label>
                  <CityAutocomplete
                    placeholder="Ville ou aéroport"
                    value={flightTo}
                    onChange={setFlightTo}
                    className="h-10 border-0 px-0 focus-visible:ring-0"
                  />
                </div>

                <div className="flex-1 p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Date de départ</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {flightDate ? format(flightDate, "dd/MM/yyyy") : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                      <Calendar mode="single" selected={flightDate} onSelect={setFlightDate} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                {tripType === "round-trip" && (
                  <div className="flex-1 p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-border">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Date de retour</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {flightReturnDate ? format(flightReturnDate, "dd/MM/yyyy") : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                        <Calendar mode="single" selected={flightReturnDate} onSelect={setFlightReturnDate} initialFocus className="pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <div className="flex-1 p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Passagers</label>
                  <TravelersSelector
                    adults={flightAdults}
                    children={flightChildren}
                    onAdultsChange={setFlightAdults}
                    onChildrenChange={setFlightChildren}
                  />
                </div>

                <Button 
                  onClick={handleFlightSearch}
                  className="lg:w-auto w-full h-12 md:h-14 lg:h-16 px-6 md:px-8 bg-secondary text-primary hover:bg-secondary/90 text-sm md:text-base font-semibold gap-2 rounded-none lg:rounded-r-lg"
                >
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                  Rechercher
                </Button>
              </div>
              )}
            </TabsContent>

            {/* Hotel Tab */}
            <TabsContent value="hotel" className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-0 lg:gap-0 bg-background rounded-lg overflow-hidden">
                <div className="flex-1 p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Destination</label>
                  <Input 
                    placeholder="Où allez-vous ?" 
                    className="h-10 border-0 px-0 focus-visible:ring-0 text-base"
                    value={hotelDestination}
                    onChange={(e) => setHotelDestination(e.target.value)}
                  />
                </div>
                
                <div className="flex-1 p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-in</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, "dd/MM/yyyy") : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                      <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Check-out</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, "dd/MM/yyyy") : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                      <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Voyageurs</label>
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

                <Button 
                  onClick={handleHotelSearch}
                  className="lg:w-auto w-full h-12 md:h-14 lg:h-16 px-6 md:px-8 bg-secondary text-primary hover:bg-secondary/90 text-sm md:text-base font-semibold gap-2 rounded-none lg:rounded-r-lg"
                >
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                  Rechercher
                </Button>
              </div>
            </TabsContent>

            {/* Flight + Hotel Tab */}
            <TabsContent value="flight-hotel" className="p-6">
              <div className="mb-4 flex gap-3">
                <button
                  onClick={() => setTripType("round-trip")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-smooth ${
                    tripType === "round-trip"
                      ? "bg-secondary text-primary font-medium"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  Aller-retour
                </button>
                <button
                  onClick={() => setTripType("one-way")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-smooth ${
                    tripType === "one-way"
                      ? "bg-secondary text-primary font-medium"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ArrowRight className="w-3 h-3" />
                  Aller simple
                </button>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end gap-0 lg:gap-0 bg-background rounded-lg overflow-hidden">
                <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Départ</label>
                  <CityAutocomplete
                    placeholder="Ville de départ"
                    value={flightFrom}
                    onChange={setFlightFrom}
                    className="h-10 border-0 px-0 focus-visible:ring-0"
                  />
                </div>

                <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Destination</label>
                  <Input 
                    placeholder="Où allez-vous ?" 
                    className="h-10 border-0 px-0 focus-visible:ring-0"
                    value={hotelDestination}
                    onChange={(e) => setHotelDestination(e.target.value)}
                  />
                </div>

                <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Date de départ</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {flightDate ? format(flightDate, "dd/MM/yyyy") : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                      <Calendar mode="single" selected={flightDate} onSelect={setFlightDate} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                {tripType === "round-trip" && (
                  <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Date de retour</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {flightReturnDate ? format(flightReturnDate, "dd/MM/yyyy") : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                        <Calendar mode="single" selected={flightReturnDate} onSelect={setFlightReturnDate} initialFocus className="pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Passagers & Chambres</label>
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

                <Button 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (flightFrom) params.set("from", flightFrom);
                    if (hotelDestination) params.set("to", hotelDestination);
                    if (flightDate) params.set("checkIn", format(flightDate, "yyyy-MM-dd"));
                    if (flightReturnDate) params.set("checkOut", format(flightReturnDate, "yyyy-MM-dd"));
                    params.set("adults", hotelAdults.toString());
                    params.set("children", hotelChildren.toString());
                    params.set("rooms", hotelRooms.toString());
                    navigate(`/flight-hotel?${params.toString()}`);
                  }}
                  className="lg:w-auto w-full h-14 lg:h-16 px-8 bg-secondary text-primary hover:bg-secondary/90 text-base font-semibold gap-2 rounded-none lg:rounded-r-lg"
                >
                  <Search className="w-5 h-5" />
                  Rechercher
                </Button>
              </div>
            </TabsContent>

            {/* Car Tab */}
            <TabsContent value="car" className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-0 lg:gap-0 bg-background rounded-lg overflow-hidden">
                <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Lieu de prise en charge</label>
                  <Input 
                    placeholder="Ville ou aéroport" 
                    className="h-10 border-0 px-0 focus-visible:ring-0"
                    value={carLocation}
                    onChange={(e) => setCarLocation(e.target.value)}
                  />
                </div>

                <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Date de prise en charge</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {carPickupDate ? format(carPickupDate, "dd/MM/yyyy") : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                      <Calendar mode="single" selected={carPickupDate} onSelect={setCarPickupDate} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Date de retour</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {carReturnDate ? format(carReturnDate, "dd/MM/yyyy") : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                      <Calendar mode="single" selected={carReturnDate} onSelect={setCarReturnDate} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button 
                  onClick={handleCarSearch}
                  className="lg:w-auto w-full h-14 lg:h-16 px-8 bg-secondary text-primary hover:bg-secondary/90 text-base font-semibold gap-2 rounded-none lg:rounded-r-lg"
                >
                  <Search className="w-5 h-5" />
                  Rechercher
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
