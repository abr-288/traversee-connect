import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from "@/components/admin/ExportButtons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export default function AdminActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    duration: "",
    price_per_unit: 0,
    currency: "EUR",
    available: true,
    featured: false,
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les activités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        const { error } = await supabase
          .from("activities")
          .update(formData)
          .eq("id", editingActivity.id);

        if (error) throw error;
        toast({ title: "Activité mise à jour avec succès" });
      } else {
        const { error } = await supabase.from("activities").insert([formData]);
        if (error) throw error;
        toast({ title: "Activité créée avec succès" });
      }

      setDialogOpen(false);
      resetForm();
      fetchActivities();
    } catch (error) {
      console.error("Error saving activity:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'activité",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) return;

    try {
      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Activité supprimée avec succès" });
      fetchActivities();
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'activité",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (activity: any) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      category: activity.category,
      location: activity.location,
      description: activity.description || "",
      duration: activity.duration,
      price_per_unit: activity.price_per_unit,
      currency: activity.currency,
      available: activity.available,
      featured: activity.featured,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingActivity(null);
    setFormData({
      name: "",
      category: "",
      location: "",
      description: "",
      duration: "",
      price_per_unit: 0,
      currency: "EUR",
      available: true,
      featured: false,
    });
  };

  const filteredActivities = activities.filter((activity) =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestion des Activités</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Activité
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingActivity ? "Modifier l'activité" : "Créer une activité"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Localisation</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durée</Label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="Ex: 3 heures"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix par personne</Label>
                    <Input
                      type="number"
                      value={formData.price_per_unit}
                      onChange={(e) => setFormData({ ...formData, price_per_unit: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Devise</Label>
                    <Input
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    />
                    Disponible
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    En vedette
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingActivity ? "Mettre à jour" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <ExportButtons data={filteredActivities} filename="activities" />
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.category}</Badge>
                  </TableCell>
                  <TableCell>{activity.location}</TableCell>
                  <TableCell>{activity.duration}</TableCell>
                  <TableCell>
                    {activity.price_per_unit} {activity.currency}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {activity.available && <Badge variant="secondary">Disponible</Badge>}
                      {activity.featured && <Badge>Vedette</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(activity)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminLayout>
  );
}
