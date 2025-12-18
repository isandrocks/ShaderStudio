import React from "react";
import { BaseModal } from "../BaseModal";
import { LAYER_TEMPLATES } from "../../layerTemplates";
import ChevronDownIcon from "../icons/ChevronDownIcon";

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
  const [expandedVariants, setExpandedVariants] = React.useState<
    Record<string, boolean>
  >({});

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

  // Group gradients by base name
  const gradientGroups: Record<string, typeof LAYER_TEMPLATES> = {};
  const otherGradients: typeof LAYER_TEMPLATES = [];

  if (groupedTemplates.gradient) {
    groupedTemplates.gradient.forEach((template) => {
      // Check if it's a variant (has number in parentheses)
      const variantMatch = template.id.match(/^(.+)-(\d+)$/);
      if (variantMatch) {
        const baseName = variantMatch[1];
        if (!gradientGroups[baseName]) {
          gradientGroups[baseName] = [];
        }
        gradientGroups[baseName].push(template);
      } else {
        otherGradients.push(template);
      }
    });
  }

  const toggleVariants = (groupKey: string) => {
    setExpandedVariants((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

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
            <div className="space-y-2">
              {type === "gradient" ? (
                <>
                  {/* Main gradients without variants */}
                  <div className="grid grid-cols-3 gap-2">
                    {otherGradients.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          onSelect(template.id);
                          onClose();
                        }}
                        className="flex flex-col items-center p-3 bg-[#2a2a2a]
                          hover:bg-[#3c3c3c] rounded border border-[#3c3c3c]
                          hover:border-primary transition-colors text-left
                          group"
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

                  {/* Gradient variants with expandable sections */}
                  {Object.entries(gradientGroups).map(
                    ([baseName, variants]) => {
                      const baseTemplate = otherGradients.find(
                        (t) => t.id === baseName,
                      );
                      const isExpanded = expandedVariants[baseName];

                      return (
                        <div key={baseName} className="space-y-2">
                          <button
                            onClick={() => toggleVariants(baseName)}
                            className="w-full flex items-center justify-between
                              px-3 py-2 bg-[#2a2a2a] hover:bg-[#3c3c3c]
                              rounded border border-[#3c3c3c]
                              transition-colors text-left"
                          >
                            <span className="text-xs text-white">
                              {baseTemplate?.name || baseName} Variants
                            </span>
                            <ChevronDownIcon
                              className={`w-3 h-3 text-[#999]
                                transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="grid grid-cols-3 gap-2 pl-4">
                              {variants.map((template) => (
                                <button
                                  key={template.id}
                                  onClick={() => {
                                    onSelect(template.id);
                                    onClose();
                                  }}
                                  className="flex flex-col items-center p-3
                                    bg-[#2a2a2a] hover:bg-[#3c3c3c] rounded
                                    border border-[#3c3c3c]
                                    hover:border-primary transition-colors
                                    text-left group"
                                >
                                  <div
                                    className="text-2xl mb-2
                                      group-hover:scale-110
                                      transition-transform"
                                  >
                                    {template.icon}
                                  </div>
                                  <div
                                    className="text-xs font-medium text-white
                                      mb-1"
                                  >
                                    {template.name}
                                  </div>
                                  <div
                                    className="text-[10px] text-[#999]
                                      text-center leading-tight"
                                  >
                                    {template.description}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </>
              ) : (
                /* Non-gradient templates - display normally */
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
                        hover:border-primary transition-colors text-left
                        group"
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
              )}
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};
