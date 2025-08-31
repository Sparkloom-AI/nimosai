import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServiceCategorySuggestions } from "@/utils/serviceCategoryMapping";
import { businessCategoriesApi } from "@/api/businessCategories";

interface ServiceCategoryMultiSelectProps {
  studioId: string;
  value: string[];
  onChange: (categories: string[]) => void;
  placeholder?: string;
  required?: boolean;
}

export function ServiceCategoryMultiSelect({
  studioId,
  value = [],
  onChange,
  placeholder = "Select categories...",
  required = false
}: ServiceCategoryMultiSelectProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setLoading(true);
        
        // Get studio's business categories
        const { data: studioCategories } = await businessCategoriesApi.getStudioCategories(studioId);
        const businessCategoryNames = studioCategories.map(cat => cat.category_name);
        
        // Generate service category suggestions
        const serviceSuggestions = getServiceCategorySuggestions(businessCategoryNames);
        setSuggestions(serviceSuggestions);
      } catch (error) {
        console.error('Error loading suggestions:', error);
        // Fallback to empty suggestions
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (studioId) {
      loadSuggestions();
    }
  }, [studioId]);

  const handleSelectCategory = (category: string) => {
    if (!value.includes(category)) {
      onChange([...value, category]);
    }
    setOpen(false);
  };

  const handleRemoveCategory = (category: string) => {
    onChange(value.filter(cat => cat !== category));
  };

  const handleAddCustomCategory = () => {
    const trimmedInput = customInput.trim();
    if (trimmedInput && !value.includes(trimmedInput)) {
      onChange([...value, trimmedInput]);
      setCustomInput("");
      setShowCustomInput(false);
    }
  };

  const handleCustomInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomCategory();
    } else if (e.key === "Escape") {
      setCustomInput("");
      setShowCustomInput(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-10 bg-muted animate-pulse rounded-md"></div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Selected categories display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((category) => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              {category}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => handleRemoveCategory(category)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Category selector */}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
            >
              {value.length === 0 ? placeholder : `${value.length} categories selected`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search categories..." />
              <CommandList>
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandGroup>
                  {suggestions.map((category) => (
                    <CommandItem
                      key={category}
                      value={category}
                      onSelect={() => handleSelectCategory(category)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(category) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {category}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowCustomInput(!showCustomInput)}
          title="Add custom category"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Custom category input */}
      {showCustomInput && (
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomInputKeyDown}
            placeholder="Enter custom category..."
            className="flex-1"
          />
          <Button 
            onClick={handleAddCustomCategory}
            disabled={!customInput.trim() || value.includes(customInput.trim())}
          >
            Add
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setCustomInput("");
              setShowCustomInput(false);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}