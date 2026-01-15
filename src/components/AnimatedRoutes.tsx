import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import PageTransition from "./PageTransition";

// Lazy load route components for code splitting
const Index = lazy(() => import("@/pages/Index"));
const Flights = lazy(() => import("@/pages/Flights"));
const Hotels = lazy(() => import("@/pages/Hotels"));
const Cars = lazy(() => import("@/pages/Cars"));
const Tours = lazy(() => import("@/pages/Tours"));
const Destinations = lazy(() => import("@/pages/Destinations"));
const DestinationDetail = lazy(() => import("@/pages/DestinationDetail"));
const Activities = lazy(() => import("@/pages/Activities"));
const Stays = lazy(() => import("@/pages/Stays"));
const Events = lazy(() => import("@/pages/Events"));
const Trains = lazy(() => import("@/pages/Trains"));
const FlightHotel = lazy(() => import("@/pages/FlightHotel"));
const Auth = lazy(() => import("@/pages/Auth"));
const Dashboard = lazy(() => import("@/pages/UserDashboard"));
const BookingHistory = lazy(() => import("@/pages/BookingHistory"));
const Account = lazy(() => import("@/pages/Account"));
const Payment = lazy(() => import("@/pages/Payment"));
const Confirmation = lazy(() => import("@/pages/Confirmation"));
const FlightComparison = lazy(() => import("@/pages/FlightComparison"));
const FlightBookingProcess = lazy(() => import("@/pages/FlightBookingProcess"));
const UnifiedBookingProcess = lazy(() => import("@/pages/UnifiedBookingProcess"));
const FlightHotelBookingProcess = lazy(() => import("@/pages/FlightHotelBookingProcess"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminOverview"));
const AdminBookings = lazy(() => import("@/pages/admin/AdminBookings"));
const AdminServices = lazy(() => import("@/pages/admin/AdminServices"));
const AdminActivities = lazy(() => import("@/pages/admin/AdminActivities"));
const AdminStays = lazy(() => import("@/pages/admin/AdminStays"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminSubscriptions = lazy(() => import("@/pages/admin/AdminSubscriptions"));
const AdminSubscriptionPlans = lazy(() => import("@/pages/admin/AdminSubscriptionPlans"));
const AdminPromotions = lazy(() => import("@/pages/admin/AdminPromotions"));
const AdminEmailTemplates = lazy(() => import("@/pages/AdminEmailTemplates"));
const AdminConfiguration = lazy(() => import("@/pages/admin/AdminConfiguration"));
const AdminAgencies = lazy(() => import("@/pages/admin/AdminAgencies"));
const AdminCommissions = lazy(() => import("@/pages/admin/AdminCommissions"));
const AgencyDashboard = lazy(() => import("@/pages/agency/AgencyDashboard"));
const AgencyServices = lazy(() => import("@/pages/agency/AgencyServices"));
const AgencyActivities = lazy(() => import("@/pages/agency/AgencyActivities"));
const AgencyStays = lazy(() => import("@/pages/agency/AgencyStays"));
const AgencyPromotions = lazy(() => import("@/pages/agency/AgencyPromotions"));
const AgencySettings = lazy(() => import("@/pages/agency/AgencySettings"));
const Help = lazy(() => import("@/pages/Help"));
const Support = lazy(() => import("@/pages/Support"));
const Install = lazy(() => import("@/pages/Install"));
const PriceAlerts = lazy(() => import("@/pages/PriceAlerts"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));
const SubscriptionPayment = lazy(() => import("@/pages/SubscriptionPayment"));
const PaymentTest = lazy(() => import("@/pages/PaymentTest"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  </div>
);

/**
 * AnimatedRoutes - Routes avec transitions Framer Motion
 * Utilise AnimatePresence pour animer les entrées/sorties de pages
 */
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/home" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/flights" element={<PageTransition><Flights /></PageTransition>} />
          <Route path="/hotels" element={<PageTransition><Hotels /></PageTransition>} />
          <Route path="/cars" element={<PageTransition><Cars /></PageTransition>} />
          <Route path="/tours" element={<PageTransition><Tours /></PageTransition>} />
          <Route path="/destinations" element={<PageTransition><Destinations /></PageTransition>} />
          <Route path="/destinations/:id" element={<PageTransition><DestinationDetail /></PageTransition>} />
          <Route path="/activities" element={<PageTransition><Activities /></PageTransition>} />
          <Route path="/stays" element={<PageTransition><Stays /></PageTransition>} />
          <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
          <Route path="/trains" element={<PageTransition><Trains /></PageTransition>} />
          <Route path="/flight-hotel" element={<PageTransition><FlightHotel /></PageTransition>} />
          <Route path="/flight-hotel/booking" element={<PageTransition><FlightHotelBookingProcess /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/booking-history" element={<PageTransition><BookingHistory /></PageTransition>} />
          <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
          <Route path="/payment" element={<PageTransition><Payment /></PageTransition>} />
          <Route path="/confirmation" element={<PageTransition><Confirmation /></PageTransition>} />
          <Route path="/flight-comparison" element={<PageTransition><FlightComparison /></PageTransition>} />
          <Route path="/booking-process" element={<PageTransition><FlightBookingProcess /></PageTransition>} />
          <Route path="/booking/:serviceType" element={<PageTransition><UnifiedBookingProcess /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="/admin/bookings" element={<PageTransition><AdminBookings /></PageTransition>} />
          <Route path="/admin/services" element={<PageTransition><AdminServices /></PageTransition>} />
          <Route path="/admin/activities" element={<PageTransition><AdminActivities /></PageTransition>} />
          <Route path="/admin/stays" element={<PageTransition><AdminStays /></PageTransition>} />
          <Route path="/admin/users" element={<PageTransition><AdminUsers /></PageTransition>} />
          <Route path="/admin/subscriptions" element={<PageTransition><AdminSubscriptions /></PageTransition>} />
          <Route path="/admin/subscription-plans" element={<PageTransition><AdminSubscriptionPlans /></PageTransition>} />
          <Route path="/admin/promotions" element={<PageTransition><AdminPromotions /></PageTransition>} />
          <Route path="/admin/email-templates" element={<PageTransition><AdminEmailTemplates /></PageTransition>} />
          <Route path="/admin/configuration" element={<PageTransition><AdminConfiguration /></PageTransition>} />
          <Route path="/admin/agencies" element={<PageTransition><AdminAgencies /></PageTransition>} />
          <Route path="/admin/commissions" element={<PageTransition><AdminCommissions /></PageTransition>} />
          <Route path="/agency" element={<PageTransition><AgencyDashboard /></PageTransition>} />
          <Route path="/agency/services" element={<PageTransition><AgencyServices /></PageTransition>} />
          <Route path="/agency/activities" element={<PageTransition><AgencyActivities /></PageTransition>} />
          <Route path="/agency/stays" element={<PageTransition><AgencyStays /></PageTransition>} />
          <Route path="/agency/promotions" element={<PageTransition><AgencyPromotions /></PageTransition>} />
          <Route path="/agency/settings" element={<PageTransition><AgencySettings /></PageTransition>} />
          <Route path="/help" element={<PageTransition><Help /></PageTransition>} />
          <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
          <Route path="/install" element={<PageTransition><Install /></PageTransition>} />
          <Route path="/price-alerts" element={<PageTransition><PriceAlerts /></PageTransition>} />
          <Route path="/subscriptions" element={<PageTransition><Subscriptions /></PageTransition>} />
          <Route path="/subscription-payment" element={<PageTransition><SubscriptionPayment /></PageTransition>} />
          <Route path="/payment-test" element={<PageTransition><PaymentTest /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
