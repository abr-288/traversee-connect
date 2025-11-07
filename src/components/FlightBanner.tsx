import { Search, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function FlightBanner() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(new Date());
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [isOneWay, setIsOneWay] = useState(true);
  const [passengers, setPassengers] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      navigate(`/flights?from=${from}&to=${to}&date=${departureDate?.toISOString().split('T')[0]}&returnDate=${returnDate?.toISOString().split('T')[0] || ''}&adults=${passengers}`);
    }, 500);
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 md:py-20 px-4 rounded-2xl shadow-xl overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Réservez vos vols aux meilleurs prix
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            Comparez des milliers de vols et trouvez les meilleures offres
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-blue-100">Départ</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ville ou aéroport"
                  className="bg-white/90 text-gray-900 border-none pl-10 h-12"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <Plane className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button 
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  const temp = from;
                  setFrom(to);
                  setTo(temp);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <label className="block text-sm font-medium text-blue-100">Destination</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ville ou aéroport"
                  className="bg-white/90 text-gray-900 border-none pl-10 h-12"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <Plane className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">Date d'aller</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-white/90 text-gray-900 hover:bg-white border-none justify-start text-left font-normal"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {departureDate ? format(departureDate, 'PPP', { locale: fr }) : 'Choisir une date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!isOneWay && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-100">Date de retour</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 bg-white/90 text-gray-900 hover:bg-white border-none justify-start text-left font-normal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {returnDate ? format(returnDate, 'PPP', { locale: fr }) : 'Optionnel'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex items-end">
              <Button
                onClick={() => setIsOneWay(!isOneWay)}
                variant="outline"
                className="h-12 bg-white/90 text-gray-900 hover:bg-white border-none"
              >
                {isOneWay ? 'Aller simple' : 'Aller-retour'}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-100">Passagers:</span>
              <div className="flex items-center space-x-2 bg-white/90 rounded-md px-3 py-1">
                <button 
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="text-gray-900 font-medium">{passengers}</span>
                <button 
                  onClick={() => setPassengers(passengers + 1)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full sm:w-auto bg-[#00C853] hover:bg-[#00A844] text-white font-semibold py-3 px-8 text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  <span className="font-bold">Rechercher des vols</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlightBanner;
