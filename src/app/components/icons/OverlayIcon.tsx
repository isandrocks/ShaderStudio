import React from "react";

const OverlayIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="2"
      y="2"
      width="12"
      height="12"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M2 8H14"
      stroke="currentColor"
      strokeWidth="1"
      strokeDasharray="2 2"
    />
    <path
      d="M8 2V14"
      stroke="currentColor"
      strokeWidth="1"
      strokeDasharray="2 2"
    />
  </svg>
);

export default OverlayIcon;
