import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PackagesList } from "@/components/domain/packages/PackagesList";
import { PackageForm } from "@/components/domain/packages/PackageForm";
import { Package } from "@/types/packages";
import { packagesApi } from "@/api/packages";
import { studiosApi } from "@/api/studios";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package as PackageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/contexts/RoleContext";

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | undefined>();
  const [studioCurrency, setStudioCurrency] = useState<string>("USD");
  const { toast } = useToast();
  const { currentStudioId } = useRole();

  const loadPackages = async () => {
    if (!currentStudioId) return;
    
    try {
      setLoading(true);
      const [packagesData, studioData] = await Promise.all([
        packagesApi.getPackages(currentStudioId),
        studiosApi.getStudioById(currentStudioId)
      ]);
      
      setPackages(packagesData);
      if (studioData?.currency) {
        setStudioCurrency(studioData.currency);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: "Error",
        description: "Failed to load packages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStudioId) {
      loadPackages();
    }
  }, [currentStudioId]);

  const handleCreatePackage = () => {
    setEditingPackage(undefined);
    setShowForm(true);
  };

  const handleEditPackage = (packageData: Package) => {
    setEditingPackage(packageData);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPackage(undefined);
    loadPackages();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPackage(undefined);
  };

  const handleDeletePackage = (packageId: string) => {
    setPackages(packages.filter(pkg => pkg.id !== packageId));
  };

  if (loading || !currentStudioId) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <PackageIcon className="h-6 w-6" />
            Packages
          </h1>
          <p className="text-muted-foreground">
            Create and manage service packages to offer bundled deals to your clients.
          </p>
        </div>
        <Button onClick={handleCreatePackage} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Package
        </Button>
      </div>

      <PackagesList
        packages={packages}
        onEdit={handleEditPackage}
        onDelete={handleDeletePackage}
        studioCurrency={studioCurrency}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Create New Package"}
            </DialogTitle>
          </DialogHeader>
          {currentStudioId && (
            <PackageForm
              studioId={currentStudioId}
              package={editingPackage}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              studioCurrency={studioCurrency}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}