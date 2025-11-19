import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MessageCircle, Clock, HelpCircle } from "lucide-react";
import { useSupportMessage } from "@/hooks/useSupportMessage";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";
import { UnifiedForm, UnifiedFormField, UnifiedSubmitButton } from "@/components/forms";
import { Textarea } from "@/components/ui/textarea";

const Support = () => {
  const { sendMessage, loading: sendingMessage } = useSupportMessage();
  const { subscribe, loading: subscribing } = useNewsletterSubscribe();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bookingReference: "",
    subject: "",
    message: ""
  });
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await sendMessage(formData);
    if (success) {
      setFormData({
        name: "",
        email: "",
        bookingReference: "",
        subject: "",
        message: ""
      });
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await subscribe(newsletterEmail);
    if (result) {
      toast({
        title: "Inscription réussie",
        description: result.message,
      });
      setNewsletterEmail("");
    }
  };

  const handleChatClick = () => {
    toast({
      title: "Chat en direct",
      description: "Le chat sera bientôt disponible. En attendant, envoyez-nous un message via le formulaire.",
    });
  };
  const faqs = [
    {
      question: "Comment puis-je modifier ma réservation ?",
      answer: "Vous pouvez modifier votre réservation en vous connectant à votre compte et en accédant à 'Mes Réservations'. Cliquez sur la réservation concernée et sélectionnez 'Modifier'. Notez que des frais peuvent s'appliquer selon les conditions tarifaires."
    },
    {
      question: "Quels sont les moyens de paiement acceptés ?",
      answer: "Nous acceptons les cartes bancaires (Visa, Mastercard), Mobile Money (Orange Money, MTN Money, Moov Money), et les virements bancaires. Le paiement en espèces est possible dans nos agences."
    },
    {
      question: "Comment obtenir un remboursement ?",
      answer: "Les demandes de remboursement doivent être soumises via votre compte dans un délai de 24h après l'annulation. Le délai de traitement est de 7 à 14 jours ouvrables selon votre banque."
    },
    {
      question: "Puis-je voyager avec des enfants ?",
      answer: "Oui, les enfants sont les bienvenus. Des tarifs réduits sont disponibles pour les enfants de moins de 12 ans. Certains services offrent la gratuité pour les enfants de moins de 2 ans."
    },
    {
      question: "Quels documents sont nécessaires pour voyager ?",
      answer: "Pour les vols internationaux, un passeport valide est obligatoire. Selon la destination, un visa peut être requis. Pour les vols domestiques, une carte d'identité suffit. Consultez notre guide des destinations pour plus d'informations."
    },
    {
      question: "Que faire en cas de retard ou d'annulation de vol ?",
      answer: "En cas de retard ou d'annulation, contactez immédiatement notre service client disponible 24/7. Nous vous assisterons pour trouver une solution alternative ou traiter votre remboursement."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Centre d'Assistance</h1>
          <p className="text-muted-foreground text-lg">
            Nous sommes là pour vous aider 24h/24 et 7j/7
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Appelez-nous</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Disponible 24h/24 et 7j/7
              </p>
              <p className="font-bold text-primary text-xl">+225 27 20 00 00 00</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Écrivez-nous</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Réponse sous 24h
              </p>
              <p className="font-bold text-secondary">support@bossiz.com</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-lg mb-2">Chat en direct</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Réponse instantanée
              </p>
              <Button className="gradient-primary shadow-primary" onClick={handleChatClick}>
                Démarrer le chat
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Questions Fréquentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Envoyez-nous un message</CardTitle>
              </CardHeader>
              <CardContent>
                <UnifiedForm onSubmit={handleSubmit} variant="contact" loading={sendingMessage}>
                  <UnifiedFormField
                    label="Nom complet"
                    name="name"
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <UnifiedFormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <UnifiedFormField
                    label="Numéro de réservation (optionnel)"
                    name="bookingReference"
                    placeholder="Ex: BK123456"
                    value={formData.bookingReference}
                    onChange={(e) => setFormData({...formData, bookingReference: e.target.value})}
                  />
                  <UnifiedFormField
                    label="Sujet"
                    name="subject"
                    placeholder="Objet de votre demande"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Message</label>
                    <Textarea 
                      placeholder="Décrivez votre problème ou votre question..." 
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                      className="w-full"
                    />
                  </div>
                  <UnifiedSubmitButton loading={sendingMessage} fullWidth>
                    Envoyer le message
                  </UnifiedSubmitButton>
                </UnifiedForm>
              </CardContent>
            </Card>

            {/* Horaires */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Horaires d'ouverture</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Support téléphonique :</strong> 24h/24 et 7j/7</p>
                      <p><strong>Agences :</strong> Lun-Ven 8h-18h, Sam 9h-13h</p>
                      <p><strong>Chat en ligne :</strong> 24h/24 et 7j/7</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-8">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-2xl font-bold mb-4">Inscrivez-vous à notre newsletter</h3>
                <p className="text-muted-foreground mb-6">
                  Recevez nos meilleures offres et conseils de voyage directement dans votre boîte mail
                </p>
                <UnifiedForm onSubmit={handleNewsletterSubmit} variant="contact" loading={subscribing} className="flex gap-4">
                  <UnifiedFormField
                    name="email"
                    type="email"
                    placeholder="Votre adresse email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <UnifiedSubmitButton loading={subscribing}>
                    S'inscrire
                  </UnifiedSubmitButton>
                </UnifiedForm>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
