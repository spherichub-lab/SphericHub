import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8 w-8" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="VisuLab Logo"
    >
      {/* Outer Shape: The Lab/Inventory Container or Main Lens Block */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="2" 
        className="opacity-90"
      />
      
      {/* Stacked Lenses (The Stock) - Curved lines representing meniscus lens profiles */}
      {/* Top Lens */}
      <path 
        d="M7 8 C 7 8, 12 11, 17 8" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Middle Lens */}
      <path 
        d="M7 12 C 7 12, 12 15, 17 12" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Bottom Lens */}
      <path 
        d="M7 16 C 7 16, 12 19, 17 16" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Optical Reflection/Glint Detail */}
      <path 
        d="M16 5 A 10 10 0 0 1 20 9" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        className="opacity-60"
      />
    </svg>
  );
};