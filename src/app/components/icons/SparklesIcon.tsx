import React from "react";

const SparklesIcon: React.FC<{ className?: string; onClick?: () => void }> = ({
  className = "w-4 h-4",
  onClick,
}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
  >
    <path
      d="M8 1L9.5 5.5L14 7L9.5 8.5L8 13L6.5 8.5L2 7L6.5 5.5L8 1Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 11L12.75 13.25L15 14L12.75 14.75L12 17L11.25 14.75L9 14L11.25 13.25L12 11Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="scale(0.6) translate(10, 0)"
    />
  </svg>
);

export default SparklesIcon;
