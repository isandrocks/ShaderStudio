import React from "react";

const MaximizeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="3.75"
      y="3.75"
      width="8.5"
      height="8.5"
      rx="1.25"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default MaximizeIcon;
