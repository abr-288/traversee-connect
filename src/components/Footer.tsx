import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { useState } from "react";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");
  const { subscribe, loading } = useNewsletterSubscribe();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    const result = await subscribe(email);
    
    if (result) {
      toast.success(result.message || "Inscription réussie !");
      setEmail("");
    } else {
      toast.error("Erreur lors de l'inscription");
    }
  };

  return (
    <footer className="bg-primary border-t border-primary-light">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoLight} alt="Bossiz Logo" className="h-12 w-auto" />
              <span className="text-2xl font-bold text-white">Bossiz</span>
            </div>
            <p className="text-white/80 text-sm">
              Votre partenaire de confiance pour des voyages inoubliables à travers le monde.
            </p>
            <div className="flex gap-3">
              <Button size="icon" variant="outline" className="rounded-full">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-white mb-4">Nos Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/flights" className="text-white/80 hover:text-secondary transition-smooth">
                  Vols
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="text-white/80 hover:text-secondary transition-smooth">
                  Hôtels
                </Link>
              </li>
              <li>
                <Link to="/flight-hotel" className="text-white/80 hover:text-secondary transition-smooth">
                  Vol + Hôtel
                </Link>
              </li>
              <li>
                <Link to="/cars" className="text-white/80 hover:text-secondary transition-smooth">
                  Voitures
                </Link>
              </li>
              <li>
                <Link to="/stays" className="text-white/80 hover:text-secondary transition-smooth">
                  Séjours
                </Link>
              </li>
              <li>
                <Link to="/activities" className="text-white/80 hover:text-secondary transition-smooth">
                  Activités
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white mb-4">Assistance</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
                  Nous Contacter
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-white/80 hover:text-secondary transition-smooth">
                  Mes Réservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-white mb-4">Newsletter</h3>
            <p className="text-white/80 text-sm mb-4">
              Inscrivez-vous pour recevoir nos offres exclusives et nos dernières actualités.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  placeholder="Votre email" 
                  type="email" 
                  className="flex-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-primary" disabled={loading}>
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-white/70">
                En vous inscrivant, vous acceptez notre politique de confidentialité.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-light flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/80 text-sm">
            © 2025 Bossiz. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
              À propos
            </Link>
            <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
              Conditions générales
            </Link>
            <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
              Confidentialité
            </Link>
            <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
              Aide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
