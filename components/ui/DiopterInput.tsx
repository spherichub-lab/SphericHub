import React, { useState, useEffect, forwardRef } from 'react';

interface DiopterInputProps {
  label: string;
  value: string; // We keep it as string for flexible typing
  onChange: (value: string) => void;
  type: 'ESF' | 'CIL';
  placeholder?: string;
  required?: boolean;
}

export const DiopterInput = forwardRef<HTMLInputElement, DiopterInputProps>(({
  label,
  value,
  onChange,
  type,
  placeholder,
  required
}, ref) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const validateAndFormat = (input: string): string => {
    if (!input || input === '-' || input === '+') return '';

    let num = parseFloat(input.replace(',', '.'));
    
    if (isNaN(num)) return '';

    if (type === 'CIL') {
      // CIL Rule: Always negative
      num = -Math.abs(num);
    } else {
      // ESF Rule: Positive by default unless '-' explicitly typed (handled by parsing),
      // but if user types "2.00", parseFloat is 2. We format with + later if needed.
    }

    return num.toFixed(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    // Allow typing valid characters including minus sign at start
    if (/^[-+]?[0-9]*[.,]?[0-9]*$/.test(newVal)) {
      setDisplayValue(newVal);
      // We don't propagate incomplete inputs to parent state immediately 
      // to avoid validation errors while typing, 
      // BUT for "instant validation feel" we might want to. 
      // The requirement says "Validar apenas valores numéricos", usually best done on Blur for exact format.
      // However, to keep parent updated with raw data:
      onChange(newVal); 
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const formatted = validateAndFormat(displayValue);
    
    if (formatted) {
      // Add plus sign for positive numbers in ESF
      const finalValue = (type === 'ESF' && parseFloat(formatted) > 0) 
        ? `+${formatted}` 
        : formatted;
      
      setDisplayValue(finalValue);
      onChange(finalValue);
    } else {
      // If invalid, clear or revert? Let's clear if it's garbage.
      if (displayValue !== '' && displayValue !== '-') {
        // preserve if user wants to fix it? Let's keep display value but logic might fail.
        // Requirement: "Validar apenas valores numéricos" implies strictness.
      }
    }
  };

  // Determine text color based on value logic
  // Negative = Red
  // Positive = Normal (Gray-900)
  const isNegative = displayValue.startsWith('-');
  const textColorClass = isNegative ? 'text-red-600 font-semibold' : 'text-gray-900';

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white ${textColorClass}`}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
        required={required}
      />
      {type === 'CIL' && (
        <p className="text-xs text-gray-500 mt-1">Sempre negativo (ex: 1.00 vira -1.00)</p>
      )}
    </div>
  );
});

DiopterInput.displayName = 'DiopterInput';