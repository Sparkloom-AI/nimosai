import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { businessCategoriesApi } from "@/api/businessCategories";
import { getGroupedServiceCategorySuggestions } from "@/utils/serviceCategoryMapping";
import { ChevronDown, Plus, X } from "lucide-react";

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
  placeholder = "Select a category...",
  required = false,
}: ServiceCategorySelectProps) => {
  const [groupedSuggestions, setGroupedSuggestions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const studioCategories = await businessCategoriesApi.getStudioCategories(studioId);
        const businessCategoryNames = studioCategories.data.map(cat => cat.category_name);
        const grouped = getGroupedServiceCategorySuggestions(businessCategoryNames);
        setGroupedSuggestions(grouped);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setGroupedSuggestions({});
      } finally {
        setLoading(false);
      }
    };

    if (studioId) {
      fetchCategories();
    }
  }, [studioId]);

  const handleSelectCategory = (category: string) => {
    onChange(category);
    setOpen(false);
  };

  const handleAddCustomCategory = () => {
    if (customInput.trim()) {
      onChange(customInput.trim());
      setCustomInput("");
      setShowCustomInput(false);
      setOpen(false);
    }
  };

  const handleCustomInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomCategory();
    } else if (e.key === 'Escape') {
      setCustomInput("");
      setShowCustomInput(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9"
          >
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {value || placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              {Object.entries(groupedSuggestions).map(([businessCategory, serviceCategories]) => (
                <CommandGroup key={businessCategory} heading={businessCategory}>
                  {serviceCategories.map((category) => (
                    <CommandItem
                      key={category}
                      value={category}
                      onSelect={() => handleSelectCategory(category)}
                      className="cursor-pointer"
                    >
                      {category}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              <CommandGroup>
                {!showCustomInput ? (
                  <CommandItem onSelect={() => setShowCustomInput(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add custom category
                  </CommandItem>
                ) : (
                  <div className="p-2 space-y-2">
                    <Input
                      placeholder="Enter custom category..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={handleCustomInputKeyDown}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddCustomCategory}
                        disabled={!customInput.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCustomInput("");
                          setShowCustomInput(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};