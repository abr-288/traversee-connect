import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, Crown, FileCheck, Plane, Check, MessageCircle, ArrowRight,
  Star, Shield, Clock, Users, Sparkles, Briefcase, GraduationCap,
  CalendarDays, Heart, Loader2, CreditCard, Zap
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

const isRequestOnlyPlan = (planId: string): boolean => REQUEST_ONLY_PLANS.includes(planId);

const PLAN_COLORS = [
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800" },
  { bg: "from-amber-500 to-orange-600", light: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  { bg: "from-blue-500 to-indigo-600", light: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  { bg: "from-rose-500 to-pink-600", light: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
  { bg: "from-cyan-500 to-sky-600", light: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800" },
  { bg: "from-fuchsia-500 to-purple-600", light: "bg-fuchsia-50 dark:bg-fuchsia-950/30", text: "text-fuchsia-600 dark:text-fuchsia-400", border: "border-fuchsia-200 dark:border-fuchsia-800" },
  { bg: "from-lime-500 to-green-600", light: "bg-lime-50 dark:bg-lime-950/30", text: "text-lime-600 dark:text-lime-400", border: "border-lime-200 dark:border-lime-800" },
];

export default function Subscriptions() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequestPlan, setSelectedRequestPlan] = useState<DisplayPlan | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
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
          color: PLAN_COLORS[index % PLAN_COLORS.length].bg,
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
      toast({ title: t("subscriptions.requestSent", "Demande envoyée !"), description: t("subscriptions.contactSoon", "Notre équipe vous contactera dans les plus brefs délais.") });
      setContactForm({ name: "", email: "", phone: "", company: "", message: "" });
      setSelectedRequestPlan(null);
    } catch {
      toast({ title: t("common.error", "Erreur"), description: t("common.tryAgain", "Une erreur est survenue. Veuillez réessayer."), variant: "destructive" });
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

  const getColorSet = (index: number) => PLAN_COLORS[index % PLAN_COLORS.length];

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="pt-14 lg:pt-24">
        {/* Hero - Clean & compact */}
        <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-light">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-secondary rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
          </div>
          
          <div className="site-container relative z-10">
            <motion.div 
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-4">
                <Zap className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-medium text-white/90">{t("subscriptions.badge", "Bossiz Conciergerie")}</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
                {t("subscriptions.heroTitle1", "Nos Abonnements")}
              </h1>
              
              <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto mb-8">
                {t("subscriptions.subtitle", "Découvrez nos formules adaptées à vos besoins.")}
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                {[
                  { icon: Shield, value: "100%", label: t("subscriptions.guaranteed", "Garanti") },
                  { icon: Clock, value: "24/7", label: t("subscriptions.support247", "Assistance") },
                  { icon: Users, value: "1000+", label: t("subscriptions.clients", "Clients") },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    className="flex flex-col items-center gap-0.5"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-1.5 text-secondary">
                      <stat.icon className="w-4 h-4" />
                      <span className="text-xl font-bold text-white">{stat.value}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-white/60">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Plans Grid - Card boxes */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="site-container">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">{t("subscriptions.noPlans", "Aucun abonnement disponible.")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {plans.map((plan, index) => {
                  const colors = getColorSet(index);
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                    >
                      <Card className={`group relative h-full overflow-hidden border ${colors.border} hover:shadow-xl transition-all duration-300 rounded-2xl ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                        {/* Popular ribbon */}
                        {plan.popular && (
                          <div className="absolute top-0 right-0 z-10">
                            <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              {t("subscriptions.popular", "Populaire")}
                            </div>
                          </div>
                        )}

                        {/* Header with gradient icon */}
                        <div className={`p-4 sm:p-5 ${colors.light}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shadow-md`}>
                              {plan.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-foreground text-sm sm:text-base leading-tight truncate">{plan.name}</h3>
                              {plan.subtitle && (
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{plan.subtitle}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-xl sm:text-2xl font-extrabold ${colors.text}`}>
                              {plan.price}
                            </span>
                            {plan.priceNote && (
                              <span className="text-[10px] text-muted-foreground">{plan.priceNote}</span>
                            )}
                          </div>
                        </div>

                        <CardContent className="p-4 sm:p-5 pt-0 flex flex-col flex-1">
                          {/* Features list */}
                          <ul className="space-y-2 flex-1 mt-3">
                            {plan.features.slice(0, 5).map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className={`flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mt-0.5`}>
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                                <span className="text-xs text-muted-foreground leading-relaxed">{feature}</span>
                              </li>
                            ))}
                            {plan.features.length > 5 && (
                              <li className="text-xs text-muted-foreground pl-6">
                                +{plan.features.length - 5} {t("subscriptions.moreFeatures", "autres avantages")}
                              </li>
                            )}
                          </ul>

                          {/* Actions */}
                          <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                            <Button 
                              className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white border-0 h-9 text-xs sm:text-sm font-semibold rounded-xl`}
                              onClick={() => handleSubscribe(plan)}
                            >
                              {isRequestOnlyPlan(plan.plan_id) ? (
                                <>
                                  {t("subscriptions.requestInfo", "Demander un devis")}
                                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                                  {t("subscriptions.subscribe", "Souscrire")}
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full h-8 text-xs rounded-xl"
                              onClick={() => openWhatsApp(plan.name)}
                            >
                              <MessageCircle className="w-3 h-3 mr-1.5" />
                              WhatsApp
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
          
          <div className="site-container relative z-10">
            <Card className="border-0 bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-xs">{t("subscriptions.needHelpBadge", "Assistance personnalisée")}</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                  {t("subscriptions.needHelp", "Besoin d'aide pour choisir ?")}
                </h2>
                <p className="text-sm text-white/80 mb-6 max-w-lg mx-auto">
                  {t("subscriptions.contactUs", "Notre équipe est disponible pour vous conseiller.")}
                </p>
                
                <Button 
                  size="lg" 
                  onClick={() => openWhatsApp("conseil personnalisé")}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold rounded-xl"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t("subscriptions.contactWhatsApp", "Nous contacter sur WhatsApp")}
                </Button>
              </CardContent>
            </Card>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="request-name">{t("subscriptions.fullName", "Nom complet")} *</Label>
                <Input id="request-name" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-phone">{t("subscriptions.phone", "Téléphone")} *</Label>
                <Input id="request-phone" type="tel" value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-email">{t("subscriptions.email", "Email")} *</Label>
              <Input id="request-email" type="email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-company">{t("subscriptions.company", "Entreprise")}</Label>
              <Input id="request-company" value={contactForm.company} onChange={(e) => setContactForm({...contactForm, company: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-message">{t("subscriptions.messageOptional", "Message (optionnel)")}</Label>
              <Textarea id="request-message" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} placeholder={t("subscriptions.specifyNeeds", "Précisez vos besoins...")} rows={3} />
            </div>
            <Button 
              type="submit" 
              className={`w-full bg-gradient-to-r ${selectedRequestPlan?.color || 'from-primary to-primary'} text-white rounded-xl`}
              disabled={isSubmitting}
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("subscriptions.sending", "Envoi...")}</> : t("subscriptions.sendRequest", "Envoyer ma demande")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
