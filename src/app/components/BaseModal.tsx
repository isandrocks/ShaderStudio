import React from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  closeOnBackdrop?: boolean;
}

/**
 * Base modal component that provides common modal structure
 * - Backdrop with optional click-to-close
 * - Card container with border
 * - Header with title and X button
 * - Scrollable content area
 * - Optional footer for action buttons
 */
export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "w-96",
  closeOnBackdrop = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center
        z-50"
      onClick={(e) =>
        closeOnBackdrop && e.target === e.currentTarget && onClose()
      }
    >
      <div
        className={`bg-[#2c2c2c] rounded-lg border border-[#3c3c3c] ${maxWidth}
          flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div
          className="p-4 border-b border-[#3c3c3c] flex justify-between
            items-center shrink-0"
        >
          <h3 className="text-base font-semibold text-white m-0">{title}</h3>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-[#999999] text-xl
              cursor-pointer p-0 w-6 h-6 flex items-center justify-center
              rounded transition-all duration-150 hover:bg-[#3c3c3c]
              hover:text-white"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">{children}</div>

        {/* Footer (optional) */}
        {footer && (
          <div
            className="p-4 border-t border-[#3c3c3c] flex gap-2 justify-end
              shrink-0"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
