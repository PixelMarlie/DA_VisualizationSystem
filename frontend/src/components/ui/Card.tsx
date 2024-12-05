import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card: React.FC<CardProps> = ({
  children, 
  className = '', 
  style = {}, 
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <div 
      className={className}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '20px',
        display: 'inline-block', // Allow content to determine width
        maxWidth: '100%', // Ensure it doesn't overflow
        ...style
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};

// Optional: If you want separate CardHeader and CardContent components
export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ marginBottom: '16px' }}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    {children}
  </div>
);