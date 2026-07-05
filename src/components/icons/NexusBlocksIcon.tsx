

export const NexusBlocksIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="7" y="3" width="10" height="6" rx="1.5" />
    <rect x="4" y="10" width="8" height="6" rx="1.5" />
    <rect x="13" y="10" width="7" height="6" rx="1.5" />
    <rect x="4" y="17" width="16" height="4" rx="1.5" />
  </svg>
);
