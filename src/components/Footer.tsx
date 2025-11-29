import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { useState } from "react";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const { subscribe, loading } = useNewsletterSubscribe();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t("footer.newsletter.emailRequired"));
      return;
    }

    const result = await subscribe(email);
    
    if (result) {
      toast.success(result.message || t("footer.newsletter.subscribeSuccess"));
      setEmail("");
    } else {
      toast.error(t("footer.newsletter.subscribeError"));
    }
  };

  return (
    <footer className="bg-primary border-t border-primary-light w-full">
      <div className="site-container py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Brand Section */}
          <div className="space-y-3 md:space-y-4 text-center sm:text-left">
            <div className="flex items-center gap-2 md:gap-3 justify-center sm:justify-start">
              <img src={logoLight} alt="Bossiz Logo" className="h-10 md:h-12 w-auto" />
              <span className="text-xl md:text-2xl font-bold text-white">Bossiz</span>
            </div>
            <p className="text-white/80 text-sm">
              {t("footer.description")}
            </p>
            <div className="flex gap-2 md:gap-3 justify-center sm:justify-start">
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 md:h-10 md:w-10">
                <Facebook className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 md:h-10 md:w-10">
                <Twitter className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 md:h-10 md:w-10">
                <Instagram className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 md:h-10 md:w-10">
                <Youtube className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-white mb-3 md:mb-4 text-sm md:text-base">{t("footer.services")}</h3>
            <ul className="space-y-2 md:space-y-3 text-sm">
              <li>
                <Link to="/flights" className="text-white/80 hover:text-secondary transition-smooth">
                  {t("footer.flights")}
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="text-white/80 hover:text-secondary transition-smooth">
                  {t("footer.hotels")}
                </Link>
              </li>
              <li>
                <Link to="/flight-hotel" className="text-white/80 hover:text-secondary transition-smooth">
                  {t("footer.flightHotel")}
                </Link>
              </li>
              <li>
                <Link to="/cars" className="text-white/80 hover:text-secondary transition-smooth">
                  {t("footer.cars")}
                </Link>
              </li>
              <li>
                <Link to="/stays" className="text-white/80 hover:text-secondary transition-smooth">
                  {t("footer.stays")}
                </Link>
              </li>
              <li>
                <Link to="/activities" className="text-white/80 hover:text-secondary transition-smooth">
                  {t("footer.activities")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-white mb-3 md:mb-4 text-sm md:text-base">{t("footer.support")}</h3>
            <ul className="space-y-2 md:space-y-3 text-sm">
              <li>
                <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
                  {t("footer.help")}
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-white/80 hover:text-secondary transition-smooth">
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link to="/install" className="text-secondary hover:text-secondary/80 transition-smooth font-semibold">
                  📱 {t("common.install")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-white mb-3 md:mb-4 text-sm md:text-base">{t("footer.newsletter.title")}</h3>
            <p className="text-white/80 text-xs md:text-sm mb-3 md:mb-4">
              {t("footer.newsletter.description")}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  placeholder={t("footer.newsletter.placeholder")}
                  type="email" 
                  className="flex-1 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-primary h-9 md:h-10" disabled={loading}>
                  <Mail className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
              <p className="text-xs text-white/70">
                {t("footer.privacy")}
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-light flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-white/80 text-sm">
            © 2025 B-Reserve. {t("footer.rights")}.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
              {t("footer.about")}
            </Link>
            <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
              {t("footer.terms")}
            </Link>
            <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
              {t("footer.privacy")}
            </Link>
            <Link to="/support" className="text-white/80 hover:text-secondary transition-smooth">
              {t("footer.help")}
            </Link>
            <Link to="/install" className="text-secondary hover:text-secondary/80 transition-smooth font-semibold">
              📱 {t("common.install")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
