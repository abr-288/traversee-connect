import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "Kouadio Marie",
    role: "Voyageuse Régulière",
    rating: 5,
    comment: "Une plateforme exceptionnelle ! J'ai réservé mon séjour à Grand-Bassam en quelques clics. Service impeccable et hôtel magnifique.",
    avatar: "KM",
  },
  {
    id: 2,
    name: "Jean-Baptiste Koffi",
    role: "Entrepreneur",
    rating: 5,
    comment: "Le meilleur service de réservation que j'ai utilisé. Les prix sont compétitifs et le support client est très réactif.",
    avatar: "JK",
  },
  {
    id: 3,
    name: "Aminata Traoré",
    role: "Guide Touristique",
    rating: 5,
    comment: "Je recommande vivement ! La variété des options et la simplicité du processus de réservation sont remarquables.",
    avatar: "AT",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-accent/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ce Que Disent Nos Clients
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des milliers de voyageurs satisfaits partagent leurs expériences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-md hover:shadow-xl transition-smooth">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Quote className="w-10 h-10 text-primary/20" />
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 italic">"{testimonial.comment}"</p>

                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
