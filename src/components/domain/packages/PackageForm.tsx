import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ServiceCategorySelect } from "../services/ServiceCategorySelect";
import { Package } from "@/types/packages";
import { packagesApi } from "@/api/packages";
import { servicesApi } from "@/api/services";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Service } from "@/types/services";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";

const packageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  services: z.array(z.string()).min(1, "At least one service is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
  discount_type: z.enum(["fixed", "percentage"]),
  discount_value: z.number().min(0, "Discount must be 0 or greater"),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  studioId: string;
  package?: Package;
  onSuccess: () => void;
  onCancel: () => void;
  studioCurrency?: string;
}

export const PackageForm = ({ studioId, package: packageData, onSuccess, onCancel, studioCurrency = "USD" }: PackageFormProps) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const { toast } = useToast();

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: packageData?.name || "",
      description: packageData?.description || "",
      category: packageData?.category || "",
      services: packageData?.services || [],
      price: packageData?.price || 0,
      discount_type: packageData?.discount_type || "fixed",
      discount_value: packageData?.discount_value || 0,
    },
  });

  useEffect(() => {
    const loadServices = async () => {
      try {
        const studioServices = await servicesApi.getServices(studioId);
        setServices(studioServices);
      } catch (error) {
        console.error('Error loading services:', error);
      }
    };

    if (studioId) {
      loadServices();
    }
  }, [studioId]);

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

  const generateAIDescription = async () => {
    try {
      setAiLoading(true);
      const packageName = form.getValues("name");
      const category = form.getValues("category");
      
      if (!packageName) {
        toast({
          title: "Name required",
          description: "Please enter a package name first.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-service-description', {
        body: { serviceName: packageName, category, isPackage: true }
      });

      if (error) throw error;

      if (data?.description) {
        form.setValue("description", data.description);
        toast({
          title: "Description generated",
          description: "AI-generated description has been added.",
        });
      }
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast({
        title: "Error",
        description: "Failed to generate description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Calculate total price of selected services
  const calculateServicesTotal = () => {
    const selectedServiceIds = form.watch("services") || [];
    return selectedServiceIds.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  // Calculate final price after discount
  const calculateFinalPrice = () => {
    const total = calculateServicesTotal();
    const discountType = form.watch("discount_type");
    const discountValue = form.watch("discount_value") || 0;
    
    if (discountType === "percentage") {
      return total - (total * discountValue / 100);
    } else {
      return total - discountValue;
    }
  };

  // Watch for changes in services or discount to auto-calculate price
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.services?.length || values.discount_type || values.discount_value !== undefined) {
        const newPrice = Math.max(0, calculateFinalPrice());
        if (newPrice !== form.getValues("price")) {
          form.setValue("price", newPrice);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, services]);

  const onSubmit = async (data: PackageFormData) => {
    try {
      setLoading(true);
      
      const packagePayload: Omit<Package, 'id' | 'created_at' | 'updated_at'> = {
        name: data.name,
        description: data.description,
        category: data.category,
        services: data.services,
        price: data.price,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        studio_id: studioId,
        is_active: true,
      };

      if (packageData) {
        await packagesApi.updatePackage(packageData.id, packagePayload);
        toast({
          title: "Package updated",
          description: "Package has been successfully updated.",
        });
      } else {
        await packagesApi.createPackage(packagePayload);
        toast({
          title: "Package created",
          description: "Package has been successfully created.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving package:', error);
      toast({
        title: "Error",
        description: "Failed to save package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Relaxation Bundle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <FormControl>
                <ServiceCategorySelect
                  studioId={studioId}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select a category..."
                  required={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Description (Optional)
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAIDescription}
                  disabled={aiLoading}
                  className="ml-2"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate with AI
                </Button>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the package..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="services"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Services *</FormLabel>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={field.value.includes(service.id)}
                      onCheckedChange={(checked) => {
                        const updatedServices = checked
                          ? [...field.value, service.id]
                          : field.value.filter(id => id !== service.id);
                        field.onChange(updatedServices);
                      }}
                    />
                    <label htmlFor={service.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {service.name} - {getCurrencySymbol(studioCurrency)}{service.price}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step={form.watch("discount_type") === "percentage" ? "1" : "0.01"}
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Price Summary */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium">Price Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Services Total:</span>
              <span>{getCurrencySymbol(studioCurrency)}{calculateServicesTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>
                -{getCurrencySymbol(studioCurrency)}
                {form.watch("discount_type") === "percentage" 
                  ? (calculateServicesTotal() * (form.watch("discount_value") || 0) / 100).toFixed(2)
                  : (form.watch("discount_value") || 0).toFixed(2)
                }
              </span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Final Price:</span>
              <span>{getCurrencySymbol(studioCurrency)}{Math.max(0, calculateFinalPrice()).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Final Price ({getCurrencySymbol(studioCurrency)}) *</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {getCurrencySymbol(studioCurrency)}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    {...field}
                    value={field.value || 0}
                    readOnly
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : packageData ? "Update Package" : "Create Package"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};