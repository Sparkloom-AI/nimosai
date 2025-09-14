import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { languages } from '@/hooks/useIPLocationDetection';

interface LanguageSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select language",
  className
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.name}>
            <div className="flex items-center">
              <span className="text-lg mr-2">{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
