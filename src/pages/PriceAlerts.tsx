import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PriceAlertManager } from '@/components/PriceAlertManager';
import { CreatePriceAlert } from '@/components/CreatePriceAlert';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

const PriceAlerts = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20 pt-16">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">{t('priceAlerts.title')}</h1>
            <p className="text-muted-foreground">
              {t('priceAlerts.subtitle')}
            </p>
          </div>

          <Tabs defaultValue="alerts" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="alerts">{t('priceAlerts.myAlerts')}</TabsTrigger>
              <TabsTrigger value="create">{t('priceAlerts.createAlert')}</TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="space-y-4">
              <PriceAlertManager />
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <CreatePriceAlert />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <NotificationPrompt />
      <Footer />
    </div>
  );
};

export default PriceAlerts;
