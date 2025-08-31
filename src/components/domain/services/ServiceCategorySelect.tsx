import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServiceCategorySuggestions } from "@/utils/serviceCategoryMapping";
import { businessCategoriesApi } from "@/api/businessCategories";

interface ServiceCategorySelectProps {
  studioId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const ServiceCategorySelect = ({
  studioId,
  value,
  onChange,
  placeholder = "Select or enter a category",
  required = false
}: ServiceCategorySelectProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setLoading(true);
        
        // Get studio's business categories
        const { data: studioCategories } = await businessCategoriesApi.getStudioCategories(studioId);
        const businessCategoryNames = studioCategories?.map(cat => cat.category_name) || [];
        
        // Get service category suggestions based on business categories
        const serviceSuggestions = getServiceCategorySuggestions(businessCategoryNames);
        setSuggestions(serviceSuggestions);
        
        // Check if current value is in suggestions
        if (value && !serviceSuggestions.includes(value)) {
          setIsCustom(true);
          setCustomValue(value);
        }
      } catch (error) {
        console.error('Error loading service category suggestions:', error);
        // Fallback to empty suggestions
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (studioId) {
      loadSuggestions();
    }
  }, [studioId, value]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "custom") {
      setIsCustom(true);
      setCustomValue(value || "");
    } else {
      setIsCustom(false);
      setCustomValue("");
      onChange(selectedValue);
    }
  };

  const handleCustomInputChange = (inputValue: string) => {
    setCustomValue(inputValue);
    onChange(inputValue);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Category {required && <span className="text-destructive">*</span>}</Label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Category {required && <span className="text-destructive">*</span>}</Label>
      
      {isCustom ? (
        <div className="space-y-2">
          <Input
            value={customValue}
            onChange={(e) => handleCustomInputChange(e.target.value)}
            placeholder="Enter custom category"
            required={required}
          />
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              setCustomValue("");
              onChange("");
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Choose from suggestions instead
          </button>
        </div>
      ) : (
        <Select
          value={value && suggestions.includes(value) ? value : ""}
          onValueChange={handleSelectChange}
          required={required}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {suggestions.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
            <SelectItem value="custom">
              <span className="text-muted-foreground">Enter custom category...</span>
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};