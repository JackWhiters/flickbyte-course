// components/ui/RadioGroup.tsx
import * as React from 'react';

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup = ({ value, onValueChange, children, className }: RadioGroupProps) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement<any>, {
          checked: value === (child as React.ReactElement<any>).props.value,
          onChange: () => onValueChange((child as React.ReactElement<any>).props.value),
        })
      )}
    </div>
  );
};

interface RadioGroupItemProps {
  value: string;
  label: string;
  checked?: boolean;
  onChange?: () => void;
}

export const RadioGroupItem = ({ value, label, checked, onChange }: RadioGroupItemProps) => (
  <label className="flex items-center space-x-2">
    <input type="radio" value={value} checked={checked} onChange={onChange} />
    <span>{label}</span>
  </label>
);
