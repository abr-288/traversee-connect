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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pourquoi Nous Choisir ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profitez d'une expérience de réservation simple, sécurisée et avantageuse
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group text-center p-8 rounded-2xl border border-border hover:border-primary transition-smooth hover:shadow-lg"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary transition-smooth">
                <feature.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-smooth" />
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
