import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20">
        <div className="container max-w-4xl px-4">
          <div className="text-center mb-12">
            <Smartphone className="w-20 h-20 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Installez Traversée Connect
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Profitez d'une expérience optimale en installant notre application directement sur votre téléphone
            </p>
          </div>

          {isInstalled ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Application déjà installée</h2>
                <p className="text-muted-foreground">
                  L'application Traversée Connect est déjà installée sur votre appareil.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Installation rapide
                  </CardTitle>
                  <CardDescription>
                    Transformez notre site en application mobile en quelques clics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isInstallable ? (
                    <Button 
                      onClick={handleInstallClick} 
                      size="lg" 
                      className="w-full"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Installer l'application
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">📱 Sur iPhone/iPad:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Ouvrez ce site dans Safari</li>
                          <li>Appuyez sur le bouton Partager (icône carrée avec flèche)</li>
                          <li>Sélectionnez "Sur l'écran d'accueil"</li>
                          <li>Appuyez sur "Ajouter"</li>
                        </ol>
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">🤖 Sur Android:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Ouvrez ce site dans Chrome</li>
                          <li>Appuyez sur le menu (trois points)</li>
                          <li>Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil"</li>
                          <li>Confirmez l'installation</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avantages de l'installation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Accès rapide depuis votre écran d'accueil</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Fonctionne même hors ligne</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Chargement ultra-rapide</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Expérience optimisée pour mobile</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Aucun téléchargement sur les stores nécessaire</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Install;
