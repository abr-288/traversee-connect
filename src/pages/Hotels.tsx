import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Star, MapPin, Users, Wifi, UtensilsCrossed, Car, Loader2, Globe, GitCompare, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import hotelIvoire from "@/assets/hotel-ivoire.jpg";
import hotelSofitel from "@/assets/hotel-sofitel.jpg";
import hotelAzalai from "@/assets/hotel-azalai.jpg";
import hotelPullman from "@/assets/hotel-pullman.jpg";
import hotelSeen from "@/assets/hotel-seen.jpg";
import hotelOnomo from "@/assets/hotel-onomo.jpg";
import { HotelBookingDialog } from "@/components/HotelBookingDialog";
import { HotelSearchForm } from "@/components/HotelSearchForm";
import { HotelComparisonDialog } from "@/components/HotelComparisonDialog";
import { Pagination } from "@/components/Pagination";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Hotels = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { searchHotels, loading } = useHotelSearch();
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiHotels, setApiHotels] = useState<any[]>([]);
  
  // Filter states
  const [filterDestination, setFilterDestination] = useState("");
  const [filterStars, setFilterStars] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("price-low");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const itemsPerPage = 9;
  
  // Comparison state
  const [selectedHotels, setSelectedHotels] = useState<any[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  useEffect(() => {
    const destination = searchParams.get("destination");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const rooms = searchParams.get("rooms");

    if (destination && checkIn && checkOut && adults) {
      setHasSearched(true);
      handleSearch(
        destination,
        checkIn,
        checkOut,
        parseInt(adults),
        children ? parseInt(children) : 0,
        rooms ? parseInt(rooms) : 1
      );
    }
  }, [searchParams]);

  const handleSearch = async (
    location: string,
    checkIn: string,
    checkOut: string,
    adults: number,
    children: number = 0,
    rooms: number = 1
  ) => {
    const result = await searchHotels({
      location,
      checkIn,
      checkOut,
      adults,
      children,
      rooms
    });

    if (result?.success) {
      // Transform API data to match display structure with source tracking
      const bookingHotels = (result.data?.booking || []).map((hotel: any) => {
        const price = typeof hotel.price === 'object' && hotel.price?.grandTotal 
          ? parseFloat(hotel.price.grandTotal) 
          : typeof hotel.price === 'number' 
          ? hotel.price 
          : parseFloat(hotel.price?.total || hotel.price || 0);
        
        return {
          id: hotel.id || hotel.hotel_id || Math.random().toString(),
          name: hotel.name || hotel.hotel_name || 'Hôtel',
          location: hotel.location || hotel.address || location,
          price: Math.round(price),
          rating: hotel.rating || hotel.review_score || 4.0,
          reviews: hotel.reviews || hotel.review_count || 0,
          image: hotel.image || hotel.main_photo_url || '/placeholder.svg',
          amenities: hotel.amenities || hotel.facilities || ['Wifi', 'Restaurant'],
          source: 'Booking.com'
        };
      });

      const airbnbHotels = (result.data?.airbnb || []).map((hotel: any) => {
        const price = typeof hotel.price === 'object' && hotel.price?.grandTotal 
          ? parseFloat(hotel.price.grandTotal) 
          : typeof hotel.price === 'number' 
          ? hotel.price 
          : parseFloat(hotel.price?.total || hotel.price || 0);
        
        return {
          id: hotel.id || hotel.hotel_id || Math.random().toString(),
          name: hotel.name || hotel.hotel_name || 'Hôtel',
          location: hotel.location || hotel.address || location,
          price: Math.round(price),
          rating: hotel.rating || hotel.review_score || 4.0,
          reviews: hotel.reviews || hotel.review_count || 0,
          image: hotel.image || hotel.main_photo_url || '/placeholder.svg',
          amenities: hotel.amenities || hotel.facilities || ['Wifi', 'Restaurant'],
          source: 'Airbnb'
        };
      });

      const worldwideHotels = (result.data?.worldwide || []).map((hotel: any) => {
        const price = typeof hotel.price === 'object' && hotel.price?.grandTotal 
          ? parseFloat(hotel.price.grandTotal) 
          : typeof hotel.price === 'number' 
          ? hotel.price 
          : parseFloat(hotel.price?.total || hotel.price || 0);
        
        return {
          id: hotel.id || hotel.hotel_id || Math.random().toString(),
          name: hotel.name || hotel.hotel_name || 'Hôtel',
          location: hotel.location || hotel.address || location,
          price: Math.round(price),
          rating: hotel.rating || hotel.review_score || 4.0,
          reviews: hotel.reviews || hotel.review_count || 0,
          image: hotel.image || hotel.main_photo_url || '/placeholder.svg',
          amenities: hotel.amenities || hotel.facilities || ['Wifi', 'Restaurant'],
          source: 'Worldwide Hotels'
        };
      });

      const hotelscomHotels = (result.data?.hotelscom || []).map((hotel: any) => {
        const price = typeof hotel.price === 'object' && hotel.price?.grandTotal 
          ? parseFloat(hotel.price.grandTotal) 
          : typeof hotel.price === 'number' 
          ? hotel.price 
          : parseFloat(hotel.price?.total || hotel.price || 0);
        
        return {
          id: hotel.id || hotel.hotel_id || Math.random().toString(),
          name: hotel.name || hotel.hotel_name || 'Hôtel',
          location: hotel.location || hotel.address || location,
          price: Math.round(price),
          rating: hotel.rating || hotel.review_score || 4.0,
          reviews: hotel.reviews || hotel.review_count || 0,
          image: hotel.image || hotel.main_photo_url || '/placeholder.svg',
          amenities: hotel.amenities || hotel.facilities || ['Wifi', 'Restaurant'],
          source: 'Hotels.com'
        };
      });

      const pricelineHotels = (result.data?.priceline || []).map((hotel: any) => {
        const price = typeof hotel.price === 'object' && hotel.price?.grandTotal 
          ? parseFloat(hotel.price.grandTotal) 
          : typeof hotel.price === 'number' 
          ? hotel.price 
          : parseFloat(hotel.price?.total || hotel.price || 0);
        
        return {
          id: hotel.id || hotel.hotel_id || Math.random().toString(),
          name: hotel.name || hotel.hotel_name || 'Hôtel',
          location: hotel.location || hotel.address || location,
          price: Math.round(price),
          rating: hotel.rating || hotel.review_score || 4.0,
          reviews: hotel.reviews || hotel.review_count || 0,
          image: hotel.image || hotel.main_photo_url || '/placeholder.svg',
          amenities: hotel.amenities || hotel.facilities || ['Wifi', 'Restaurant'],
          source: 'Priceline'
        };
      });

      const amadeusHotels = (result.data?.amadeus || []).map((hotel: any) => {
        const price = typeof hotel.price === 'object' && hotel.price?.grandTotal 
          ? parseFloat(hotel.price.grandTotal) 
          : typeof hotel.price === 'number' 
          ? hotel.price 
          : parseFloat(hotel.price?.total || hotel.price || 0);
        
        return {
          id: hotel.id || hotel.hotel_id || Math.random().toString(),
          name: hotel.name || hotel.hotel_name || 'Hôtel',
          location: hotel.location || hotel.address || location,
          price: Math.round(price),
          rating: hotel.rating || hotel.review_score || 4.0,
          reviews: hotel.reviews || hotel.review_count || 0,
          image: hotel.image || hotel.main_photo_url || '/placeholder.svg',
          amenities: hotel.amenities || hotel.facilities || ['Wifi', 'Restaurant'],
          source: 'Amadeus'
        };
      });

      const tripadvisorHotels = (result.data?.tripadvisor || []).map((hotel: any) => {
        const price = typeof hotel.price === 'object' && hotel.price?.grandTotal 
          ? parseFloat(hotel.price.grandTotal) 
          : typeof hotel.price === 'number' 
          ? hotel.price 
          : parseFloat(hotel.price?.total || hotel.price || 0);
        
        return {
          id: hotel.id || hotel.hotel_id || Math.random().toString(),
          name: hotel.name || hotel.hotel_name || 'Hôtel',
          location: hotel.location || hotel.address || location,
          price: Math.round(price),
          rating: hotel.rating || hotel.review_score || 4.0,
          reviews: hotel.reviews || hotel.review_count || 0,
          image: hotel.image || hotel.main_photo_url || '/placeholder.svg',
          amenities: hotel.amenities || hotel.facilities || ['Wifi', 'Restaurant'],
          source: 'TripAdvisor'
        };
      });

      const transformedHotels = [
        ...amadeusHotels,
        ...bookingHotels, 
        ...airbnbHotels, 
        ...worldwideHotels,
        ...hotelscomHotels,
        ...pricelineHotels,
        ...tripadvisorHotels
      ];
      
      if (transformedHotels.length > 0) {
        setApiHotels(transformedHotels);
        toast.success(`${transformedHotels.length} hébergements trouvés avec prix réels`);
      } else {
        toast.error("Aucun hébergement trouvé pour cette recherche");
      }
    } else {
      toast.error("Erreur lors de la recherche d'hôtels");
    }
  };

  const hotels = [
    {
      id: 1,
      name: "Hôtel Ivoire",
      location: "Abidjan, Cocody",
      price: 45000,
      rating: 4.8,
      reviews: 234,
      image: hotelIvoire,
      amenities: ["Wifi", "Restaurant", "Parking", "Piscine"]
    },
    {
      id: 2,
      name: "Sofitel Abidjan",
      location: "Abidjan, Plateau",
      price: 85000,
      rating: 4.9,
      reviews: 189,
      image: hotelSofitel,
      amenities: ["Wifi", "Restaurant", "Parking", "Spa"]
    },
    {
      id: 3,
      name: "Azalaï Hôtel",
      location: "Abidjan, Marcory",
      price: 35000,
      rating: 4.5,
      reviews: 156,
      image: hotelAzalai,
      amenities: ["Wifi", "Restaurant", "Bar"]
    },
    {
      id: 4,
      name: "Pullman Abidjan",
      location: "Abidjan, Plateau",
      price: 75000,
      rating: 4.7,
      reviews: 203,
      image: hotelPullman,
      amenities: ["Wifi", "Restaurant", "Parking", "Gym"]
    },
    {
      id: 5,
      name: "Seen Hotel",
      location: "Abidjan, Zone 4",
      price: 55000,
      rating: 4.6,
      reviews: 142,
      image: hotelSeen,
      amenities: ["Wifi", "Restaurant", "Piscine"]
    },
    {
      id: 6,
      name: "Onomo Hotel",
      location: "Abidjan, Aéroport",
      price: 28000,
      rating: 4.3,
      reviews: 98,
      image: hotelOnomo,
      amenities: ["Wifi", "Restaurant", "Navette"]
    }
  ];

  // Get unique amenities from hotels for filter
  const availableAmenities = useMemo(() => {
    const displayHotels = apiHotels.length > 0 ? apiHotels : hotels;
    const amenitiesSet = new Set<string>();
    displayHotels.forEach(hotel => {
      hotel.amenities.forEach((amenity: string) => amenitiesSet.add(amenity));
    });
    return Array.from(amenitiesSet).sort();
  }, [apiHotels]);

  // Filter and sort hotels
  const filteredAndSortedHotels = useMemo(() => {
    let result = apiHotels.length > 0 ? [...apiHotels] : [...hotels];

    // Apply destination filter
    if (filterDestination) {
      result = result.filter(hotel => 
        hotel.name.toLowerCase().includes(filterDestination.toLowerCase()) ||
        hotel.location.toLowerCase().includes(filterDestination.toLowerCase())
      );
    }

    // Apply star filter
    if (filterStars !== "all") {
      const starRating = parseInt(filterStars);
      result = result.filter(hotel => Math.floor(hotel.rating) >= starRating);
    }

    // Apply price filter
    result = result.filter(hotel => 
      hotel.price >= priceRange[0] && hotel.price <= priceRange[1]
    );

    // Apply amenities filter
    if (selectedAmenities.length > 0) {
      result = result.filter(hotel => 
        selectedAmenities.some(amenity => 
          hotel.amenities.some((hotelAmenity: string) => 
            hotelAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
      default:
        result.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return result;
  }, [apiHotels, filterDestination, filterStars, priceRange, selectedAmenities, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedHotels.length / itemsPerPage);
  const paginatedHotels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedHotels.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedHotels, currentPage, itemsPerPage]);

  // Toggle hotel selection for comparison
  const toggleHotelSelection = (hotel: any) => {
    setSelectedHotels((prev) => {
      const isSelected = prev.some((h) => h.id === hotel.id);
      if (isSelected) {
        return prev.filter((h) => h.id !== hotel.id);
      } else {
        if (prev.length >= 4) {
          toast.error("Vous ne pouvez comparer que 4 hôtels maximum");
          return prev;
        }
        return [...prev, hotel];
      }
    });
  };

  const removeHotelFromComparison = (hotelId: string | number) => {
    setSelectedHotels((prev) => prev.filter((h) => h.id !== hotelId));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945" 
          alt="Hotels" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">Hôtels & Hébergements</h1>
            <p className="text-lg md:text-xl text-white/95 drop-shadow-md max-w-2xl mx-auto">Des hébergements de qualité partout dans le monde</p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <HotelSearchForm />
          </div>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Filtres Desktop */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Filtres</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Destination</label>
                  <Input 
                    placeholder="Rechercher une ville..." 
                    value={filterDestination}
                    onChange={(e) => setFilterDestination(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Étoiles</label>
                  <Select value={filterStars} onValueChange={setFilterStars}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="5">5 étoiles</SelectItem>
                      <SelectItem value="4">4 étoiles</SelectItem>
                      <SelectItem value="3">3 étoiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Prix par nuit: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} FCFA
                  </label>
                  <Slider
                    min={0}
                    max={500000}
                    step={5000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Équipements ({selectedAmenities.length > 0 ? selectedAmenities.length : 'Tous'})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableAmenities.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAmenities([...selectedAmenities, amenity]);
                            } else {
                              setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                            }
                          }}
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    setFilterDestination("");
                    setFilterStars("all");
                    setPriceRange([0, 500000]);
                    setSelectedAmenities([]);
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </Card>
          </aside>

          {/* Liste des hôtels */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* Mobile Filters Button */}
            <div className="lg:hidden flex gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Destination</label>
                      <Input 
                        placeholder="Rechercher une ville..." 
                        value={filterDestination}
                        onChange={(e) => setFilterDestination(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Étoiles</label>
                      <Select value={filterStars} onValueChange={setFilterStars}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          <SelectItem value="5">5 étoiles</SelectItem>
                          <SelectItem value="4">4 étoiles</SelectItem>
                          <SelectItem value="3">3 étoiles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Prix par nuit: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} FCFA
                      </label>
                      <Slider
                        min={0}
                        max={500000}
                        step={5000}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="mt-4"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Équipements</label>
                      <div className="space-y-2">
                        {availableAmenities.map(amenity => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-${amenity}`}
                              checked={selectedAmenities.includes(amenity)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAmenities([...selectedAmenities, amenity]);
                                } else {
                                  setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                                }
                              }}
                            />
                            <label htmlFor={`mobile-${amenity}`} className="text-sm cursor-pointer">
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Trier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Plus populaires</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="rating">Mieux notés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-lg">Recherche en cours...</span>
              </div>
            )}
            
            {/* Desktop Header */}
            <div className="hidden lg:flex justify-between items-center">
              <p className="text-muted-foreground">
                {filteredAndSortedHotels.length} hôtel{filteredAndSortedHotels.length > 1 ? 's' : ''} trouvé{filteredAndSortedHotels.length > 1 ? 's' : ''}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
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

            {filteredAndSortedHotels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Aucun hôtel ne correspond à vos critères</p>
                <p className="text-sm text-muted-foreground mt-2">Essayez de modifier vos filtres ou votre recherche</p>
              </div>
            ) : (
              <>
              <div className="grid gap-6">
                {paginatedHotels.map((hotel, index) => {
                  const isSelected = selectedHotels.some((h) => h.id === hotel.id);
                  return (
                <Card key={hotel.id || index} className={`overflow-hidden hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 relative">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover min-h-[300px]"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleHotelSelection(hotel)}
                          className="bg-background/90 border-2"
                        />
                      </div>
                      {(hotel as any).source && (
                        <Badge className="absolute top-2 right-2 bg-background/90 text-foreground border">
                          <Globe className="w-3 h-3 mr-1" />
                          {(hotel as any).source}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="md:col-span-2 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-semibold">{hotel.name}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{hotel.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(hotel.rating)
                                      ? "fill-accent text-accent"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {hotel.rating.toFixed(1)} ({hotel.reviews} avis)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mb-4 flex-wrap">
                        {hotel.amenities.slice(0, 4).map((amenity, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-muted rounded-full text-sm"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-end mt-auto">
                        <div>
                          <p className="text-sm text-muted-foreground">Prix réel</p>
                          <p className="text-3xl font-bold text-primary">
                            {hotel.price.toLocaleString()} <span className="text-lg">FCFA</span>
                          </p>
                          <p className="text-sm text-muted-foreground">par nuit</p>
                        </div>
                        <Button size="lg" onClick={() => {
                          setSelectedHotel({
                            id: hotel.id.toString(),
                            name: hotel.name,
                            location: hotel.location,
                            price: hotel.price
                          });
                          setDialogOpen(true);
                        }}>
                          Réserver
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
                );
                })}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredAndSortedHotels.length}
              />
              </>
            )}
          </div>
        </div>
      </main>

      {selectedHotel && (
        <HotelBookingDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
          hotel={selectedHotel}
        />
      )}

      <HotelComparisonDialog
        open={comparisonOpen}
        onOpenChange={setComparisonOpen}
        hotels={selectedHotels}
        onRemoveHotel={removeHotelFromComparison}
        onBookHotel={(hotel) => {
          setSelectedHotel({
            id: hotel.id.toString(),
            name: hotel.name,
            location: hotel.location,
            price: hotel.price
          });
          setDialogOpen(true);
        }}
      />

      {/* Floating comparison button */}
      {selectedHotels.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setComparisonOpen(true)}
          >
            <GitCompare className="w-5 h-5 mr-2" />
            Comparer ({selectedHotels.length})
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Hotels;
