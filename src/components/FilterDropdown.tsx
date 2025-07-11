import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  // Updated department options to exclude "Assembly" but keep "Final Assembly"
  const departmentOptions = [
    'All Departments',
    'Cut Shop',
    'Weld Shop', 
    'Powder Coat',
    'Ped Set',
    'Final Assembly',
    'Maintenance',
    'Quality Control'
  ];

  const currentOptions = label === 'Department' ? departmentOptions : options;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-green-900 border-green-700 text-white hover:bg-green-800 hover:text-white"
      >
        <span>{value}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-green-800 border border-green-700 rounded-md shadow-lg">
            {currentOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className="w-full px-3 py-2 text-left text-white hover:bg-green-700 flex items-center justify-between first:rounded-t-md last:rounded-b-md"
              >
                <span>{option}</span>
                {value === option && (
                  <Check className="h-4 w-4 text-green-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FilterDropdown;