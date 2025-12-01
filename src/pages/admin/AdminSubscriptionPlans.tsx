import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, RefreshCw, Star, GripVertical } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface SubscriptionPlan {
  id: string;
  plan_id: string;
  name: string;
  subtitle: string | null;
  icon: string;
  image_url?: string | null;
  price: string;
  price_note: string | null;
  features: string[];
  popular: boolean;
  color: string;
  sort_order: number;
  is_active: boolean;
}

const ICONS = ["Building2", "Crown", "FileCheck", "Plane", "Users", "Briefcase", "GraduationCap", "CalendarDays", "Star", "Heart"];
const COLORS = [
  { value: "from-primary to-primary/80", label: "Primary" },
  { value: "from-amber-500 to-amber-600", label: "Amber" },
  { value: "from-emerald-500 to-emerald-600", label: "Emerald" },
  { value: "from-blue-500 to-blue-600", label: "Blue" },
  { value: "from-pink-500 to-pink-600", label: "Pink" },
  { value: "from-slate-600 to-slate-700", label: "Slate" },
  { value: "from-violet-500 to-violet-600", label: "Violet" },
  { value: "from-orange-500 to-orange-600", label: "Orange" },
  { value: "from-red-500 to-red-600", label: "Red" },
  { value: "from-cyan-500 to-cyan-600", label: "Cyan" },
];

const emptyPlan: Omit<SubscriptionPlan, "id"> = {
  plan_id: "",
  name: "",
  subtitle: "",
  icon: "Building2",
  image_url: "",
  price: "",
  price_note: "",
  features: [],
  popular: false,
  color: "from-primary to-primary/80",
  sort_order: 0,
  is_active: true,
};

export default function AdminSubscriptionPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState(emptyPlan);
  const [featuresText, setFeaturesText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setPlans((data as SubscriptionPlan[]) || []);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setFeaturesText(plan.features.join("\n"));
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({ ...emptyPlan, sort_order: plans.length + 1 });
    setFeaturesText("");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.plan_id || !formData.name || !formData.price) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        features: featuresText.split("\n").filter(f => f.trim()),
      };

      if (editingPlan) {
        const { error } = await supabase
          .from("subscription_plans")
          .update(dataToSave)
          .eq("id", editingPlan.id);
        if (error) throw error;
        toast({ title: "Succès", description: "Plan mis à jour" });
      } else {
        const { error } = await supabase
          .from("subscription_plans")
          .insert(dataToSave);
        if (error) throw error;
        toast({ title: "Succès", description: "Plan créé" });
      }

      setIsDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) return;

    try {
      const { error } = await supabase.from("subscription_plans").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Succès", description: "Plan supprimé" });
      fetchPlans();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const toggleActive = async (plan: SubscriptionPlan) => {
    try {
      const { error } = await supabase
        .from("subscription_plans")
        .update({ is_active: !plan.is_active })
        .eq("id", plan.id);
      if (error) throw error;
      fetchPlans();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const togglePopular = async (plan: SubscriptionPlan) => {
    try {
      const { error } = await supabase
        .from("subscription_plans")
        .update({ popular: !plan.popular })
        .eq("id", plan.id);
      if (error) throw error;
      fetchPlans();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Plans d'abonnement</h1>
            <p className="text-muted-foreground">Gérez les offres d'abonnement affichées sur le site</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchPlans} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau plan
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des plans ({plans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Aucun plan trouvé</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordre</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Populaire</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        {plan.sort_order}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{plan.price}</span>
                        {plan.price_note && <span className="text-xs text-muted-foreground ml-1">{plan.price_note}</span>}
                      </TableCell>
                      <TableCell>
                        <Switch checked={plan.popular} onCheckedChange={() => togglePopular(plan)} />
                        {plan.popular && <Star className="w-4 h-4 text-amber-500 inline ml-1" />}
                      </TableCell>
                      <TableCell>
                        <Switch checked={plan.is_active} onCheckedChange={() => toggleActive(plan)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Modifier le plan" : "Créer un plan"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID du plan *</Label>
                  <Input
                    value={formData.plan_id}
                    onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                    placeholder="corporate, premium..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Corporate Mensuelle"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sous-titre</Label>
                <Input
                  value={formData.subtitle || ""}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Pour les entreprises"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix *</Label>
                  <Input
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="230€ - 460€"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Note prix</Label>
                  <Input
                    value={formData.price_note || ""}
                    onChange={(e) => setFormData({ ...formData, price_note: e.target.value })}
                    placeholder="par mois"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icône</Label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>{color.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fonctionnalités (une par ligne)</Label>
                <Textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Gestion complète des réservations&#10;Support prioritaire 7j/7"
                  rows={5}
                />
              </div>

              <ImageUpload
                value={formData.image_url || ""}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="subscriptions"
                label="Image du plan (optionnel)"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordre d'affichage</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.popular}
                      onCheckedChange={(v) => setFormData({ ...formData, popular: v })}
                    />
                    <Label>Populaire</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                    />
                    <Label>Actif</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingPlan ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
