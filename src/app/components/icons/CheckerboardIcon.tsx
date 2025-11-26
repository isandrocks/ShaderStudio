import React from "react";

const CheckerboardIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 0H8V8H0V0ZM8 8H16V16H8V8ZM0 8H8V16H0V8ZM8 0H16V8H8V0Z"
      fill="currentColor"
    />
  </svg>
);

export default CheckerboardIcon;
