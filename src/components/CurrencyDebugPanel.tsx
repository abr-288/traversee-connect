import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw } from 'lucide-react';
import { getCacheStats, clearCurrencyCache } from '@/lib/currencyCache';

/**
 * Debug panel to monitor currency cache performance
 * Only shown in development mode
 */
export const CurrencyDebugPanel = () => {
  const [stats, setStats] = useState({
    totalEntries: 0,
    validEntries: 0,
    expiredEntries: 0,
  });

  const updateStats = () => {
    setStats(getCacheStats());
  };

  const handleClearCache = () => {
    clearCurrencyCache();
    updateStats();
  };

  useEffect(() => {
    updateStats();
    // Update stats every 10 seconds
    const interval = setInterval(updateStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <Card className="border-dashed border-2 border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>💰 Currency Cache Stats</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={updateStats}
              className="h-7 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearCache}
              className="h-7 px-2"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Entries:</span>
          <Badge variant="secondary">{stats.totalEntries}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Valid (Active):</span>
          <Badge className="bg-green-500">{stats.validEntries}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Expired:</span>
          <Badge variant="destructive">{stats.expiredEntries}</Badge>
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Cache TTL: 1 hour • Auto-cleanup enabled
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
