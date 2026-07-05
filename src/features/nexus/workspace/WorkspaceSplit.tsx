import React, { useRef, useState, useEffect } from 'react';
import type { LayoutNode, SplitNode } from './useWorkspaceStore';
import { useWorkspaceStore } from './useWorkspaceStore';
import { WorkspacePaneComponent } from './WorkspacePane';

interface WorkspaceSplitProps {
  node: LayoutNode;
}

export function WorkspaceSplit({ node }: WorkspaceSplitProps) {
  const updateSplitRatio = useWorkspaceStore((state) => state.updateSplitRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isSplit = node.type === 'split';
  const splitNode = isSplit ? (node as SplitNode) : null;
  const isHorizontal = isSplit && splitNode?.direction === 'horizontal';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !splitNode) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      let newRatio = splitNode.splitRatio;
      if (isHorizontal) {
        const relativeX = e.clientX - rect.left;
        newRatio = relativeX / rect.width;
      } else {
        const relativeY = e.clientY - rect.top;
        newRatio = relativeY / rect.height;
      }

      // Constrain ratio between 10% and 90%
      newRatio = Math.max(0.1, Math.min(0.9, newRatio));
      if (splitNode) {
        updateSplitRatio(splitNode.id, newRatio);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isHorizontal, splitNode?.id, splitNode?.splitRatio, updateSplitRatio]);

  if (node.type === 'pane') {
    return <WorkspacePaneComponent pane={node.pane} />;
  }

  if (!splitNode) return null;

  return (
    <div 
      ref={containerRef}
      className={`flex w-full h-full ${isHorizontal ? 'flex-row' : 'flex-col'}`}
    >
      <div 
        style={{ 
          [isHorizontal ? 'width' : 'height']: `${splitNode.splitRatio * 100}%` 
        }}
        className="flex-shrink-0 overflow-hidden min-w-0 min-h-0"
      >
        <WorkspaceSplit node={splitNode.first} />
      </div>

      <div 
        role="separator"
        onMouseDown={handleMouseDown}
        className={`
          flex items-center justify-center bg-transparent group z-50
          ${isHorizontal ? 'w-1 cursor-col-resize -mx-[2px]' : 'h-1 cursor-row-resize -my-[2px]'}
        `}
      >
        <div 
          className={`
            bg-white/0 group-hover:bg-[#c5c0ff]/30 transition-colors duration-200
            ${isDragging ? '!bg-[#c5c0ff]/60' : ''}
            ${isHorizontal ? 'w-[2px] h-full' : 'h-[2px] w-full'}
          `} 
        />
      </div>

      <div className="flex-1 overflow-hidden min-w-0 min-h-0">
        <WorkspaceSplit node={splitNode.second} />
      </div>

      {isDragging && (
        <div className="fixed inset-0 z-[100] cursor-crosshair" />
      )}
    </div>
  );
}
