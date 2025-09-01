import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ServicesList } from "@/components/domain/services/ServicesList";
import { ServiceForm } from "@/components/domain/services/ServiceForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Service } from "@/types/services";
import { servicesApi } from "@/api/services";
import { studiosApi } from "@/api/studios";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [studioCurrency, setStudioCurrency] = useState<string>("USD");
  const { toast } = useToast();
  const { currentStudioId } = useRole();

  const loadServices = async () => {
    if (!currentStudioId) return;
    
    try {
      setLoading(true);
      const [servicesData, studioData] = await Promise.all([
        servicesApi.getServices(currentStudioId),
        studiosApi.getStudioById(currentStudioId)
      ]);
      setServices(servicesData);
      if (studioData?.currency) {
        setStudioCurrency(studioData.currency);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [currentStudioId]);

  const handleCreateService = () => {
    setEditingService(null);
    setFormDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingService(null);
    loadServices();
  };

  const handleFormCancel = () => {
    setFormDialogOpen(false);
    setEditingService(null);
  };

  if (loading || !currentStudioId) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Services</h1>
              <p className="text-muted-foreground">Manage your studio's services and pricing</p>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-muted-foreground">Manage your studio's services and pricing</p>
          </div>
          
          <Button onClick={handleCreateService} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>

        <ServicesList
          studioId={currentStudioId}
          services={services}
          onEdit={handleEditService}
          onRefresh={loadServices}
        />

        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service" : "Create New Service"}
              </DialogTitle>
            </DialogHeader>
            
            <ServiceForm
              studioId={currentStudioId}
              service={editingService || undefined}
              studioCurrency={studioCurrency}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}