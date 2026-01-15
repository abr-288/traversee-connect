import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  Crown, 
  FileCheck, 
  Plane, 
  Check, 
  MessageCircle, 
  ArrowRight,
  Star,
  Shield,
  Clock,
  Users,
  Sparkles,
  Briefcase,
  GraduationCap,
  CalendarDays,
  Heart,
  Loader2,
  CreditCard
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Plans qui nécessitent une demande de contact au lieu d'un paiement direct
const REQUEST_ONLY_PLANS = ["visa", "billets", "events"];

interface SubscriptionPlanDB {
  id: string;
  plan_id: string;
  name: string;
  subtitle: string | null;
  icon: string;
  price: string;
  price_note: string | null;
  features: string[] | null;
  popular: boolean | null;
  color: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Building2: <Building2 className="h-8 w-8" />,
  Crown: <Crown className="h-8 w-8" />,
  FileCheck: <FileCheck className="h-8 w-8" />,
  Plane: <Plane className="h-8 w-8" />,
  Users: <Users className="h-8 w-8" />,
  Briefcase: <Briefcase className="h-8 w-8" />,
  GraduationCap: <GraduationCap className="h-8 w-8" />,
  CalendarDays: <CalendarDays className="h-8 w-8" />,
  Star: <Star className="h-8 w-8" />,
  Heart: <Heart className="h-8 w-8" />,
};

interface DisplayPlan {
  id: string;
  plan_id: string;
  name: string;
  subtitle: string | null;
  icon: React.ReactNode;
  price: string;
  priceNote: string | null;
  features: string[];
  popular: boolean;
  color: string;
}

// Vérifie si le plan nécessite une demande de contact
const isRequestOnlyPlan = (planId: string): boolean => {
  return REQUEST_ONLY_PLANS.includes(planId);
};

export default function Subscriptions() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequestPlan, setSelectedRequestPlan] = useState<DisplayPlan | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        
        const formattedPlans: DisplayPlan[] = (data || []).map((p: SubscriptionPlanDB) => ({
          id: p.id,
          plan_id: p.plan_id,
          name: p.name,
          subtitle: p.subtitle,
          icon: ICON_MAP[p.icon] || <Building2 className="h-8 w-8" />,
          price: p.price,
          priceNote: p.price_note,
          features: p.features || [],
          popular: p.popular || false,
          color: p.color || "from-primary to-primary/80",
        }));
        
        setPlans(formattedPlans);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestPlan) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("subscription_requests")
        .insert({
          plan_id: selectedRequestPlan.plan_id,
          plan_name: selectedRequestPlan.name,
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
      setSelectedRequestPlan(null);
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

  const handleSubscribe = (plan: DisplayPlan) => {
    if (isRequestOnlyPlan(plan.plan_id)) {
      // Ouvrir le formulaire de demande
      setSelectedRequestPlan(plan);
    } else {
      // Rediriger vers la page de paiement
      navigate(`/subscription-payment?planId=${plan.plan_id}`);
    }
  };

  const openWhatsApp = (planName: string) => {
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par l'offre "${planName}" de Bossiz Conciergerie. Pouvez-vous me donner plus d'informations ?`);
    window.open(`https://wa.me/2250700000000?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          
          <motion.div 
            className="container mx-auto px-4 relative z-10"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                {t("subscriptions.badge", "Bossiz Conciergerie")}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                {t("subscriptions.title", "Nos Offres d'Abonnement")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t("subscriptions.subtitle", "Découvrez nos formules adaptées à vos besoins. Voyagez sereinement avec un service premium à votre disposition.")}
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>{t("subscriptions.guaranteed", "Service garanti")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{t("subscriptions.support247", "Assistance 24/7")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{t("subscriptions.clients", "+1000 clients satisfaits")}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Plans Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">{t("subscriptions.noPlans", "Aucun abonnement disponible pour le moment.")}</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
              >
                {plans.map((plan) => (
                  <motion.div key={plan.id} variants={itemVariants}>
                    <Card className={`relative h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                      {plan.popular && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-primary text-primary-foreground">
                            <Star className="w-3 h-3 mr-1" />
                            {t("subscriptions.popular", "Populaire")}
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="pb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4`}>
                          {plan.icon}
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription className="text-sm">{plan.subtitle}</CardDescription>
                        <div className="mt-4">
                          <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                          {plan.priceNote && (
                            <span className="text-xs text-muted-foreground ml-2">{plan.priceNote}</span>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3 text-foreground text-sm">{t("subscriptions.includedServices", "Services inclus :")}</h4>
                          <ul className="space-y-2">
                            {plan.features.slice(0, 6).map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                            {plan.features.length > 6 && (
                              <li className="text-xs text-muted-foreground italic">
                                +{plan.features.length - 6} {t("subscriptions.moreFeatures", "autres avantages...")}
                              </li>
                            )}
                          </ul>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex flex-col gap-3 pt-4">
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={() => handleSubscribe(plan)}
                        >
                          {isRequestOnlyPlan(plan.plan_id) ? (
                            <>
                              {t("subscriptions.requestInfo", "Demander un devis")}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
                              {t("subscriptions.subscribeDirect", "Souscrire maintenant")}
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => openWhatsApp(plan.name)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("subscriptions.needHelp", "Besoin d'aide pour choisir ?")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("subscriptions.contactUs", "Notre équipe est disponible pour vous conseiller et trouver la formule qui correspond parfaitement à vos besoins.")}
            </p>
            <Button 
              size="lg" 
              onClick={() => openWhatsApp("conseil personnalisé")}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {t("subscriptions.contactWhatsApp", "Nous contacter sur WhatsApp")}
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />

      {/* Dialog pour les plans nécessitant une demande */}
      <Dialog open={!!selectedRequestPlan} onOpenChange={(open) => !open && setSelectedRequestPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("subscriptions.subscribeTo", "Souscrire à")} {selectedRequestPlan?.name}</DialogTitle>
            <DialogDescription>
              {t("subscriptions.fillForm", "Remplissez ce formulaire et notre équipe vous contactera rapidement.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="request-name">{t("subscriptions.fullName", "Nom complet")} *</Label>
                <Input
                  id="request-name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-phone">{t("subscriptions.phone", "Téléphone")} *</Label>
                <Input
                  id="request-phone"
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-email">{t("subscriptions.email", "Email")} *</Label>
              <Input
                id="request-email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-company">{t("subscriptions.company", "Entreprise")}</Label>
              <Input
                id="request-company"
                value={contactForm.company}
                onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-message">{t("subscriptions.messageOptional", "Message (optionnel)")}</Label>
              <Textarea
                id="request-message"
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
    </div>
  );
}