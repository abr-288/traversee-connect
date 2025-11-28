import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Wifi, Zap, Bell } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePWA } from "@/hooks/usePWA";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const Install = () => {
  const { isInstallable, isInstalled, install } = usePWA();
  const { isSupported, permission, requestPermission, subscribe, sendNotification } = usePushNotifications();

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      console.log('App installed successfully');
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribe();
      sendNotification('Notifications activées', {
        body: 'Vous recevrez désormais des notifications pour vos réservations',
        tag: 'welcome'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <div className="flex-1 bg-gradient-to-b from-background to-muted/20 py-10 md:py-20">
        <div className="container max-w-4xl px-4">
          <div className="text-center mb-12">
            <Smartphone className="w-20 h-20 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Installez B-Reserve
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
                  L'application B-Reserve est déjà installée sur votre appareil.
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
                      <Smartphone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Accès rapide depuis votre écran d'accueil</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Wifi className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Fonctionne même hors ligne</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
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

              {isSupported && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications push
                    </CardTitle>
                    <CardDescription>
                      Restez informé de vos réservations et offres spéciales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {permission === 'granted' ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check className="w-5 h-5" />
                        <span>Notifications activées</span>
                      </div>
                    ) : permission === 'denied' ? (
                      <div className="text-sm text-muted-foreground">
                        Les notifications ont été refusées. Vous pouvez les réactiver dans les paramètres de votre navigateur.
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground">
                          Activez les notifications pour recevoir :
                          <ul className="mt-2 space-y-1 list-disc list-inside">
                            <li>Confirmations de réservation</li>
                            <li>Rappels de voyage</li>
                            <li>Offres personnalisées</li>
                          </ul>
                        </div>
                        <Button onClick={handleEnableNotifications} className="w-full">
                          <Bell className="mr-2 h-5 w-5" />
                          Activer les notifications
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Install;
