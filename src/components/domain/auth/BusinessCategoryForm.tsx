
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Scissors, Hand, Eye, ShoppingBag, Sparkles, Zap, Bed, Droplets, Wand2, Heart, Sun, Bike, Dumbbell, Plus, Stethoscope, PawPrint, Grid3X3 } from 'lucide-react';

interface BusinessCategory {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
}

const businessCategories: BusinessCategory[] = [
  { id: 'hair-salon', title: 'Hair salon', icon: Scissors },
  { id: 'nails', title: 'Nails', icon: Hand },
  { id: 'eyebrows-lashes', title: 'Eyebrows & lashes', icon: Eye },
  { id: 'beauty-salon', title: 'Beauty salon', icon: ShoppingBag },
  { id: 'medspa', title: 'Medspa', icon: Sparkles },
  { id: 'barber', title: 'Barber', icon: Zap },
  { id: 'massage', title: 'Massage', icon: Bed },
  { id: 'spa-sauna', title: 'Spa & sauna', icon: Droplets },
  { id: 'waxing-salon', title: 'Waxing salon', icon: Wand2 },
  { id: 'tattooing-piercing', title: 'Tattooing & piercing', icon: Heart },
  { id: 'tanning-studio', title: 'Tanning studio', icon: Sun },
  { id: 'fitness-recovery', title: 'Fitness & recovery', icon: Bike },
  { id: 'physical-therapy', title: 'Physical therapy', icon: Stethoscope },
  { id: 'health-practice', title: 'Health practice', icon: Plus },
  { id: 'pet-grooming', title: 'Pet grooming', icon: PawPrint },
  { id: 'other', title: 'Other', icon: Grid3X3 },
];

interface BusinessCategoryFormProps {
  onBack: () => void;
  onComplete: (categories: string[]) => void;
}

const BusinessCategoryForm: React.FC<BusinessCategoryFormProps> = ({ onBack, onComplete }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else if (prev.length < 4) { // Allow up to 4 selections (1 primary + 3 related)
        return [...prev, categoryId];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (selectedCategories.length > 0) {
      onComplete(selectedCategories);
    }
  };

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
                Choose your primary and up to 3 related service type
              </p>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {businessCategories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategories.includes(category.id);
              
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
                        {category.title}
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
