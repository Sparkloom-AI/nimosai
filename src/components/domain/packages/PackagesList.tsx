import { useState } from "react";
import { Package } from "@/types/packages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Package as PackageIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { packagesApi } from "@/api/packages";
import { useToast } from "@/hooks/use-toast";

interface PackagesListProps {
  packages: Package[];
  onEdit: (packageData: Package) => void;
  onDelete: (packageId: string) => void;
  studioCurrency?: string;
}

export const PackagesList = ({ packages, onEdit, onDelete, studioCurrency = "USD" }: PackagesListProps) => {
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);
  const { toast } = useToast();

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
      SEK: "kr",
      NZD: "NZ$",
    };
    return symbols[currency] || currency;
  };

  const handleDelete = async (packageId: string) => {
    try {
      setDeletingPackageId(packageId);
      await packagesApi.deletePackage(packageId);
      onDelete(packageId);
      toast({
        title: "Package deleted",
        description: "Package has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "Failed to delete package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingPackageId(null);
    }
  };

  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <PackageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No packages yet</h3>
          <p className="text-muted-foreground text-center">
            Create your first package to bundle services together and offer deals to your clients.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((packageData) => (
        <Card key={packageData.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{packageData.name}</CardTitle>
                <Badge variant="secondary">{packageData.category}</Badge>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(packageData)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={deletingPackageId === packageData.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the package
                        "{packageData.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(packageData.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {packageData.description && (
                <CardDescription>{packageData.description}</CardDescription>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {packageData.services.length} service{packageData.services.length !== 1 ? 's' : ''}
                </span>
                <span className="text-lg font-bold">
                  {getCurrencySymbol(studioCurrency)}{packageData.price.toFixed(2)}
                </span>
              </div>
              {packageData.discount_value > 0 && (
                <div className="text-sm text-muted-foreground">
                  Discount: {packageData.discount_type === 'percentage' ? `${packageData.discount_value}%` : `${getCurrencySymbol(studioCurrency)}${packageData.discount_value}`}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};