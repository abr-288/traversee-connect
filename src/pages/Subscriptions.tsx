import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  CreditCard,
  Zap,
  ChevronRight
} from "lucide-react";

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
  Building2: <Building2 className="h-6 w-6" />,
  Crown: <Crown className="h-6 w-6" />,
  FileCheck: <FileCheck className="h-6 w-6" />,
  Plane: <Plane className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  Briefcase: <Briefcase className="h-6 w-6" />,
  GraduationCap: <GraduationCap className="h-6 w-6" />,
  CalendarDays: <CalendarDays className="h-6 w-6" />,
  Star: <Star className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
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

const isRequestOnlyPlan = (planId: string): boolean => {
  return REQUEST_ONLY_PLANS.includes(planId);
};

// Couleurs de gradient pour chaque plan
const GRADIENT_COLORS = [
  "from-violet-500 via-purple-500 to-fuchsia-500",
  "from-amber-500 via-orange-500 to-red-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-blue-500 via-indigo-500 to-violet-500",
  "from-rose-500 via-pink-500 to-fuchsia-500",
  "from-lime-500 via-green-500 to-emerald-500",
  "from-sky-500 via-blue-500 to-indigo-500",
  "from-orange-500 via-amber-500 to-yellow-500",
];

export default function Subscriptions() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequestPlan, setSelectedRequestPlan] = useState<DisplayPlan | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
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
        
        const formattedPlans: DisplayPlan[] = (data || []).map((p: SubscriptionPlanDB, index: number) => ({
          id: p.id,
          plan_id: p.plan_id,
          name: p.name,
          subtitle: p.subtitle,
          icon: ICON_MAP[p.icon] || <Building2 className="h-6 w-6" />,
          price: p.price,
          priceNote: p.price_note,
          features: p.features || [],
          popular: p.popular || false,
          color: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
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
    
      setContactForm({ name: "", email: "", phone: "", company: "", message: "" });
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
      setSelectedRequestPlan(plan);
    } else {
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
        {/* Hero Section - Style glassmorphism */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6"
              >
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t("subscriptions.badge", "Bossiz Conciergerie")}</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">
                  {t("subscriptions.heroTitle1", "Voyagez")}
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {t("subscriptions.heroTitle2", "Sans Limites")}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                {t("subscriptions.subtitle", "Découvrez nos formules adaptées à vos besoins. Voyagez sereinement avec un service premium à votre disposition.")}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                {[
                  { icon: Shield, label: t("subscriptions.guaranteed", "Service garanti"), value: "100%" },
                  { icon: Clock, label: t("subscriptions.support247", "Assistance"), value: "24/7" },
                  { icon: Users, label: t("subscriptions.clients", "Clients satisfaits"), value: "1000+" },
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 text-primary">
                      <stat.icon className="w-5 h-5" />
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Plans Section - Innovative Grid */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">{t("subscriptions.noPlans", "Aucun abonnement disponible pour le moment.")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div 
                      className={`relative group rounded-3xl overflow-hidden transition-all duration-500 ${
                        expandedPlan === plan.id ? 'ring-2 ring-primary shadow-2xl' : 'hover:shadow-xl'
                      }`}
                    >
                      {/* Gradient border effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${plan.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                      
                      {/* Card content */}
                      <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          {/* Icon & Title */}
                          <div className="flex items-start gap-4 lg:w-1/3">
                            <div className={`relative flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shadow-lg`}>
                              {plan.icon}
                              {plan.popular && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                                {plan.popular && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    {t("subscriptions.popular", "Populaire")}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{plan.subtitle}</p>
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="lg:w-1/4 lg:text-center">
                            <div className="flex items-baseline gap-1 lg:justify-center">
                              <span className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                                {plan.price}
                              </span>
                            </div>
                            {plan.priceNote && (
                              <span className="text-xs text-muted-foreground">{plan.priceNote}</span>
                            )}
                          </div>
                          
                          {/* Quick features preview */}
                          <div className="hidden md:flex lg:w-1/4 flex-wrap gap-2">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground"
                              >
                                <Check className="w-3 h-3 text-primary" />
                                <span className="truncate max-w-[120px]">{feature}</span>
                              </span>
                            ))}
                            {plan.features.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 text-xs text-muted-foreground">
                                +{plan.features.length - 3}
                              </span>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-3 lg:w-auto lg:ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                              className="text-muted-foreground"
                            >
                              {expandedPlan === plan.id ? t("common.showLess", "Moins") : t("common.showMore", "Détails")}
                              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${expandedPlan === plan.id ? 'rotate-90' : ''}`} />
                            </Button>
                            <Button 
                              onClick={() => handleSubscribe(plan)}
                              className={`bg-gradient-to-r ${plan.color} hover:opacity-90 text-white border-0`}
                            >
                              {isRequestOnlyPlan(plan.plan_id) ? (
                                <>
                                  {t("subscriptions.requestInfo", "Demander un devis")}
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  {t("subscriptions.subscribe", "Souscrire")}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Expanded content */}
                        <AnimatePresence>
                          {expandedPlan === plan.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-6 mt-6 border-t border-border/50">
                                <h4 className="font-semibold mb-4 text-foreground">
                                  {t("subscriptions.includedServices", "Services inclus :")}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {plan.features.map((feature, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="flex items-start gap-2 p-3 rounded-xl bg-muted/30"
                                    >
                                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                      <span className="text-sm text-foreground">{feature}</span>
                                    </motion.div>
                                  ))}
                                </div>
                                
                                <div className="flex flex-wrap gap-3 mt-6">
                                  <Button 
                                    size="lg"
                                    onClick={() => handleSubscribe(plan)}
                                    className={`bg-gradient-to-r ${plan.color} hover:opacity-90 text-white border-0`}
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
                                    size="lg"
                                    onClick={() => openWhatsApp(plan.name)}
                                  >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    WhatsApp
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section - Modern gradient */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm">{t("subscriptions.needHelpBadge", "Assistance personnalisée")}</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {t("subscriptions.needHelp", "Besoin d'aide pour choisir ?")}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                {t("subscriptions.contactUs", "Notre équipe est disponible pour vous conseiller et trouver la formule qui correspond parfaitement à vos besoins.")}
              </p>
              
              <Button 
                size="lg" 
                onClick={() => openWhatsApp("conseil personnalisé")}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("subscriptions.contactWhatsApp", "Nous contacter sur WhatsApp")}
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />

      {/* Contact Dialog */}
      <Dialog open={!!selectedRequestPlan} onOpenChange={(open) => !open && setSelectedRequestPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${selectedRequestPlan?.color || ''} flex items-center justify-center text-white`}>
                {selectedRequestPlan?.icon}
              </div>
              {selectedRequestPlan?.name}
            </DialogTitle>
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
            <Button 
              type="submit" 
              className={`w-full bg-gradient-to-r ${selectedRequestPlan?.color || 'from-primary to-primary'} text-white`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("subscriptions.sending", "Envoi en cours...")}
                </>
              ) : (
                t("subscriptions.sendRequest", "Envoyer ma demande")
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
