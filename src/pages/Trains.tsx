import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrainBanner } from "@/components/TrainBanner";
import { TrainResults } from "@/components/TrainResults";
import { useTranslation } from "react-i18next";

const Trains = () => {
  const { t } = useTranslation();
  const [searchResults, setSearchResults] = useState<any>(null);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="container mx-auto px-4 py-8">
        <TrainBanner />
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {searchResults && <TrainResults trains={searchResults.trains} />}
      </main>
      
      <Footer />
    </div>
  );
};

export default Trains;
