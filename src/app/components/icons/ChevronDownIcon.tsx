import React from "react";

interface ChevronDownIconProps {
  className?: string;
}

const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({ className }) => {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 3L4 6L7 3"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ChevronDownIcon;
