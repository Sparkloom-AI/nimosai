import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown } from "lucide-react";
import { ServicesList } from "@/components/domain/services/ServicesList";
import { ServiceForm } from "@/components/domain/services/ServiceForm";
import { PackageForm } from "@/components/domain/packages/PackageForm";
import { PackagesList } from "@/components/domain/packages/PackagesList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Service } from "@/types/services";
import { Package } from "@/types/packages";
import { servicesApi } from "@/api/services";
import { packagesApi } from "@/api/packages";
import { studiosApi } from "@/api/studios";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formType, setFormType] = useState<'service' | 'package'>('service');
  const [studioCurrency, setStudioCurrency] = useState<string>("USD");
  const { toast } = useToast();
  const { currentStudioId } = useRole();

  const loadData = async () => {
    if (!currentStudioId) return;
    
    try {
      setLoading(true);
      console.log('Services: Loading data for studio:', currentStudioId);
      
      const [servicesData, packagesData, studioDataArray] = await Promise.all([
        servicesApi.getServices(currentStudioId),
        packagesApi.getPackages(currentStudioId),
        studiosApi.getStudioById(currentStudioId)
      ]);
      
      console.log('Services: Loaded services:', servicesData);
      console.log('Services: Loaded packages:', packagesData);
      console.log('Services: Studio data:', studioDataArray);
      
      setServices(servicesData);
      setPackages(packagesData);
      
      // Handle studio data properly - getStudioById returns an array
      const studioData = Array.isArray(studioDataArray) ? studioDataArray[0] : studioDataArray;
      if (studioData?.currency) {
        setStudioCurrency(studioData.currency);
        console.log('Services: Set currency to:', studioData.currency);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load services and packages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentStudioId]);

  const handleCreateService = () => {
    setFormType('service');
    setEditingService(null);
    setEditingPackage(null);
    setFormDialogOpen(true);
  };

  const handleCreatePackage = () => {
    setFormType('package');
    setEditingService(null);
    setEditingPackage(null);
    setFormDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setFormType('service');
    setEditingService(service);
    setEditingPackage(null);
    setFormDialogOpen(true);
  };

  const handleEditPackage = (pkg: Package) => {
    setFormType('package');
    setEditingService(null);
    setEditingPackage(pkg);
    setFormDialogOpen(true);
  };

  const handleDeletePackage = (packageId: string) => {
    setPackages(packages.filter(pkg => pkg.id !== packageId));
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingService(null);
    setEditingPackage(null);
    loadData();
  };

  const handleFormCancel = () => {
    setFormDialogOpen(false);
    setEditingService(null);
    setEditingPackage(null);
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
            <h1 className="text-3xl font-bold">Services & Packages</h1>
            <p className="text-muted-foreground">Manage your studio's services, packages, and pricing</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCreateService}>
                <Plus className="h-4 w-4 mr-2" />
                Service
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreatePackage}>
                <Plus className="h-4 w-4 mr-2" />
                Package
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ServicesList
          studioId={currentStudioId}
          services={services}
          onEdit={handleEditService}
          onRefresh={loadData}
          studioCurrency={studioCurrency}
        />

        <PackagesList
          packages={packages}
          onEdit={handleEditPackage}
          onDelete={handleDeletePackage}
          studioCurrency={studioCurrency}
        />

        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {formType === 'service' 
                  ? (editingService ? "Edit Service" : "Create New Service")
                  : (editingPackage ? "Edit Package" : "Create New Package")
                }
              </DialogTitle>
            </DialogHeader>
            
            {formType === 'service' ? (
              <ServiceForm
                studioId={currentStudioId}
                service={editingService || undefined}
                studioCurrency={studioCurrency}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            ) : (
              <PackageForm
                studioId={currentStudioId}
                package={editingPackage || undefined}
                studioCurrency={studioCurrency}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}