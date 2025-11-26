import React from "react";
import { BaseModal } from "../BaseModal";
import { LAYER_TEMPLATES } from "../../layerTemplates";

interface EffectPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}

export const EffectPicker: React.FC<EffectPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  // Group templates by type
  const groupedTemplates = LAYER_TEMPLATES.reduce(
    (acc, template) => {
      if (!acc[template.type]) {
        acc[template.type] = [];
      }
      acc[template.type].push(template);
      return acc;
    },
    {} as Record<string, typeof LAYER_TEMPLATES>,
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Layer"
      maxWidth="w-[500px]"
    >
      <div className="space-y-6">
        {Object.entries(groupedTemplates).map(([type, templates]) => (
          <div key={type}>
            <h3
              className="text-xs font-bold text-[#999] uppercase tracking-wider
                mb-2"
            >
              {type}s
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelect(template.id);
                    onClose();
                  }}
                  className="flex flex-col items-center p-3 bg-[#2a2a2a]
                    hover:bg-[#3c3c3c] rounded border border-[#3c3c3c]
                    hover:border-primary transition-colors text-left group"
                >
                  <div
                    className="text-2xl mb-2 group-hover:scale-110
                      transition-transform"
                  >
                    {template.icon}
                  </div>
                  <div className="text-xs font-medium text-white mb-1">
                    {template.name}
                  </div>
                  <div
                    className="text-[10px] text-[#999] text-center
                      leading-tight"
                  >
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};
