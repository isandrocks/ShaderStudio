import React from "react";

interface FolderIconProps {
  className?: string;
}

const FolderIcon: React.FC<FolderIconProps> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.6667 12.6667C14.6667 13.0203 14.5262 13.3594 14.2761 13.6095C14.0261 13.8595 13.687 14 13.3333 14H2.66667C2.31304 14 1.97391 13.8595 1.72386 13.6095C1.47381 13.3594 1.33333 13.0203 1.33333 12.6667V3.33333C1.33333 2.97971 1.47381 2.64057 1.72386 2.39052C1.97391 2.14048 2.31304 2 2.66667 2H5.33333L6.66667 4H13.3333C13.687 4 14.0261 4.14048 14.2761 4.39052C14.5262 4.64057 14.6667 4.97971 14.6667 5.33333V12.6667Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FolderIcon;
