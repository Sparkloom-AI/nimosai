import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { StepActions } from '@/components/domain/settings/StepActions';
import { useToast } from '@/components/ui/use-toast';
import { studiosApi } from '@/api/studios';
import { useRole } from '@/contexts/RoleContext';

const formSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
});

type FormData = z.infer<typeof formSchema>;

interface BusinessNameLogoStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLastStep?: boolean;
}

export const BusinessNameLogoStep = ({ 
  onNext, 
  onPrevious, 
  hasNext = true, 
  hasPrevious = false,
  isLastStep = false 
}: BusinessNameLogoStepProps) => {
  const { toast } = useToast();
  const { currentStudio, refreshRoles } = useRole();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (currentStudio) {
      form.reset({
        name: currentStudio.name || '',
      });
    }
  }, [currentStudio, form]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setLoading(true);
    try {
      await studiosApi.updateStudio(currentStudio.id, {
        name: data.name,
      });

      // TODO: Handle logo upload when storage is configured
      if (logoFile) {
        toast({
          title: 'Note',
          description: 'Logo upload will be available soon',
        });
      }

      await refreshRoles();
      
      toast({
        title: 'Success',
        description: 'Business name updated successfully',
      });
      // Stay on the page after save; navigation is handled by explicit buttons
    } catch (error) {
      console.error('Error updating business name:', error);
      toast({
        title: 'Error',
        description: 'Failed to update business name',
        variant: 'destructive',
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
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <label className="text-sm font-medium">Business Logo</label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 200x200px, PNG or JPG
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          
          {/* Navigation Buttons */}
          <StepActions
            onPrevious={onPrevious}
            onNext={onNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            isLastStep={isLastStep}
          />
        </div>
      </form>
    </Form>
  );
};