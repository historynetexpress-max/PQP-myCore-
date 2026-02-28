
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40, color = 'currentColor' }) => {
  const id = React.useId().replace(/:/g, '');
  const gradientId = `logoGradient-${id}`;
  const filterId = `glow-${id}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <blur stdDeviation="2" result="blur" />
          <composite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer Hexagon */}
      <path 
        d="M50 5 L89 27.5 V72.5 L50 95 L11 72.5 V27.5 L50 5Z" 
        stroke={`url(#${gradientId})`} 
        strokeWidth="4" 
        fill="rgba(79, 70, 229, 0.1)"
      />
      
      {/* Inner Core */}
      <circle cx="50" cy="50" r="15" fill={`url(#${gradientId})`} filter={`url(#${filterId})`} />
      
      {/* Orbiting Elements */}
      <path 
        d="M50 20 A30 30 0 0 1 80 50" 
        stroke="#fff" 
        strokeWidth="2" 
        strokeLinecap="round" 
        opacity="0.6"
      />
      <path 
        d="M50 80 A30 30 0 0 1 20 50" 
        stroke="#fff" 
        strokeWidth="2" 
        strokeLinecap="round" 
        opacity="0.6"
      />
      
      {/* Neural Lines */}
      <line x1="50" y1="35" x2="50" y2="15" stroke="#4f46e5" strokeWidth="2" opacity="0.4" />
      <line x1="50" y1="65" x2="50" y2="85" stroke="#4f46e5" strokeWidth="2" opacity="0.4" />
      <line x1="65" y1="50" x2="85" y2="50" stroke="#4f46e5" strokeWidth="2" opacity="0.4" />
      <line x1="35" y1="50" x2="15" y2="50" stroke="#4f46e5" strokeWidth="2" opacity="0.4" />
    </svg>
  );
};

export default Logo;
