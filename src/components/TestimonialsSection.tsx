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
    <section className="py-20 md:py-24 lg:py-28 bg-gradient-to-b from-muted/30 via-accent/10 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-mesh opacity-40" />
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14 md:mb-16 animate-slide-up-fade">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold">
              ⭐ Avis Clients
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-6">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
          
          {/* Decorative line */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-16 h-1.5 bg-gradient-primary rounded-full" />
            <div className="w-8 h-1.5 bg-secondary/50 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="group border-2 border-border/50 hover:border-secondary/50 shadow-xl hover:shadow-2xl transition-all duration-500 animate-slide-up-fade hover-lift rounded-2xl bg-gradient-card relative overflow-hidden"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              
              <CardContent className="p-8 md:p-10 relative z-10">
                {/* Quote icon with glow effect */}
                <div className="mb-6 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:animate-pulse-glow">
                    <Quote className="w-8 h-8 text-primary group-hover:text-secondary transition-colors" />
                  </div>
                </div>

                {/* Rating stars with animation */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 fill-secondary text-secondary group-hover:scale-110 transition-transform" 
                      style={{ transitionDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>

                {/* Comment with enhanced typography */}
                <p className="text-muted-foreground group-hover:text-foreground mb-8 italic text-base md:text-lg leading-relaxed transition-colors">
                  "{t(testimonial.commentKey)}"
                </p>

                {/* Author info with enhanced styling */}
                <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                  <Avatar className="w-14 h-14 gradient-primary ring-2 ring-secondary/20 group-hover:ring-secondary transition-all">
                    <AvatarFallback className="gradient-primary text-white font-bold text-lg">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground text-lg">{testimonial.name}</p>
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
