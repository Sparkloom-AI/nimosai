import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ServiceCategorySelect } from "./ServiceCategorySelect";
import { Service } from "@/types/services";
import { servicesApi } from "@/api/services";
import { useToast } from "@/hooks/use-toast";

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  price: z.number().min(0, "Price must be 0 or greater"),
  category: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  studioId: string;
  service?: Service;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ServiceForm = ({ studioId, service, onSuccess, onCancel }: ServiceFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      duration: service?.duration || 60,
      price: service?.price || 0,
      category: service?.category || "",
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    try {
      setLoading(true);
      
      const serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'> = {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        category: data.category,
        studio_id: studioId,
        is_active: true,
      };

      if (service) {
        await servicesApi.updateService(service.id, serviceData);
        toast({
          title: "Service updated",
          description: "Service has been successfully updated.",
        });
      } else {
        await servicesApi.createService(serviceData);
        toast({
          title: "Service created",
          description: "Service has been successfully created.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
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
              <FormLabel>Service Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Swedish Massage" {...field} />
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
              <FormControl>
                <ServiceCategorySelect
                  studioId={studioId}
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Select or enter a category"
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the service..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="60"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : service ? "Update Service" : "Create Service"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};