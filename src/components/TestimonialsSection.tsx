import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

const TestimonialsSection = () => {
  const { t } = useTranslation();
  
  const testimonials = [
    {
      id: 1,
      name: "Kouadio Marie",
      roleKey: "testimonials.traveler",
      rating: 5,
      commentKey: "testimonials.comment1",
      avatar: "KM",
    },
    {
      id: 2,
      name: "Jean-Baptiste Koffi",
      roleKey: "testimonials.entrepreneur",
      rating: 5,
      commentKey: "testimonials.comment2",
      avatar: "JK",
    },
    {
      id: 3,
      name: "Aminata Traoré",
      roleKey: "testimonials.guide",
      rating: 5,
      commentKey: "testimonials.comment3",
      avatar: "AT",
    },
  ];

  return (
    <section className="py-20 bg-accent/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
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

                <p className="text-muted-foreground mb-6 italic">"{t(testimonial.commentKey)}"</p>

                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{t(testimonial.roleKey)}</p>
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
