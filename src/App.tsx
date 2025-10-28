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
import FlightHotel from "./pages/FlightHotel";
import Stays from "./pages/Stays";
import Activities from "./pages/Activities";
import Support from "./pages/Support";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Payment from "./pages/Payment";
import BookingHistory from "./pages/BookingHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/flight-hotel" element={<FlightHotel />} />
          <Route path="/stays" element={<Stays />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/support" element={<Support />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/payment" element={<Payment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
