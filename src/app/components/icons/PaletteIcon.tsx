import React from "react";

interface PaletteIconProps {
  className?: string;
}

const PaletteIcon: React.FC<PaletteIconProps> = ({ className }) => {
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
        d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 8.88406 1.49639 9.73115 1.79508 10.5133C1.90067 10.7922 1.95347 10.9316 1.96448 11.0396C1.97539 11.1467 1.96812 11.2149 1.94033 11.3182C1.91234 11.4224 1.85101 11.5359 1.72836 11.763L1.04558 12.9715C0.811789 13.3815 0.694894 13.5865 0.724041 13.7443C0.749436 13.8814 0.833549 13.9995 0.953862 14.0693C1.09233 14.1497 1.32831 14.1043 1.80028 14.0133L4.99295 13.3724C5.18513 13.333 5.28122 13.3133 5.36716 13.3089C5.44446 13.3049 5.47589 13.3071 5.55166 13.3132C5.63674 13.3199 5.72995 13.3467 5.91636 13.4002C6.73729 13.645 7.35245 13.7564 8 13.7564"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5.33333" cy="6.66667" r="0.666667" fill="currentColor" />
      <circle cx="10" cy="5.33333" r="0.666667" fill="currentColor" />
      <circle cx="10.6667" cy="9.33333" r="0.666667" fill="currentColor" />
    </svg>
  );
};

export default PaletteIcon;
