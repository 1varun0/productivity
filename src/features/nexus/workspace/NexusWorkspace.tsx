import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from './useWorkspaceStore';
import { WorkspaceSplit } from './WorkspaceSplit';
import { X, Maximize2 } from 'lucide-react';

export function NexusWorkspace() {
  const isOpen = useWorkspaceStore(state => state.isOpen);
  const layout = useWorkspaceStore(state => state.layout);
  const mode = useWorkspaceStore(state => state.mode);
  const isFullscreen = useWorkspaceStore(state => state.isFullscreen);
  const closeWorkspace = useWorkspaceStore(state => state.closeWorkspace);
  const openPane = useWorkspaceStore(state => state.openPane);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // CMD+\ to split right (for currently active pane)
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        const activePaneId = useWorkspaceStore.getState().activePaneId;
        const direction = e.shiftKey ? 'vertical' : 'horizontal';
        openPane({ type: 'note' }, activePaneId || undefined, direction);
      }
      
      // Escape to close workspace if no layout
      if (e.key === 'Escape' && !layout) {
        closeWorkspace();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, layout, closeWorkspace, openPane]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#0e0e0e]/95 backdrop-blur-3xl z-[100] flex flex-col overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/4 w-[50%] h-[20%] bg-[#c5c0ff]/10 blur-[120px] rounded-full pointer-events-none" />
          
          {/* Workspace Top Bar - Only in Workspace Mode */}
          {mode === 'workspace' && (
            <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 shrink-0 relative z-10 bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[#c5c0ff] opacity-80">
                  <Maximize2 size={14} />
                  <span className="text-[11px] uppercase tracking-widest font-bold">Workspace</span>
                </div>
              </div>
              <button 
                onClick={closeWorkspace}
                className="text-[#928f9e] hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                title="Close Workspace (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Dynamic Split Layout */}
          <div className={`flex-1 flex overflow-hidden min-h-0 relative z-10 transition-all duration-500 ease-out ${
            mode === 'single' && !isFullscreen 
              ? 'w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8' 
              : `w-full ${isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'}`
          }`}>
            {layout ? (
              <WorkspaceSplit node={layout} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#928f9e]">
                <p className="text-sm font-mono mb-4">Workspace is empty</p>
                <button 
                  onClick={() => openPane({ type: 'note' })}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-xs font-medium transition-colors border border-white/10"
                >
                  Create New Note
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
