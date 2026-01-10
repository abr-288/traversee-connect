import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Sparkles, ArrowRight, Percent, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * PromoBanner - Bannière publicitaire animée
 * Design premium avec effet de gradient et animations
 */
const PromoBanner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-secondary via-secondary/90 to-primary"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Animated sparkles */}
        <div className="absolute top-1 left-[10%] animate-pulse">
          <Sparkles className="w-3 h-3 text-white/60" />
        </div>
        <div className="absolute bottom-1 right-[15%] animate-pulse" style={{ animationDelay: '0.5s' }}>
          <Sparkles className="w-4 h-4 text-white/50" />
        </div>
        <div className="absolute top-2 right-[30%] animate-pulse" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-2.5 h-2.5 text-white/40" />
        </div>

        <div className="site-container relative">
          <div className="flex items-center justify-between py-2 sm:py-2.5 gap-2 sm:gap-4">
            {/* Content */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              {/* Icon badge */}
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm shrink-0">
                <Percent className="w-4 h-4 text-white" />
              </div>

              {/* Text */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/20 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wide shrink-0">
                    Promo
                  </span>
                  <span className="text-white font-semibold text-xs sm:text-sm truncate">
                    -20% sur tous les vols
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-white/80">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="text-[10px] sm:text-xs truncate">
                    Offre limitée jusqu'au 31 janvier
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/flights')}
              className="shrink-0 h-7 sm:h-8 px-2.5 sm:px-4 text-[10px] sm:text-xs font-semibold bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              <span className="hidden sm:inline">En profiter</span>
              <span className="sm:hidden">Voir</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>

            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Fermer la bannière"
            >
              <X className="w-4 h-4 text-white/70 hover:text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromoBanner;
