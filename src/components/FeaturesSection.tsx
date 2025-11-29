import { Shield, Award, Headphones, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      titleKey: "features.secureBooking.title",
      descriptionKey: "features.secureBooking.description",
    },
    {
      icon: Award,
      titleKey: "features.bestPrices.title",
      descriptionKey: "features.bestPrices.description",
    },
    {
      icon: Headphones,
      titleKey: "features.support247.title",
      descriptionKey: "features.support247.description",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-background w-full">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center">
                <feature.icon className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground">{t(feature.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
