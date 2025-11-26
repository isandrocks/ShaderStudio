import React from "react";

const NoiseIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M2 2H4V4H2V2ZM6 2H8V4H6V2ZM10 2H12V4H10V2ZM14 2H16V4H14V2ZM2 6H4V8H2V6ZM6 6H8V8H6V6ZM10 6H12V8H10V6ZM14 6H16V8H14V6ZM2 10H4V12H2V10ZM6 10H8V12H6V10ZM10 10H12V12H10V10ZM14 10H16V12H14V10ZM2 14H4V16H2V14ZM6 14H8V16H6V14ZM10 14H12V16H10V14ZM14 14H16V16H14V14Z"
      fill="currentColor"
    />
  </svg>
);

export default NoiseIcon;
