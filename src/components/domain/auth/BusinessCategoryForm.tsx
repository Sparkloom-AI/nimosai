
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Scissors, Hand, Eye, ShoppingBag, Sparkles, Zap, Bed, Droplets, Wand2, Heart, Sun, Bike, Dumbbell, Plus, Stethoscope, PawPrint, Grid3X3, Loader2 } from 'lucide-react';
import { businessCategoriesApi } from '@/api/businessCategories';
import { BusinessCategory } from '@/types/studio';
import { toast } from 'sonner';

interface BusinessCategoryFormProps {
  onBack: () => void;
  onComplete: (categories: string[]) => void;
}

// Icon mapping for different business categories
const getIconForCategory = (categoryName: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'Hair Salon': Scissors,
    'Nail Salon': Hand,
    'Beauty Salon': Eye,
    'Spa': Bed,
    'Barbershop': Zap,
    'Massage Therapy': Bed,
    'Fitness Studio': Dumbbell,
    'Yoga Studio': Bike,
    'Wellness Center': Heart,
    'Medical Spa': Sparkles,
    'Tattoo & Piercing': Heart,
    'General': Grid3X3,
  };
  
  return iconMap[categoryName] || ShoppingBag;
};

const BusinessCategoryForm: React.FC<BusinessCategoryFormProps> = ({ onBack, onComplete }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await businessCategoriesApi.getBusinessCategories();
        setBusinessCategories(categories);
      } catch (error: any) {
        console.error('Failed to fetch business categories:', error);
        toast.error('Failed to load business categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(name => name !== categoryName);
      } else if (prev.length < 4) { // Allow up to 4 selections (1 primary + 3 related)
        return [...prev, categoryName];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (selectedCategories.length > 0) {
      onComplete(selectedCategories);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Account setup</p>
              <h1 className="text-3xl font-bold mb-4">
                Select categories that best describe your business
              </h1>
              <p className="text-muted-foreground">
                Choose your primary and up to 3 related service types
              </p>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {businessCategories.map((category) => {
              const IconComponent = getIconForCategory(category.name);
              const isSelected = selectedCategories.includes(category.name);
              
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20 ${
                    isSelected ? 'border-primary shadow-sm bg-primary/5' : ''
                  }`}
                  onClick={() => handleCategoryToggle(category.name)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="font-medium text-sm">
                        {category.name}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selection info */}
          {selectedCategories.length > 0 && (
            <div className="mb-6 text-sm text-muted-foreground text-center">
              {selectedCategories.length}/4 categories selected
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleContinue}
              className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90"
              disabled={selectedCategories.length === 0}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block flex-1 bg-muted relative overflow-hidden">
        <img
          src="/lovable-uploads/5101447c-92ce-49c1-8837-5de26eeff4b6.png"
          alt="Professional using Nimos"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Choose Your Services</h2>
          <p className="text-white/90 text-lg">
            Select the categories that best represent your business offerings
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessCategoryForm;
