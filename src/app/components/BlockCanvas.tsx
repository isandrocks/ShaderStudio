/**
 * Block Canvas - Display canvas for block arrangement
 */

import React, { useState, useRef } from "react";
import { BlockInstance } from "../types";
import { BlockNode } from "./BlockNode";

interface BlockCanvasProps {
  blocks: BlockInstance[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
  onRemoveBlock: (blockId: string) => void;
  onConnect: (fromBlockId: string, outputId: string, toBlockId: string, inputId: string) => void;
}

interface DragState {
  blockId: string;
  outputId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const BlockCanvas: React.FC<BlockCanvasProps> = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onRemoveBlock,
  onConnect,
}) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      // Clicked on empty canvas
      onSelectBlock(null);
    }
  };

  const handleBlockClick = (blockId: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelectBlock(blockId);
  };

  const handleOutputMouseDown = (
    blockId: string,
    outputId: string,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    setDragState({
      blockId,
      outputId,
      startX: rect.left - canvasRect.left + rect.width / 2,
      startY: rect.top - canvasRect.top + rect.height / 2,
      currentX: e.clientX - canvasRect.left,
      currentY: e.clientY - canvasRect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDragState({
      ...dragState,
      currentX: e.clientX - canvasRect.left,
      currentY: e.clientY - canvasRect.top,
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState) return;
    
    // Check if we're over an input port
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.classList.contains('input-port')) {
      const targetBlockId = target.getAttribute('data-block-id');
      const targetInputId = target.getAttribute('data-input-id');
      
      if (targetBlockId && targetInputId && targetBlockId !== dragState.blockId) {
        onConnect(dragState.blockId, dragState.outputId, targetBlockId, targetInputId);
      }
    }
    
    setDragState(null);
  };

  const setBlockRef = (blockId: string, element: HTMLDivElement | null) => {
    if (element) {
      blockRefs.current.set(blockId, element);
    } else {
      blockRefs.current.delete(blockId);
    }
  };

  // Helper to get connection lines for existing connections
  const getConnectionLines = () => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; color: string }> = [];
    
    blocks.forEach((block) => {
      Object.entries(block.inputValues).forEach(([_inputId, value]) => {
        if (typeof value === 'string' && value.includes(':')) {
          // This is a connection
          const [fromBlockId, _fromOutputId] = value.split(':');
          const fromBlock = blocks.find(b => b.id === fromBlockId);
          
          if (fromBlock) {
            const fromElement = blockRefs.current.get(fromBlockId);
            const toElement = blockRefs.current.get(block.id);
            
            if (fromElement && toElement && canvasRef.current) {
              const canvasRect = canvasRef.current.getBoundingClientRect();
              const fromRect = fromElement.getBoundingClientRect();
              const toRect = toElement.getBoundingClientRect();
              
              lines.push({
                x1: fromRect.right - canvasRect.left,
                y1: fromRect.top - canvasRect.top + fromRect.height / 2,
                x2: toRect.left - canvasRect.left,
                y2: toRect.top - canvasRect.top + toRect.height / 2,
                color: '#3b82f6',
              });
            }
          }
        }
      });
    });
    
    return lines;
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative overflow-auto bg-gray-900"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(0deg, #ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* SVG overlay for connection lines */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {/* Existing connections */}
        {getConnectionLines().map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color}
            strokeWidth="2"
            opacity="0.6"
          />
        ))}
        
        {/* Active drag line */}
        {dragState && (
          <line
            x1={dragState.startX}
            y1={dragState.startY}
            x2={dragState.currentX}
            y2={dragState.currentY}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.8"
          />
        )}
      </svg>

      {/* Blocks Container */}
      <div className="relative p-8 min-h-full" style={{ zIndex: 20 }}>
        {blocks.map((block) => (
          <div
            key={block.id}
            ref={(el) => setBlockRef(block.id, el)}
            style={{
              position: "relative",
              display: "inline-block",
              marginRight: "20px",
              marginBottom: "20px",
              verticalAlign: "top",
            }}
          >
            <BlockNode
              block={block}
              isSelected={selectedBlockId === block.id}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => handleBlockClick(block.id, e)}
              onDelete={() => onRemoveBlock(block.id)}
              onOutputMouseDown={handleOutputMouseDown}
            />
          </div>
        ))}
      </div>

      {/* Help Text Overlay */}
      {blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-gray-600 text-center">
            <p className="text-lg font-semibold mb-2">Add blocks to start building</p>
            <p className="text-sm">Click blocks in the palette to add them here</p>
          </div>
        </div>
      )}
    </div>
  );
};
