import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";
import { NotificationPrompt } from "@/components/NotificationPrompt";

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Flights = lazy(() => import("./pages/Flights"));
const Hotels = lazy(() => import("./pages/Hotels"));
const Cars = lazy(() => import("./pages/Cars"));
const Tours = lazy(() => import("./pages/Tours"));
const Destinations = lazy(() => import("./pages/Destinations"));
const DestinationDetail = lazy(() => import("./pages/DestinationDetail"));
const Activities = lazy(() => import("./pages/Activities"));
const Stays = lazy(() => import("./pages/Stays"));
const Events = lazy(() => import("./pages/Events"));
const Trains = lazy(() => import("./pages/Trains"));
const FlightHotel = lazy(() => import("./pages/FlightHotel"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BookingHistory = lazy(() => import("./pages/BookingHistory"));
const Account = lazy(() => import("./pages/Account"));
const Payment = lazy(() => import("./pages/Payment"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const FlightComparison = lazy(() => import("./pages/FlightComparison"));
const FlightBookingProcess = lazy(() => import("./pages/FlightBookingProcess"));
const UnifiedBookingProcess = lazy(() => import("./pages/UnifiedBookingProcess"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminOverview"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminActivities = lazy(() => import("./pages/admin/AdminActivities"));
const AdminStays = lazy(() => import("./pages/admin/AdminStays"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminEmailTemplates = lazy(() => import("./pages/AdminEmailTemplates"));
const Help = lazy(() => import("./pages/Help"));
const Support = lazy(() => import("./pages/Support"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationPrompt />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Index />} />
              <Route path="/flights" element={<Flights />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:id" element={<DestinationDetail />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/stays" element={<Stays />} />
              <Route path="/events" element={<Events />} />
              <Route path="/trains" element={<Trains />} />
              <Route path="/flight-hotel" element={<FlightHotel />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/booking-history" element={<BookingHistory />} />
              <Route path="/account" element={<Account />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/flight-comparison" element={<FlightComparison />} />
              <Route path="/booking-process" element={<FlightBookingProcess />} />
              <Route path="/booking/:serviceType" element={<UnifiedBookingProcess />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/activities" element={<AdminActivities />} />
              <Route path="/admin/stays" element={<AdminStays />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/email-templates" element={<AdminEmailTemplates />} />
              <Route path="/help" element={<Help />} />
              <Route path="/support" element={<Support />} />
              <Route path="/install" element={<Install />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
