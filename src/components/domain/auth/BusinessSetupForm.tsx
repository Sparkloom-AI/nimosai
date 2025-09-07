import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
const businessSetupSchema = z.object({
  businessName: z.string().min(1, 'Business name is required')
});
type BusinessSetupFormData = z.infer<typeof businessSetupSchema>;
interface BusinessSetupFormProps {
  onBack: () => void;
  onComplete: (data: BusinessSetupFormData) => void;
}
const BusinessSetupForm: React.FC<BusinessSetupFormProps> = ({
  onBack,
  onComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    validateForm,
    isValidating
  } = useSecurityValidation();
  const form = useForm<BusinessSetupFormData>({
    resolver: zodResolver(businessSetupSchema),
    defaultValues: {
      businessName: ''
    }
  });
  const onSubmit = async (data: BusinessSetupFormData) => {
    setIsLoading(true);
    try {
      // Security validation for business setup data
      const validationResult = await validateForm({
        businessName: data.businessName
      });
      if (!validationResult.isValid || !validationResult.sanitizedData) {
        return;
      }
      onComplete({
        businessName: validationResult.sanitizedData.businessName
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Account setup</p>
              <h1 className="text-3xl font-bold mb-4">
                What's your business name?
              </h1>
              <p className="text-muted-foreground">
                This is the brand name your clients will see. Your billing and legal name can be added later.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="businessName" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-sm font-medium">Business name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your business name" className="h-12 text-base" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90" disabled={isLoading || isValidating}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block flex-1 bg-muted">
        <ResponsiveImage src="/lovable-uploads/5101447c-92ce-49c1-8837-5de26eeff4b6.png" alt="Professional using Nimos" variant="hero" overlay={true} overlayContent={<>
              <h2 className="text-2xl font-bold mb-2">Set Up Your Business</h2>
              
            </>} />
      </div>
    </div>;
};
export default BusinessSetupForm;