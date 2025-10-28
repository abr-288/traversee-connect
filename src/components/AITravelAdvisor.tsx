import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { useAITravelAdvisor } from "@/hooks/useAITravelAdvisor";
import { toast } from "sonner";

export const AITravelAdvisor = () => {
  const [destination, setDestination] = useState("");
  const [interests, setInterests] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [recommendations, setRecommendations] = useState("");
  
  const { getRecommendations, loading } = useAITravelAdvisor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination.trim()) {
      toast.error("Veuillez entrer une destination");
      return;
    }

    const result = await getRecommendations({
      destination,
      interests,
      budget,
      duration,
    });

    if (result?.success) {
      setRecommendations(result.recommendations);
      toast.success("Recommandations générées avec succès!");
    } else {
      toast.error(result?.error || "Erreur lors de la génération des recommandations");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Conseiller de Voyage AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="destination">Destination *</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ex: Paris, Tokyo, Marrakech..."
              required
            />
          </div>

          <div>
            <Label htmlFor="interests">Intérêts</Label>
            <Input
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Ex: culture, nature, gastronomie..."
            />
          </div>

          <div>
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Ex: économique, moyen, luxe..."
            />
          </div>

          <div>
            <Label htmlFor="duration">Durée du séjour</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ex: 3 jours, une semaine..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Obtenir des recommandations AI
              </>
            )}
          </Button>
        </form>

        {recommendations && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Recommandations personnalisées
            </h3>
            <div className="prose prose-sm max-w-none">
              <Textarea
                value={recommendations}
                readOnly
                className="min-h-[400px] font-sans text-sm leading-relaxed resize-none"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};