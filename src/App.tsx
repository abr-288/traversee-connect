import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Hotels from "./pages/Hotels";
import Tours from "./pages/Tours";
import Cars from "./pages/Cars";
import Flights from "./pages/Flights";
import FlightComparison from "./pages/FlightComparison";
import FlightHotel from "./pages/FlightHotel";
import Trains from "./pages/Trains";
import Events from "./pages/Events";
import Support from "./pages/Support";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmailTemplates from "./pages/AdminEmailTemplates";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import BookingHistory from "./pages/BookingHistory";
import Account from "./pages/Account";
import Help from "./pages/Help";
import Destinations from "./pages/Destinations";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import FlightBookingProcess from "./pages/FlightBookingProcess";
import Activities from "./pages/Activities";
import Stays from "./pages/Stays";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Index />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/flight-comparison" element={<FlightComparison />} />
          <Route path="/flight-hotel" element={<FlightHotel />} />
          <Route path="/trains" element={<Trains />} />
          <Route path="/events" element={<Events />} />
          <Route path="/support" element={<Support />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/account" element={<Account />} />
          <Route path="/help" element={<Help />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/install" element={<Install />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/email-templates" element={<AdminEmailTemplates />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/booking-process" element={<FlightBookingProcess />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/stays" element={<Stays />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
