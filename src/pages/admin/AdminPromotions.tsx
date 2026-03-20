import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, RefreshCw, Percent, MapPin, Image } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  location: string;
  image_url: string | null;
  discount: number;
  original_price: number;
  currency: string;
  expires_at: string | null;
  rating: number;
  is_active: boolean;
  created_at: string;
}

const emptyPromotion: Omit<Promotion, "id" | "created_at"> = {
  name: "",
  description: "",
  location: "",
  image_url: "",
  discount: 20,
  original_price: 100,
  currency: "EUR",
  expires_at: null,
  rating: 4.5,
  is_active: true,
};

export default function AdminPromotions() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState(emptyPromotion);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromotions((data as Promotion[]) || []);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleEdit = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      name: promo.name,
      description: promo.description,
      location: promo.location,
      image_url: promo.image_url,
      discount: promo.discount,
      original_price: Number(promo.original_price),
      currency: promo.currency,
      expires_at: promo.expires_at,
      rating: Number(promo.rating),
      is_active: promo.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    setFormData(emptyPromotion);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.location || formData.original_price <= 0) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        expires_at: formData.expires_at || null,
      };

      if (editingPromotion) {
        const { error } = await supabase
          .from("promotions")
          .update(dataToSave)
          .eq("id", editingPromotion.id);
        if (error) throw error;
        toast({ title: "Succès", description: "Promotion mise à jour" });
      } else {
        const { error } = await supabase
          .from("promotions")
          .insert(dataToSave);
        if (error) throw error;
        toast({ title: "Succès", description: "Promotion créée" });
      }

      setIsDialogOpen(false);
      fetchPromotions();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) return;

    try {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Succès", description: "Promotion supprimée" });
      fetchPromotions();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const toggleActive = async (promo: Promotion) => {
    try {
      const { error } = await supabase
        .from("promotions")
        .update({ is_active: !promo.is_active })
        .eq("id", promo.id);
      if (error) throw error;
      fetchPromotions();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Promotions Exclusives</h1>
            <p className="text-muted-foreground">Gérez les offres promotionnelles affichées sur le site</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchPromotions} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle promotion
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{promotions.length}</p>
                </div>
                <Percent className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actives</p>
                  <p className="text-2xl font-bold text-green-600">
                    {promotions.filter(p => p.is_active).length}
                  </p>
                </div>
                <Percent className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des promotions ({promotions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : promotions.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Aucune promotion trouvée</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Réduction</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        {promo.image_url ? (
                          <img src={promo.image_url} alt={promo.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Image className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{promo.name}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {promo.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">-{promo.discount}%</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-semibold">
                            {(Number(promo.original_price) * (1 - promo.discount / 100)).toFixed(0)} {promo.currency}
                          </span>
                          <span className="text-xs text-muted-foreground line-through ml-1">
                            {promo.original_price} {promo.currency}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {promo.expires_at ? format(new Date(promo.expires_at), "dd MMM yyyy", { locale: fr }) : "-"}
                      </TableCell>
                      <TableCell>
                        <Switch checked={promo.is_active} onCheckedChange={() => toggleActive(promo)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(promo)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(promo.id)}>
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
              <DialogTitle>{editingPromotion ? "Modifier la promotion" : "Créer une promotion"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Hôtel Sofitel Abidjan"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de l'offre..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lieu *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Abidjan, Côte d'Ivoire"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Note (0-5)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <ImageUpload
                value={formData.image_url || ""}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="promotions"
                label="Image de la promotion"
              />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Prix original *</Label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Réduction (%) *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="EUR"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date d'expiration</Label>
                <Input
                  type="datetime-local"
                  value={formData.expires_at ? formData.expires_at.slice(0, 16) : ""}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Promotion active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingPromotion ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
