import React from "react";

interface MinusIconProps {
  className?: string;
}

const MinusIcon: React.FC<MinusIconProps> = ({ className = "" }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M21 16H10V15H21V16Z" fill="currentColor" />
    </svg>
  );
};

export default MinusIcon;
