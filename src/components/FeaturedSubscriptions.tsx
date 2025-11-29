import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Crown, 
  FileCheck, 
  Plane, 
  Check, 
  MessageCircle,
  ArrowRight,
  Star,
  Sparkles
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  price: string;
  priceNote?: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "corporate",
    name: "Corporate Mensuelle",
    subtitle: "Pour les entreprises",
    icon: <Building2 className="h-6 w-6" />,
    price: "150 000 - 300 000 FCFA",
    priceNote: "par mois",
    features: [
      "Gestion complète des réservations",
      "Négociation de tarifs corporate",
      "Support prioritaire 7j/7",
      "Gestionnaire dédié"
    ],
    popular: true,
    color: "from-primary to-primary/80"
  },
  {
    id: "premium",
    name: "Premium VIP",
    subtitle: "Abonnement individuel",
    icon: <Crown className="h-6 w-6" />,
    price: "20 000 - 35 000 FCFA",
    priceNote: "par mois",
    features: [
      "Réservations prioritaires",
      "Traitement express visas",
      "Assistance 24/7",
      "Alertes exclusives"
    ],
    color: "from-amber-500 to-amber-600"
  },
  {
    id: "visa",
    name: "Assistance Visa+",
    subtitle: "Personnes & Entreprises",
    icon: <FileCheck className="h-6 w-6" />,
    price: "Sur devis",
    priceNote: "selon destination",
    features: [
      "Constitution du dossier",
      "Prise de rendez-vous",
      "Coaching entretien",
      "Suivi prioritaire"
    ],
    color: "from-emerald-500 to-emerald-600"
  },
  {
    id: "billets",
    name: "Billets Pro & Famille",
    subtitle: "Tarifs négociés",
    icon: <Plane className="h-6 w-6" />,
    price: "Jusqu'à -18%",
    priceNote: "sur les tarifs publics",
    features: [
      "Tarifs professionnels",
      "Options flexibles",
      "Support complet",
      "Tous les vols"
    ],
    color: "from-blue-500 to-blue-600"
  }
];

const FeaturedSubscriptions = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent, plan: SubscriptionPlan) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("subscription_requests")
        .insert({
          plan_id: plan.id,
          plan_name: plan.name,
          name: contactForm.name.trim(),
          email: contactForm.email.trim(),
          phone: contactForm.phone.trim(),
          company: contactForm.company.trim() || null,
          message: contactForm.message.trim() || null,
        });

      if (error) throw error;
    
      toast({
        title: t("subscriptions.requestSent", "Demande envoyée !"),
        description: t("subscriptions.contactSoon", "Notre équipe vous contactera dans les plus brefs délais."),
      });
    
      setContactForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: ""
      });
    } catch (error: any) {
      console.error("Error submitting subscription request:", error);
      toast({
        title: t("common.error", "Erreur"),
        description: t("common.tryAgain", "Une erreur est survenue. Veuillez réessayer."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = (planName: string) => {
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par l'offre "${planName}" de Bossiz Conciergerie. Pouvez-vous me donner plus d'informations ?`);
    window.open(`https://wa.me/2250700000000?text=${message}`, "_blank");
  };

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 gradient-mesh opacity-40" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold">
              <Sparkles className="w-4 h-4 inline mr-2" />
              {t("subscriptions.badge", "Bossiz Conciergerie")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-4 md:mb-6">
            {t("subscriptions.featuredTitle", "Nos Abonnements")}
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t("subscriptions.featuredSubtitle", "Découvrez nos formules adaptées à vos besoins")}
          </p>
          
          {/* Decorative underline */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-16 h-1 bg-gradient-primary rounded-full" />
            <div className="w-8 h-1 bg-secondary/50 rounded-full" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`group h-full overflow-hidden border-2 border-border/50 hover:border-secondary/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover-lift rounded-2xl bg-gradient-card relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {/* Shine effect overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
                
                {plan.popular && (
                  <div className="absolute top-3 right-3 z-20">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      {t("subscriptions.popular", "Populaire")}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-3`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.subtitle}</CardDescription>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-foreground">{plan.price}</span>
                    {plan.priceNote && (
                      <span className="text-xs text-muted-foreground ml-1">{plan.priceNote}</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 pb-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-2 pt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="sm">
                        {t("subscriptions.subscribe", "Souscrire")}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t("subscriptions.subscribeTo", "Souscrire à")} {plan.name}</DialogTitle>
                        <DialogDescription>
                          {t("subscriptions.fillForm", "Remplissez ce formulaire et notre équipe vous contactera rapidement.")}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => handleContactSubmit(e, plan)} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${plan.id}`}>{t("subscriptions.fullName", "Nom complet")} *</Label>
                            <Input
                              id={`name-${plan.id}`}
                              value={contactForm.name}
                              onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`phone-${plan.id}`}>{t("subscriptions.phone", "Téléphone")} *</Label>
                            <Input
                              id={`phone-${plan.id}`}
                              type="tel"
                              value={contactForm.phone}
                              onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`email-${plan.id}`}>{t("subscriptions.email", "Email")} *</Label>
                          <Input
                            id={`email-${plan.id}`}
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                            required
                          />
                        </div>
                        {plan.id === "corporate" && (
                          <div className="space-y-2">
                            <Label htmlFor={`company-${plan.id}`}>{t("subscriptions.company", "Entreprise")}</Label>
                            <Input
                              id={`company-${plan.id}`}
                              value={contactForm.company}
                              onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor={`message-${plan.id}`}>{t("subscriptions.messageOptional", "Message (optionnel)")}</Label>
                          <Textarea
                            id={`message-${plan.id}`}
                            value={contactForm.message}
                            onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                            placeholder={t("subscriptions.specifyNeeds", "Précisez vos besoins...")}
                            rows={3}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? t("subscriptions.sending", "Envoi en cours...") : t("subscriptions.sendRequest", "Envoyer ma demande")}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => openWhatsApp(plan.name)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    WhatsApp
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/subscriptions')}
            className="gap-2"
          >
            {t("subscriptions.viewAll", "Voir Toutes les Offres")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSubscriptions;
