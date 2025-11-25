import React from "react";

const PlusIcon: React.FC<{ onClick?: () => void; title?: string }> = ({
  onClick,
  title,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || "Add"}
      aria-label={title || "Add"}
      className="bg-transparent border-none p-0 cursor-pointer outline-none
        transition-colors duration-150 flex items-center justify-center"
    >
      <svg
        className="fill-primary h-4 w-4 hover:fill-white transition-colors duration-150"
        viewBox="0 0 12.7 12.7"
        version="1.1"
        id="plusIcon"
      >
        <defs id="defs1" />
        <g id="layer1">
          <path
            d="m 5.953125,1.5482776 0,4.4048474 H 1.4557248 A 0.39687467,0.39687467 135 0 0 1.0588501,6.3499997 v 0.00805 A 0.38779585,0.38779585 45 0 0 1.4466459,6.7458415 H 5.953125 V 11.245825 A 0.3968749,0.3968749 45 0 0 6.3499999,11.6427 0.3958416,0.3958416 135 0 0 6.7458415,11.246858 V 6.7458415 H 11.246858 A 0.39584183,0.39584183 135 0 0 11.6427,6.3499997 v 0 A 0.39687467,0.39687467 45 0 0 11.245825,5.953125 H 6.7458415 V 1.4546919 A 0.39584183,0.39584183 45 0 0 6.3499997,1.0588501 0.44556075,0.44556075 129.03845 0 0 5.953125,1.5482776 Z"
            id="path9"
          />
        </g>
      </svg>
    </button>
  );
};

export default PlusIcon;
