import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                Voyage<span className="text-primary">CI</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Votre partenaire de confiance pour des voyages inoubliables en Côte d'Ivoire et dans toute l'Afrique de l'Ouest.
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
            <h3 className="font-bold text-foreground mb-4">Nos Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/hotels" className="text-muted-foreground hover:text-primary transition-smooth">
                  Réservation d'Hôtels
                </Link>
              </li>
              <li>
                <Link to="/tours" className="text-muted-foreground hover:text-primary transition-smooth">
                  Circuits Touristiques
                </Link>
              </li>
              <li>
                <Link to="/cars" className="text-muted-foreground hover:text-primary transition-smooth">
                  Location de Voitures
                </Link>
              </li>
              <li>
                <Link to="/flights" className="text-muted-foreground hover:text-primary transition-smooth">
                  Réservation de Vols
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-muted-foreground hover:text-primary transition-smooth">
                  Événements
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-smooth">
                  À Propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-smooth">
                  Nous Contacter
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-smooth">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-smooth">
                  Conditions d'Utilisation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-smooth">
                  Politique de Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Newsletter</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Inscrivez-vous pour recevoir nos offres exclusives et nos dernières actualités.
            </p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input placeholder="Votre email" type="email" className="flex-1" />
                <Button className="gradient-primary shadow-primary">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                En vous inscrivant, vous acceptez notre politique de confidentialité.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 VoyageCI. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-smooth">
              Confidentialité
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-smooth">
              Conditions
            </Link>
            <Link to="/sitemap" className="text-muted-foreground hover:text-primary transition-smooth">
              Plan du Site
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
