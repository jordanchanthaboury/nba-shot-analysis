import React from 'react';

export const Select = ({ children, value, onValueChange }) => {
  return (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  );
};

export const SelectTrigger = ({children}) => {
    return <>{children}</>
}

export const SelectValue = ({placeholder}) => {
    return <option value="">{placeholder}</option>
}

export const SelectContent = ({children}) => {
    return <>{children}</>
}

export const SelectItem = ({value, children}) => {
    return <option value={value}>{children}</option>
}