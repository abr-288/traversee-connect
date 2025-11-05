import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrainSearchForm } from "@/components/TrainSearchForm";
import { Train } from "lucide-react";
import { useTranslation } from "react-i18next";

const Trains = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Train className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('nav.trains')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trouvez les meilleurs trajets en train pour vos voyages à travers le monde
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <TrainSearchForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Trains;
