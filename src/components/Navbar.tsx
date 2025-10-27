import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Plane, User } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-smooth group-hover:shadow-primary">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Yamou<span className="text-secondary">sso</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-smooth font-medium">
              Accueil
            </Link>
            <Link to="/hotels" className="text-foreground hover:text-primary transition-smooth font-medium">
              Hôtels
            </Link>
            <Link to="/tours" className="text-foreground hover:text-primary transition-smooth font-medium">
              Circuits
            </Link>
            <Link to="/cars" className="text-foreground hover:text-primary transition-smooth font-medium">
              Voitures
            </Link>
            <Link to="/flights" className="text-foreground hover:text-primary transition-smooth font-medium">
              Vols
            </Link>
            <Link to="/events" className="text-foreground hover:text-primary transition-smooth font-medium">
              Événements
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              Connexion
            </Button>
            <Button size="sm" className="gradient-primary shadow-primary">
              S'inscrire
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-smooth"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/hotels"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Hôtels
              </Link>
              <Link
                to="/tours"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Circuits
              </Link>
              <Link
                to="/cars"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Voitures
              </Link>
              <Link
                to="/flights"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Vols
              </Link>
              <Link
                to="/events"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Événements
              </Link>
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border">
                <Button variant="outline" className="w-full gap-2">
                  <User className="w-4 h-4" />
                  Connexion
                </Button>
                <Button className="w-full gradient-primary shadow-primary">
                  S'inscrire
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
