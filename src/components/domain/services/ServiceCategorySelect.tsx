import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serviceCategoriesApi } from '@/api/serviceCategories';

interface ServiceCategorySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const ServiceCategorySelect = ({ 
  value, 
  onValueChange, 
  placeholder = "Select a category" 
}: ServiceCategorySelectProps) => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['service-categories'],
    queryFn: serviceCategoriesApi.getServiceCategories,
  });

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading categories..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};