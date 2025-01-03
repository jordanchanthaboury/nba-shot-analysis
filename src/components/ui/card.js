import React from 'react';

export const Card = ({ children }) => {
  return <div className="border rounded p-4">{children}</div>;
};

export const CardHeader = ({ children }) => {
    return <div className="pb-4 border-b">{children}</div>
}

export const CardTitle = ({children}) => {
    return <h2 className="text-lg font-semibold">{children}</h2>
}

export const CardContent = ({children}) => {
    return <div>{children}</div>
}