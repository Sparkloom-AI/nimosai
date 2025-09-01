import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Scissors, Hand, Eye, ShoppingBag, Sparkles, Zap, Bed, Droplets, Wand2, Heart, Sun, Bike, Dumbbell, Plus, Stethoscope, PawPrint, Grid3X3, Loader2, Flower, Shield, Brush, Flame, Dog, Star } from 'lucide-react';
import { businessCategoriesApi } from '@/api/businessCategories';
import { studiosApi } from '@/api/studios';
import { BusinessCategory, Studio } from '@/types/studio';
import { toast } from 'sonner';

interface SettingsBusinessCategoryFormProps {
  currentStudio: Studio;
  onComplete: (data: { primary: string; additional: string[] }) => void;
  onBack: () => void;
}

// Icon mapping for different business categories
const getIconForCategory = (categoryName: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'Beauty Salon': Sparkles,
    'Barber': Scissors,
    'Nails': Hand,
    'Spa & sauna': Flower,
    'Massage': Zap,
    'Fitness & recovery': Dumbbell,
    'Tattooing & piercing': Shield,
    'Medspa': Stethoscope,
    'Hair Salon': Brush,
    'Eyebrows & lashes': Eye,
    'Waxing salon': Flame,
    'Tanning studio': Sun,
    'Physical therapy': Heart,
    'Health practice': Stethoscope,
    'Pet grooming': Dog,
    'Other': Star,
  };
  
  return iconMap[categoryName] || ShoppingBag;
};

const SettingsBusinessCategoryForm: React.FC<SettingsBusinessCategoryFormProps> = ({ 
  currentStudio, 
  onComplete, 
  onBack 
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load business categories
        const categories = await businessCategoriesApi.getBusinessCategories();
        setBusinessCategories(categories);

        // Load current studio categories
        const studioCategories = await businessCategoriesApi.getStudioCategories(currentStudio.id);
        const studioCats = studioCategories.data || [];
        
        // Set selected categories with primary first
        const primary = studioCats.find(cat => cat.is_primary);
        const additional = studioCats.filter(cat => !cat.is_primary);
        
        const orderedSelection = [
          ...(primary ? [primary.category_id] : []),
          ...additional.map(cat => cat.category_id)
        ];
        
        setSelectedCategories(orderedSelection);
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load business categories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentStudio.id]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else if (prev.length < 4) { // Allow up to 4 selections (1 primary + 3 additional)
        return [...prev, categoryId];
      }
      return prev;
    });
  };

  const handleContinue = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setSaving(true);
    try {
      const primary = selectedCategories[0]; // First selected becomes primary
      const additional = selectedCategories.slice(1); // Rest are additional
      
      // Update studio categories in database
      await studiosApi.updateStudioCategories(
        currentStudio.id,
        primary,
        additional
      );

      toast.success('Business categories updated successfully!');
      onComplete({ primary, additional });
    } catch (error) {
      console.error('Error updating categories:', error);
      toast.error('Failed to update business categories');
    } finally {
      setSaving(false);
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
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Settings Wizard • Step 2 of 4</p>
              <h1 className="text-3xl font-bold mb-4">
                Update your business categories
              </h1>
              <p className="text-muted-foreground">
                Choose your primary category and up to 3 related service types (first selected becomes primary)
              </p>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {businessCategories.map((category) => {
              const IconComponent = getIconForCategory(category.name);
              const isSelected = selectedCategories.includes(category.id);
              const isPrimary = selectedCategories[0] === category.id;
              
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20 ${
                    isSelected ? 'border-primary shadow-sm bg-primary/5' : ''
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="font-medium text-sm">
                        {category.name}
                        {isPrimary && <span className="ml-1 text-xs text-primary font-semibold">(Primary)</span>}
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
              disabled={selectedCategories.length === 0 || saving}
            >
              {saving ? 'Saving...' : 'Continue'}
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
          <h2 className="text-2xl font-bold mb-2">Choose Your Categories</h2>
          <p className="text-white/90 text-lg">
            Help clients find you by selecting the right business categories
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsBusinessCategoryForm;