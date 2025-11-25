import React from "react";

interface VideoIconProps {
  className?: string;
}

const VideoIcon: React.FC<VideoIconProps> = ({ className = "w-4 h-4" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="3"
        width="10"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M11 6L14.5 4V12L11 10V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default VideoIcon;
