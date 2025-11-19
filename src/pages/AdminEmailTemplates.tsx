import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEmailTemplates, EmailTemplate } from "@/hooks/useEmailTemplates";
import { useUserRole } from "@/hooks/useUserRole";
import { Mail, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminEmailTemplates = () => {
  const navigate = useNavigate();
  const { role, loading } = useUserRole();
  const { fetchTemplates, createTemplate, updateTemplate, deleteTemplate, isLoading } = useEmailTemplates();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    if (!loading && role !== "admin") {
      navigate("/");
    }
  }, [role, loading, navigate]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const data = await fetchTemplates();
    setTemplates(data);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const templateData = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      subject: formData.get("subject") as string,
      html_content: formData.get("html_content") as string,
      variables: JSON.parse(formData.get("variables") as string || "[]"),
      is_active: formData.get("is_active") === "on",
    };

    let success = false;
    if (selectedTemplate) {
      success = await updateTemplate(selectedTemplate.id, templateData);
    } else {
      success = await createTemplate(templateData);
    }

    if (success) {
      setIsDialogOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) {
      const success = await deleteTemplate(id);
      if (success) loadTemplates();
    }
  };

  const templateTypes = [
    { value: "flight_confirmation", label: "Confirmation de vol" },
    { value: "support", label: "Message support" },
    { value: "support_confirmation", label: "Confirmation support" },
    { value: "newsletter", label: "Newsletter" },
    { value: "invoice", label: "Facture" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gestion des Templates d'Emails</h1>
          <p className="text-muted-foreground">Personnalisez les emails envoyés par l'application</p>
        </div>

        <div className="flex justify-end mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedTemplate(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemplate ? "Modifier le template" : "Nouveau template"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du template</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedTemplate?.name}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue={selectedTemplate?.type} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    name="subject"
                    defaultValue={selectedTemplate?.subject}
                    placeholder="Ex: Confirmation de vol {{from}} → {{to}}"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="html_content">Contenu HTML</Label>
                  <Textarea
                    id="html_content"
                    name="html_content"
                    defaultValue={selectedTemplate?.html_content}
                    rows={12}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Utilisez {`{{variable}}`} pour les variables dynamiques
                  </p>
                </div>

                <div>
                  <Label htmlFor="variables">Variables (JSON array)</Label>
                  <Input
                    id="variables"
                    name="variables"
                    defaultValue={JSON.stringify(selectedTemplate?.variables || [])}
                    placeholder='["customerName", "from", "to"]'
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={selectedTemplate?.is_active ?? true}
                  />
                  <Label htmlFor="is_active">Template actif</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            {templateTypes.map((type) => (
              <TabsTrigger key={type.value} value={type.value}>
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          {template.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {templateTypes.find((t) => t.value === template.type)?.label}
                        </CardDescription>
                      </div>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.subject}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {templateTypes.map((type) => (
            <TabsContent key={type.value} value={type.value}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates
                  .filter((t) => t.type === type.value)
                  .map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            {template.name}
                          </CardTitle>
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        <CardDescription>{template.subject}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewTemplate(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Aperçu: {previewTemplate?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Sujet</Label>
                <p className="text-sm mt-1">{previewTemplate?.subject}</p>
              </div>
              <div>
                <Label>Variables disponibles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewTemplate?.variables.map((variable) => (
                    <Badge key={variable} variant="outline">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Aperçu HTML</Label>
                <div 
                  className="mt-2 border rounded-lg p-4 bg-background"
                  dangerouslySetInnerHTML={{ __html: previewTemplate?.html_content || "" }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default AdminEmailTemplates;
