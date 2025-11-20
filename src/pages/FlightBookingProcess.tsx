import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { 
  Plane, 
  Clock, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Check,
  Info,
  AlertCircle,
  Shield,
  FileText,
  Users,
  ChevronDown,
  Share2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FlightBookingProcess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<'none' | 'basic' | 'premium'>('none');
  const [additionalPassengers, setAdditionalPassengers] = useState(false);
  const [showLuggageDetails, setShowLuggageDetails] = useState(false);

  // Parse flight data from URL params
  const flightData = {
    id: searchParams.get('id') || '',
    airline: searchParams.get('airline') || 'Air France',
    from: searchParams.get('from') || 'Dakar',
    to: searchParams.get('to') || 'Abidjan',
    departure: searchParams.get('departure') || new Date().toISOString(),
    arrival: searchParams.get('arrival') || new Date().toISOString(),
    price: parseFloat(searchParams.get('price') || '337'),
    class: searchParams.get('class') || 'Economique',
    fare: searchParams.get('fare') || 'basic',
    departureDate: searchParams.get('departureDate') || new Date().toISOString().split('T')[0],
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  const calculateDuration = () => {
    const dep = new Date(flightData.departure);
    const arr = new Date(flightData.arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const formData = {
      lastName: form.get("lastName") as string,
      firstName: form.get("firstName") as string,
      nationality: form.get("nationality") as string,
      gender: form.get("gender") as string,
      birthDate: form.get("birthDate") as string,
      passportNumber: form.get("passportNumber") as string,
      passportIssueDate: form.get("passportIssueDate") as string,
      passportExpiryDate: form.get("passportExpiryDate") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Vous devez être connecté pour réserver");
        navigate('/auth');
        return;
      }

      // Create service
      const { data: newService, error: serviceError } = await supabase
        .from("services")
        .insert({
          name: `Vol ${flightData.from} → ${flightData.to}`,
          type: "flight",
          price_per_unit: flightData.price,
          currency: "FCFA",
          location: flightData.to,
          destination: flightData.from,
          available: true,
          description: `${flightData.airline} - Classe ${flightData.class}`
        })
        .select()
        .single();

      if (serviceError) throw serviceError;

      // Create booking
      const { data: booking, error: bookingError } = await supabase.from("bookings").insert({
        user_id: user.id,
        service_id: newService.id,
        start_date: flightData.departureDate,
        end_date: flightData.departureDate,
        guests: 1,
        total_price: flightData.price,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        currency: "FCFA",
        status: "pending",
        payment_status: "pending",
        booking_details: {
          passenger: formData,
          flightDetails: flightData,
          insurance: selectedInsurance,
        }
      }).select().single();

      if (bookingError) throw bookingError;

      toast.success("Réservation créée avec succès!");
      navigate(`/payment?bookingId=${booking.id}`);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("Erreur lors de la création de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: "Informations relatives au passager", active: true },
    { number: 2, label: "Bagage", active: false },
    { number: 3, label: "Paiement", active: false },
    { number: 4, label: "Tarif additionnel", active: false },
    { number: 5, label: "Récapitulatif", active: false },
    { number: 6, label: "Résumé des réservations", active: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.number} className="flex-1 relative flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10
                  ${step.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {step.active ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <span className={`
                  text-xs mt-2 text-center max-w-[120px]
                  ${step.active ? 'text-foreground font-semibold' : 'text-muted-foreground'}
                `}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`
                    absolute top-5 left-1/2 w-full h-0.5 -z-0
                    ${step.active ? 'bg-primary' : 'bg-border'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Flight Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{flightData.from} → {flightData.to}</h2>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Trip Type Notice */}
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    Le prix de votre billet inclut une protection contre les perturbations
                  </p>
                </div>
                <button className="text-xs text-emerald-700 dark:text-emerald-300 underline mt-2">
                  Savoir plus
                </button>
              </div>

              {/* Itinerary */}
              <div className="space-y-6">
                <h3 className="font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Vue d'ensemble du voyage
                </h3>

                {/* Outbound */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(flightData.departureDate).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                  </div>

                  {/* Departure */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
                    <div className="absolute left-[7px] top-5 w-0.5 h-12 bg-border"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{formatTime(flightData.departure)}</p>
                        <p className="text-sm font-semibold mt-1">{flightData.from}, DSS</p>
                        <p className="text-xs text-muted-foreground">
                          Aéroport Blaise Diagne International Airport
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Flight Info */}
                  <div className="pl-8 py-2">
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{flightData.airline}</p>
                        <p className="text-xs text-muted-foreground">Durée: {calculateDuration()}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowLuggageDetails(!showLuggageDetails)}
                        className="text-xs text-primary"
                      >
                        <Info className="h-3 w-3 mr-1" />
                        Détails du vol
                      </Button>
                    </div>
                    
                    {showLuggageDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-3 p-3 bg-muted/50 rounded-lg text-xs space-y-2"
                      >
                        <p className="font-semibold">Informations sur le correspondance:</p>
                        <p className="text-muted-foreground">
                          ✓ 1 bagage cabine: Doit ne pas dépasser le dimanche de de : 8 kg et 55 x 40 x 20 cm
                        </p>
                        <p className="text-muted-foreground">
                          ✗ Votre billet ne comporte pas de bagage ni courte de bagage (inclus)
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Stopover Alert */}
                  <div className="pl-8">
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                            Votre billet comprend 1 escale(s). Doit se de dimanche levée de la cie : 4h 30 min
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{formatTime(flightData.arrival)}</p>
                        <p className="text-sm font-semibold mt-1">{flightData.to}, ABJ</p>
                        <p className="text-xs text-muted-foreground">
                          Aéroport international Félix Houphouët-Boigny
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Luggage Notice */}
                <div className="pt-4 border-t">
                  <button className="text-xs text-primary underline flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Conflit avec documents du voyage (des passeport) les aide de cie
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Vous ne pouvez pas acheter de bagage une contre de bagage à moins
                  </p>
                </div>
              </div>

              {/* Price Summary */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span>1 adulte(s)</span>
                  <span className="font-semibold">{flightData.price} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes</span>
                  <span className="font-semibold">Inclus</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total (EUR)</span>
                  <span className="text-primary">{flightData.price} FCFA</span>
                </div>
                <button className="text-xs text-primary underline">Voir le détail du prix</button>
              </div>
            </Card>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Main Passenger Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Passager principal
                  </h2>
                  <Button type="button" variant="link" className="text-xs text-primary">
                    Ajouter l'âge de 18 ans
                  </Button>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Pour éviter toute complication lors de l'enregistrement, assurez-vous que le nom correspond exactement à celui qui apparaîtra sur votre passport/pièce d'identité.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Prénom</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      placeholder="SOHO" 
                      required 
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nom de famille</Label>
                    <Select name="gender" required>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">M.</SelectItem>
                        <SelectItem value="female">Mme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationalité</Label>
                    <Select name="nationality" required>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SN">Sénégal</SelectItem>
                        <SelectItem value="CI">Côte d'Ivoire</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="OTHER">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Sexe</Label>
                    <Select name="gender" required>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Mâle</SelectItem>
                        <SelectItem value="F">Femelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Select name="birthDay" required>
                        <SelectTrigger>
                          <SelectValue placeholder="JJ" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select name="birthMonth" required>
                        <SelectTrigger>
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select name="birthYear" required>
                        <SelectTrigger>
                          <SelectValue placeholder="AAAA" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 100}, (_, i) => 2024 - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">
                      Numéro du passeport ou de la pièce d'identité
                    </Label>
                    <Input 
                      id="passportNumber" 
                      name="passportNumber" 
                      required 
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passportIssueDate">
                      Date d'expiration de la pièce d'identité
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Select name="expiryDay" required>
                        <SelectTrigger>
                          <SelectValue placeholder="JJ" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select name="expiryMonth" required>
                        <SelectTrigger>
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select name="expiryYear" required>
                        <SelectTrigger>
                          <SelectValue placeholder="AAAA" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 20}, (_, i) => 2024 + i).map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-start gap-2">
                      <Checkbox id="noExpiry" />
                      <label htmlFor="noExpiry" className="text-sm text-muted-foreground">
                        Aucune date d'expiration
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Insurance Section */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Assurance voyage
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Protégez votre AAA Assistance
                </p>

                <RadioGroup 
                  value={selectedInsurance} 
                  onValueChange={(value: any) => setSelectedInsurance(value)}
                  className="space-y-4"
                >
                  {/* Travel Plus */}
                  <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value="basic" id="insurance-basic" />
                      <label htmlFor="insurance-basic" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">Travel Plus</h3>
                          <p className="text-sm">+ 27 €</p>
                        </div>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>Frais médicaux</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>Annulation de voyage dans 3 démarches je une malaisie, en accident ou un décident dans famille</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>Services d'assistance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>Bagages retardés</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>Responsabilité civile</span>
                          </li>
                        </ul>
                      </label>
                    </div>
                  </Card>

                  {/* Premium Insurance */}
                  <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value="premium" id="insurance-premium" />
                      <label htmlFor="insurance-premium" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold">Assurance essentielle</h3>
                          <p className="text-sm">+ 22 €</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Une couverture essentielle d'un retrait décalé et d'une retrait de bagages
                        </p>
                        <button type="button" className="text-xs text-primary underline">
                          Communiquer de conditions
                        </button>
                      </label>
                    </div>
                  </Card>

                  {/* No Insurance */}
                  <Card className="p-4 cursor-pointer hover:border-primary transition-colors">
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value="none" id="insurance-none" />
                      <label htmlFor="insurance-none" className="flex-1 cursor-pointer">
                        <h3 className="font-bold">Je ne veux pas d'assurance</h3>
                      </label>
                    </div>
                  </Card>
                </RadioGroup>
              </Card>

              {/* Additional Passengers Section */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  Vous réservez pour d'autres passagers ?
                </h2>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full h-12"
                  onClick={() => setAdditionalPassengers(!additionalPassengers)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Ajouter un passager
                </Button>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="h-12 px-8"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 font-semibold"
                >
                  {loading ? "Traitement..." : "Continuer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
