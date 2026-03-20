import { Shield, Award, Headphones } from "lucide-react";
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
    <section className="py-10 md:py-14 bg-background w-full">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">{t(feature.titleKey)}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(feature.descriptionKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
