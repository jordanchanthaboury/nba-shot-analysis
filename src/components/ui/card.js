import React from 'react';

export const Card = ({ children, className = '', style, ...rest }) => {
  return (
    <div 
      className={`rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-4xl mx-auto ${className}`}
      style={style} 
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', style, ...rest }) => {
  return (
    <div 
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      style={style} 
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', style, ...rest }) => {
  return (
    <h2 
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      style={style} 
      {...rest}
    >
      {children}
    </h2>
  );
};

export const CardContent = ({ children, className = '', style, ...rest }) => {
  return (
    <div 
      className={`p-6 pt-0 w-full ${className}`}
      style={{ ...style, minWidth: '300px' }} 
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', style, ...rest }) => {
  return (
    <div 
      className={`flex items-center p-6 pt-0 ${className}`}
      style={style} 
      {...rest}
    >
      {children}
    </div>
  );
};