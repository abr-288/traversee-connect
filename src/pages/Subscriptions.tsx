import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  Phone,
  Mail,
  ArrowRight,
  Star,
  Shield,
  Clock,
  Users,
  Sparkles
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

interface SubscriptionPlan {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  price: string;
  priceNote?: string;
  features: string[];
  advantages: string[];
  popular?: boolean;
  color: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "corporate",
    name: "Corporate Mensuelle",
    subtitle: "Pour les entreprises",
    icon: <Building2 className="h-8 w-8" />,
    price: "150 000 - 300 000 FCFA",
    priceNote: "par mois selon la taille",
    features: [
      "Gestion complète des réservations de billets",
      "Recherches de tarifs optimisés",
      "Options (blocage de tarif, pré-réservation)",
      "Modifications, reports, demandes spéciales",
      "Suivi voyage et assistance 7j/7",
      "Négociation de tarifs corporate",
      "Gestion du budget voyage",
      "Assistance visa complète",
      "Réservations hôtels & transferts",
      "Conciergerie business",
      "Support prioritaire 7j/7",
      "Gestionnaire dédié Bossiz"
    ],
    advantages: [
      "Suppression totale de la charge administrative",
      "Réduction des coûts grâce à nos outils pro",
      "Accès prioritaire, délais réduits",
      "Suivi centralisé des dépenses",
      "Un seul point de contact, zéro stress"
    ],
    popular: true,
    color: "from-primary to-primary/80"
  },
  {
    id: "premium",
    name: "Premium VIP",
    subtitle: "Abonnement individuel",
    icon: <Crown className="h-8 w-8" />,
    price: "20 000 - 35 000 FCFA",
    priceNote: "par mois",
    features: [
      "Réservations prioritaires",
      "Traitement express visas",
      "Assistance 24/7",
      "Gestion de voyage ultra-personnalisée",
      "Alertes et bons plans exclusifs",
      "Accès aux offres VIP"
    ],
    advantages: [
      "Jamais de stress pour les voyages",
      "Service VIP personnalisé",
      "Réduction du prix global des billets",
      "Assistance pro en cas de problème"
    ],
    color: "from-amber-500 to-amber-600"
  },
  {
    id: "visa",
    name: "Assistance Visa+",
    subtitle: "Personnes & Entreprises",
    icon: <FileCheck className="h-8 w-8" />,
    price: "Sur devis",
    priceNote: "selon la destination",
    features: [
      "Constitution du dossier complet",
      "Vérification de conformité",
      "Prise de rendez-vous ambassade",
      "Coaching entretien ambassade",
      "Suivi prioritaire du dossier",
      "Assistance jusqu'à la délivrance"
    ],
    advantages: [
      "Dossier sécurisé et conforme",
      "Zéro erreur administrative",
      "Gain de temps considérable",
      "Suivi dédié personnalisé"
    ],
    color: "from-emerald-500 to-emerald-600"
  },
  {
    id: "billets",
    name: "Billets Pro & Famille",
    subtitle: "Tarifs négociés",
    icon: <Plane className="h-8 w-8" />,
    price: "Jusqu'à -18%",
    priceNote: "sur les tarifs publics",
    features: [
      "Accès aux tarifs professionnels",
      "Options flexibles (modification, bagages)",
      "Support avant/pendant/après voyage",
      "Recherche multicanal automatisée",
      "Réservation groupes et familles",
      "Négociation des meilleurs prix"
    ],
    advantages: [
      "Économies significatives garanties",
      "Flexibilité maximale",
      "Accompagnement complet",
      "Accès à tous les vols"
    ],
    color: "from-blue-500 to-blue-600"
  }
];

export default function Subscriptions() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    plan: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState<string | null>(null);

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
        title: "Demande envoyée !",
        description: "Notre équipe vous contactera dans les plus brefs délais.",
      });
    
      setContactForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        plan: "",
        message: ""
      });
      setOpenDialog(null);
    } catch (error: any) {
      console.error("Error submitting subscription request:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
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
                Bossiz Conciergerie
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                Nos Offres d'Abonnement
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Découvrez nos formules adaptées à vos besoins. Voyagez sereinement avec un service premium à votre disposition.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Service garanti</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Assistance 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>+1000 clients satisfaits</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Plans Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {subscriptionPlans.map((plan) => (
                <motion.div key={plan.id} variants={itemVariants}>
                  <Card className={`relative h-full overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                    {plan.popular && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Populaire
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4`}>
                        {plan.icon}
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-base">{plan.subtitle}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                        {plan.priceNote && (
                          <span className="text-sm text-muted-foreground ml-2">{plan.priceNote}</span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-foreground">Services inclus :</h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3 text-foreground">Vos avantages :</h4>
                        <ul className="space-y-2">
                          {plan.advantages.map((advantage, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span className="text-foreground">{advantage}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex flex-col gap-3 pt-6">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full" 
                            size="lg"
                            onClick={() => setSelectedPlan(plan.id)}
                          >
                            Souscrire maintenant
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Souscrire à {plan.name}</DialogTitle>
                            <DialogDescription>
                              Remplissez ce formulaire et notre équipe vous contactera rapidement.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={(e) => handleContactSubmit(e, plan)} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Nom complet *</Label>
                                <Input
                                  id="name"
                                  value={contactForm.name}
                                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone *</Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  value={contactForm.phone}
                                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                                required
                              />
                            </div>
                            {plan.id === "corporate" && (
                              <div className="space-y-2">
                                <Label htmlFor="company">Entreprise</Label>
                                <Input
                                  id="company"
                                  value={contactForm.company}
                                  onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                                />
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label htmlFor="message">Message (optionnel)</Label>
                              <Textarea
                                id="message"
                                value={contactForm.message}
                                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                                placeholder="Précisez vos besoins..."
                                rows={3}
                              />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                              {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => openWhatsApp(plan.name)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Nous contacter sur WhatsApp
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-12 md:py-16 mt-8 md:mt-12 border-t border-border/50 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Besoin d'une offre sur mesure ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Notre équipe est à votre disposition pour créer une offre personnalisée adaptée à vos besoins spécifiques.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" onClick={() => openWhatsApp("Offre personnalisée")}>
                  <Phone className="w-4 h-4 mr-2" />
                  Appelez-nous
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:contact@bossiz.com">
                    <Mail className="w-4 h-4 mr-2" />
                    contact@bossiz.com
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
