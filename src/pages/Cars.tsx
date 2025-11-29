import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Star, Users, Briefcase, Fuel, Settings, Loader2, Car as CarIcon } from "lucide-react";
import { CarBookingDialog } from "@/components/CarBookingDialog";
import { CarSearchForm } from "@/components/CarSearchForm";
import { Pagination } from "@/components/Pagination";
import { useCarRental } from "@/hooks/useCarRental";
import { useCarServices } from "@/hooks/useCarServices";
import { toast } from "sonner";
import { LazyImage } from "@/components/ui/lazy-image";
import bannerCars from "@/assets/banner-cars.jpg";
import { Price } from "@/components/ui/price";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";

const Cars = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { searchCarRentals, loading } = useCarRental();
  const { cars: dbCars, loading: dbLoading } = useCarServices();
  const { formatPrice } = useCurrency();
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiCars, setApiCars] = useState<any[]>([]);
  
  // Filter states
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("price-low");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    const location = searchParams.get("location");
    const pickupDate = searchParams.get("pickupDate");
    const returnDate = searchParams.get("returnDate");

    if (location && pickupDate && returnDate) {
      setHasSearched(true);
      handleSearch(location, pickupDate, returnDate);
    }
  }, [searchParams]);

  const handleSearch = async (
    pickupLocation: string,
    pickupDate: string,
    dropoffDate: string
  ) => {
    const result = await searchCarRentals({
      pickupLocation,
      dropoffLocation: pickupLocation,
      pickupDate,
      dropoffDate
    });

    if (result?.success && result?.data) {
      const carsArray = Array.isArray(result.data) ? result.data : [result.data];
      // Transform API data to match display structure
      const transformedCars = carsArray.map((car: any) => {
        const price = typeof car.price === 'object' && car.price?.grandTotal 
          ? parseFloat(car.price.grandTotal) 
          : typeof car.price === 'number' 
          ? car.price 
          : parseFloat(car.price?.total || car.price || 0);
        
        return {
          id: car.id || car.vehicle_id || Math.random().toString(),
          name: car.name || car.vehicle_name || car.model || 'Véhicule',
          category: car.category || car.vehicle_category || 'Standard',
          price: Math.round(price),
          rating: car.rating || 4.5,
          reviews: car.reviews || car.review_count || 0,
          image: car.image || car.vehicle_image || '/placeholder.svg',
          seats: car.seats || car.passenger_capacity || 5,
          transmission: car.transmission || 'Automatique',
          fuel: car.fuel || car.fuel_type || 'Essence',
          luggage: car.luggage || car.luggage_capacity || 3
        };
      });
      
      setApiCars(transformedCars);
      toast.success(`${transformedCars.length} voitures trouvées`);
    } else {
      // Reset to empty array to show static cars
      setApiCars([]);
      toast.info("Affichage des voitures disponibles localement");
    }
  };

  const cars = [
    {
      id: 1,
      name: "Toyota Corolla",
      category: "Berline",
      price: 25000,
      rating: 4.7,
      reviews: 142,
      image: "/placeholder.svg",
      seats: 5,
      transmission: "Automatique",
      fuel: "Essence",
      luggage: 3
    },
    {
      id: 2,
      name: "Toyota RAV4",
      category: "SUV",
      price: 45000,
      rating: 4.8,
      reviews: 98,
      image: "/placeholder.svg",
      seats: 5,
      transmission: "Automatique",
      fuel: "Essence",
      luggage: 4
    },
    {
      id: 3,
      name: "Renault Clio",
      category: "Économique",
      price: 18000,
      rating: 4.5,
      reviews: 167,
      image: "/placeholder.svg",
      seats: 5,
      transmission: "Manuelle",
      fuel: "Essence",
      luggage: 2
    },
    {
      id: 4,
      name: "Mercedes Classe E",
      category: "Luxe",
      price: 85000,
      rating: 4.9,
      reviews: 73,
      image: "/placeholder.svg",
      seats: 5,
      transmission: "Automatique",
      fuel: "Diesel",
      luggage: 3
    },
    {
      id: 5,
      name: "Hyundai Tucson",
      category: "SUV",
      price: 38000,
      rating: 4.6,
      reviews: 115,
      image: "/placeholder.svg",
      seats: 5,
      transmission: "Automatique",
      fuel: "Essence",
      luggage: 4
    },
    {
      id: 6,
      name: "Kia Picanto",
      category: "Citadine",
      price: 15000,
      rating: 4.4,
      reviews: 203,
      image: "/placeholder.svg",
      seats: 4,
      transmission: "Manuelle",
      fuel: "Essence",
      luggage: 2
    }
  ];

  // Filter and sort cars
  const filteredAndSortedCars = useMemo(() => {
    // Combine all car sources: API results, database services, and static fallback
    const allCars = [
      ...apiCars,
      ...dbCars,
      ...(apiCars.length === 0 && dbCars.length === 0 ? cars : [])
    ];
    
    let result = [...allCars];

    // Apply location filter
    if (filterLocation) {
      result = result.filter(car => 
        car.name.toLowerCase().includes(filterLocation.toLowerCase()) ||
        car.category.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      result = result.filter(car => {
        const category = car.category.toLowerCase();
        switch (filterCategory) {
          case "economy":
            return category.includes("économique") || category.includes("citadine");
          case "sedan":
            return category.includes("berline");
          case "suv":
            return category.includes("suv");
          case "luxury":
            return category.includes("luxe");
          default:
            return true;
        }
      });
    }

    // Apply price filter
    result = result.filter(car => 
      car.price >= priceRange[0] && car.price <= priceRange[1]
    );

    // Apply transmission filter
    if (selectedTransmissions.length > 0) {
      result = result.filter(car => 
        selectedTransmissions.some(trans => 
          car.transmission.toLowerCase().includes(trans.toLowerCase())
        )
      );
    }

    // Apply fuel type filter
    if (selectedFuelTypes.length > 0) {
      result = result.filter(car => 
        selectedFuelTypes.some(fuel => 
          car.fuel.toLowerCase().includes(fuel.toLowerCase())
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
  }, [apiCars, dbCars, cars, filterLocation, filterCategory, priceRange, selectedTransmissions, selectedFuelTypes, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCars.length / itemsPerPage);
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCars.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCars, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
        <LazyImage 
          src={bannerCars}
          alt="Location de voitures" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <CarIcon className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">{t('cars.title')}</h1>
            <p className="text-lg md:text-xl text-white/95 drop-shadow-md max-w-2xl mx-auto">{t('cars.subtitle')}</p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CarSearchForm />
          </div>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('cars.filters')}</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('cars.pickupLocation')}</label>
                  <Input 
                    placeholder={t('cars.cityOrAirport')} 
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">{t('cars.category')}</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('cars.all')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('cars.all')}</SelectItem>
                      <SelectItem value="economy">{t('cars.economy')}</SelectItem>
                      <SelectItem value="sedan">{t('cars.sedan')}</SelectItem>
                      <SelectItem value="suv">{t('cars.suv')}</SelectItem>
                      <SelectItem value="luxury">{t('cars.luxury')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('cars.pricePerDay')}: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </label>
                  <Slider
                    min={0}
                    max={150000}
                    step={5000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('cars.transmission')} ({selectedTransmissions.length > 0 ? selectedTransmissions.length : t('cars.all')})
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={selectedTransmissions.includes("Automatique")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTransmissions([...selectedTransmissions, "Automatique"]);
                          } else {
                            setSelectedTransmissions(selectedTransmissions.filter(t => t !== "Automatique"));
                          }
                        }}
                      />
                      <span className="text-sm">{t('cars.automatic')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={selectedTransmissions.includes("Manuelle")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTransmissions([...selectedTransmissions, "Manuelle"]);
                          } else {
                            setSelectedTransmissions(selectedTransmissions.filter(t => t !== "Manuelle"));
                          }
                        }}
                      />
                      <span className="text-sm">{t('cars.manual')}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('cars.fuel')} ({selectedFuelTypes.length > 0 ? selectedFuelTypes.length : t('cars.all')})
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={selectedFuelTypes.includes("Essence")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFuelTypes([...selectedFuelTypes, "Essence"]);
                          } else {
                            setSelectedFuelTypes(selectedFuelTypes.filter(f => f !== "Essence"));
                          }
                        }}
                      />
                      <span className="text-sm">{t('cars.petrol')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={selectedFuelTypes.includes("Diesel")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFuelTypes([...selectedFuelTypes, "Diesel"]);
                          } else {
                            setSelectedFuelTypes(selectedFuelTypes.filter(f => f !== "Diesel"));
                          }
                        }}
                      />
                      <span className="text-sm">{t('cars.diesel')}</span>
                    </label>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    setFilterLocation("");
                    setFilterCategory("all");
                    setPriceRange([0, 150000]);
                    setSelectedTransmissions([]);
                    setSelectedFuelTypes([]);
                  }}
                >
                  {t('cars.resetFilters')}
                </Button>
              </div>
            </Card>
          </aside>

          {/* Liste des voitures */}
          <div className="lg:col-span-3 space-y-6">
            {(loading || dbLoading) && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-lg">{t('cars.loading')}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                {filteredAndSortedCars.length} {t('cars.vehiclesAvailable')}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{t('cars.sortBy.popular')}</SelectItem>
                  <SelectItem value="price-asc">{t('cars.sortBy.priceAsc')}</SelectItem>
                  <SelectItem value="price-desc">{t('cars.sortBy.priceDesc')}</SelectItem>
                  <SelectItem value="rating">{t('cars.sortBy.rating')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredAndSortedCars.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">{t('cars.noVehicles')}</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {paginatedCars.map((car, index) => (
                <Card key={car.id || index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">
                        {car.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3">{car.name}</h3>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(car.rating)
                                ? "fill-accent text-accent"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {car.rating} ({car.reviews} avis)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{car.seats} places</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>{car.luggage} bagages</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>{car.transmission}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Fuel className="w-4 h-4" />
                        <span>{car.fuel}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('activities.startingFrom')}</p>
                        <p className="text-2xl font-bold text-primary">
                          <Price amount={car.price} fromCurrency="EUR" showLoader />
                        </p>
                        <p className="text-xs text-muted-foreground">{t('cars.perDay')}</p>
                      </div>
                      <Button onClick={() => {
                        setSelectedCar({
                          id: car.id.toString(),
                          name: car.name,
                          category: car.category,
                          price: car.price,
                          transmission: car.transmission,
                          seats: car.seats
                        });
                        setDialogOpen(true);
                      }}>
                        {t('search.book')}
                      </Button>
                    </div>
                  </CardContent>
                  </Card>
                ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredAndSortedCars.length}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {selectedCar && (
        <CarBookingDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
          car={selectedCar}
        />
      )}

      <Footer />
    </div>
  );
};

export default Cars;
