import React from 'react';
import { COUNTRIES } from '../../constants/countries';

const SelectCountry = ({ 
  name, 
  value, 
  onChange, 
  required = false,
  label = "Pays",
  placeholder = "Afficher la liste" 
}) => {
  // Ensure value is always a string - with extra validation
  const safeValue = typeof value === 'object' ? 
    (value && value.toString ? value.toString() : "") : 
    (typeof value === 'string' ? value : "");
    
  // Custom change handler to ensure string values
  const handleChange = (e) => {
    try {
      // Get the raw selected value
      const rawValue = e.target.value;
      
      // Create a modified event with guaranteed string value
      const stringValue = String(rawValue || "");
      
      // Log the transformation for debugging
      console.log(`SelectCountry change for ${name}: ${stringValue} (original type: ${typeof rawValue})`);
      
      // Create a cloned event to avoid React synthetic event issues
      const modifiedEvent = {
        ...e,
        target: {
          ...e.target,
          name: name,  // Ensure the name is preserved
          value: stringValue
        }
      };
      
      // Call parent's onChange with the modified event that has a guaranteed string value
      onChange(modifiedEvent);
    } catch (error) {
      console.error(`Error in SelectCountry handleChange for ${name}:`, error);
      
      // Attempt to call onChange with a fallback minimal event object
      try {
        onChange({
          target: {
            name: name,
            value: ""
          }
        });
      } catch (fallbackError) {
        console.error("Failed to call onChange with fallback event:", fallbackError);
      }
    }
  };

  return (
    <div className={required ? 'block required' : 'block'}>
      <label>{required && '* '}{label}</label>
      <select 
        name={name} 
        value={safeValue} 
        onChange={handleChange} 
        required={required}
      >
        <option value="">{placeholder}</option>
        {COUNTRIES.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectCountry;