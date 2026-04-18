import React from 'react';

export default function Card({ children, className = '', padding = 'p-6', animate = true }) {
  return (
    <div className={`
      bg-white rounded-[2rem] border border-outline-variant/10 shadow-sm
      ${animate ? 'animate-slide-up transition-all hover:shadow-md' : ''}
      ${padding}
      ${className}
    `}>
      {children}
    </div>
  );
}
