import React from 'react';

export const Card = ({ children, className = '', style, ...rest }) => {
  return (
    <div className={`card ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', style, ...rest }) => {
  return (
    <div className={`card-header ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', style, ...rest }) => {
  return (
    <h2 className={`card-title ${className}`} style={style} {...rest}>
      {children}
    </h2>
  );
};

export const CardContent = ({ children, className = '', style, ...rest }) => {
  return <div className={`card-content ${className}`} style={style} {...rest}>{children}</div>;
};

export const CardFooter = ({ children, className = '', style, ...rest }) => {
    return <div className={`card-footer ${className}`} style={style} {...rest}>{children}</div>
}