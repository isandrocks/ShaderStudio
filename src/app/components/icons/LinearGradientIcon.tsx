import React from "react";

const LinearGradientIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="16" height="16" rx="2" fill="url(#paint0_linear)" />
    <defs>
      <linearGradient
        id="paint0_linear"
        x1="0"
        y1="0"
        x2="16"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="currentColor" stopOpacity="0.2" />
        <stop offset="1" stopColor="currentColor" />
      </linearGradient>
    </defs>
  </svg>
);

export default LinearGradientIcon;
