import { Shield, Award, Headphones, CreditCard } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Réservation Sécurisée",
    description: "Paiements 100% sécurisés avec protection des données",
  },
  {
    icon: Award,
    title: "Meilleurs Prix Garantis",
    description: "Nous vous garantissons les meilleurs tarifs du marché",
  },
  {
    icon: Headphones,
    title: "Support 24/7",
    description: "Notre équipe est disponible à tout moment pour vous aider",
  },
  {
    icon: CreditCard,
    title: "Paiement Flexible",
    description: "Plusieurs options de paiement adaptées à vos besoins",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {features.slice(0, 3).map((feature, index) => (
            <div
              key={index}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center">
                <feature.icon className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
