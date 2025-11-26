import React from "react";

interface EditIconProps {
  className?: string;
}

const EditIcon: React.FC<EditIconProps> = ({ className }) => {
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
        d="M11.3333 2.00004C11.5084 1.82494 11.716 1.68605 11.9444 1.59129C12.1728 1.49653 12.4176 1.44775 12.6653 1.44775C12.9131 1.44775 13.1578 1.49653 13.3862 1.59129C13.6147 1.68605 13.8222 1.82494 13.9973 2.00004C14.1724 2.17513 14.3113 2.38263 14.4061 2.61107C14.5008 2.83951 14.5496 3.08429 14.5496 3.33204C14.5496 3.57978 14.5008 3.82456 14.4061 4.053C14.3113 4.28144 14.1724 4.48894 13.9973 4.66404L4.99999 13.6614L1.33333 14.6667L2.33866 11L11.3333 2.00004Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EditIcon;
