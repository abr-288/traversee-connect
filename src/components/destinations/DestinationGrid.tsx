import { motion } from "framer-motion";
import { Loader2, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DestinationCard } from "./DestinationCard";
import { Destination } from "@/hooks/useDestinations";

interface DestinationGridProps {
  destinations: Destination[];
  isLoading: boolean;
  isError?: boolean;
  onRefresh?: () => void;
  variant?: "default" | "featured";
  emptyMessage?: string;
}

export const DestinationGrid = ({
  destinations,
  isLoading,
  isError,
  onRefresh,
  variant = "default",
  emptyMessage = "Aucune destination trouvée",
}: DestinationGridProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
          <Loader2 className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-muted-foreground font-medium">Chargement des destinations...</p>
          <p className="text-sm text-muted-foreground/70">Recherche via TripAdvisor API</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 gap-4"
      >
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="text-center">
          <p className="text-foreground font-medium mb-1">Erreur de chargement</p>
          <p className="text-sm text-muted-foreground mb-4">
            Impossible de charger les destinations
          </p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  if (!destinations || destinations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 gap-4"
      >
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-foreground font-medium mb-1">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground">
            Essayez une autre recherche ou catégorie
          </p>
        </div>
      </motion.div>
    );
  }

  const gridClass = variant === "featured"
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={gridClass}
    >
      {destinations.map((destination, index) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          index={index}
          variant={variant === "featured" ? "featured" : "default"}
        />
      ))}
    </motion.div>
  );
};
