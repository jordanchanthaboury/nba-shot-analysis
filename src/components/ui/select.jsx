import React from 'react';

export function Select({ value, onValueChange, children, ...props }) {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full p-2 border rounded-md"
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children }) {
  return <div className="relative">{children}</div>;
}

export function SelectValue({ placeholder }) {
  return <span>{placeholder}</span>;
}

export function SelectContent({ children }) {
  return <div className="absolute w-full bg-white border rounded-md mt-1">{children}</div>;
}

export function SelectItem({ value, children }) {
  return (
    <option value={value} className="p-2 hover:bg-gray-100">
      {children}
    </option>
  );
} 