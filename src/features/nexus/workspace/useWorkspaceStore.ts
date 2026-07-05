import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


export type PaneType = 'note' | 'pdf' | 'video' | 'youtube' | 'reel';

export interface WorkspacePane {
  id: string; // Unique ID for the pane instance
  type: PaneType;
  entityId?: string; // note ID, URL, etc.
  content?: any; // drafts, etc.
  isReadOnly?: boolean;
}

export type SplitDirection = 'horizontal' | 'vertical';

export interface SplitNode {
  id: string;
  type: 'split';
  direction: SplitDirection;
  splitRatio: number; // e.g., 0.5
  first: LayoutNode;
  second: LayoutNode;
}

export interface PaneNode {
  id: string;
  type: 'pane';
  pane: WorkspacePane;
}

export type LayoutNode = SplitNode | PaneNode;

interface WorkspaceState {
  isOpen: boolean;
  mode: 'single' | 'workspace';
  isFullscreen: boolean;
  layout: LayoutNode | null;
  activePaneId: string | null;

  // Actions
  openWorkspace: () => void;
  closeWorkspace: () => void;
  setMode: (mode: 'single' | 'workspace') => void;
  toggleFullscreen: () => void;
  
  // Layout Actions
  setFocus: (paneId: string) => void;
  openSingle: (pane: Omit<WorkspacePane, 'id'>) => void;
  openPane: (pane: Omit<WorkspacePane, 'id'>, targetPaneId?: string, direction?: SplitDirection) => void;
  closePane: (paneId: string) => void;
  updateSplitRatio: (splitId: string, ratio: number) => void;
  updatePaneState: (paneId: string, updates: Partial<WorkspacePane>) => void;
  toggleReadOnly: (paneId: string) => void;
  
  // Utilities
  _findNode: (root: LayoutNode, id: string) => LayoutNode | null;
}

function replaceNode(root: LayoutNode, targetId: string, newNode: LayoutNode | null): LayoutNode | null {
  if (root.id === targetId) return newNode;
  if (root.type === 'split') {
    const first = replaceNode(root.first, targetId, newNode);
    const second = replaceNode(root.second, targetId, newNode);
    
    // If one child was completely removed (newNode = null), the split collapses
    if (!first && second) return second;
    if (first && !second) return first;
    if (!first && !second) return null;
    
    return { ...root, first: first!, second: second! };
  }
  return root;
}

function findNode(root: LayoutNode | null, targetId: string): LayoutNode | null {
  if (!root) return null;
  if (root.id === targetId) return root;
  if (root.type === 'split') {
    return findNode(root.first, targetId) || findNode(root.second, targetId);
  }
  return null;
}

function updateNodeState(root: LayoutNode, paneId: string, updates: Partial<WorkspacePane>): LayoutNode {
  if (root.type === 'pane' && root.id === paneId) {
    return { ...root, pane: { ...root.pane, ...updates } };
  }
  if (root.type === 'split') {
    return {
      ...root,
      first: updateNodeState(root.first, paneId, updates),
      second: updateNodeState(root.second, paneId, updates),
    };
  }
  return root;
}

function updateSplitNodeRatio(root: LayoutNode, splitId: string, ratio: number): LayoutNode {
  if (root.type === 'split') {
    if (root.id === splitId) {
      return { ...root, splitRatio: ratio };
    }
    return {
      ...root,
      first: updateSplitNodeRatio(root.first, splitId, ratio),
      second: updateSplitNodeRatio(root.second, splitId, ratio),
    };
  }
  return root;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, _get) => ({
      isOpen: false,
      mode: 'single',
      isFullscreen: false,
      layout: null,
      activePaneId: null,

      openWorkspace: () => set({ isOpen: true, mode: 'workspace', isFullscreen: true }),
      closeWorkspace: () => set({ isOpen: false }),
      setMode: (mode) => set({ mode }),
      toggleFullscreen: () => set(state => ({ isFullscreen: !state.isFullscreen })),

      setFocus: (paneId: string) => set({ activePaneId: paneId }),

      openSingle: (paneData) => set((_state) => {
        const newPaneId = crypto.randomUUID();
        const newPaneNode: PaneNode = {
          id: newPaneId,
          type: 'pane',
          pane: { ...paneData, id: newPaneId }
        };
        return { layout: newPaneNode, activePaneId: newPaneId, isOpen: true, mode: 'single', isFullscreen: false };
      }),

      openPane: (paneData, targetPaneId, direction = 'horizontal') => set((state) => {
        const newPaneId = crypto.randomUUID();
        const newPaneNode: PaneNode = {
          id: newPaneId,
          type: 'pane',
          pane: { ...paneData, id: newPaneId }
        };

        let newLayout = state.layout;

        if (!newLayout) {
          // First pane
          newLayout = newPaneNode;
        } else if (targetPaneId) {
          // Split an existing pane
          const targetNode = findNode(newLayout, targetPaneId);
          if (targetNode) {
            const splitNode: SplitNode = {
              id: crypto.randomUUID(),
              type: 'split',
              direction,
              splitRatio: 0.5,
              first: targetNode,
              second: newPaneNode
            };
            newLayout = replaceNode(newLayout, targetPaneId, splitNode);
          }
        } else {
          // No target specified, just split the root horizontally
          const splitNode: SplitNode = {
            id: crypto.randomUUID(),
            type: 'split',
            direction: 'horizontal',
            splitRatio: 0.5,
            first: newLayout,
            second: newPaneNode
          };
          newLayout = splitNode;
        }

        return {
          layout: newLayout,
          activePaneId: newPaneId,
          isOpen: true,
          mode: 'workspace',
          isFullscreen: true
        };
      }),

      closePane: (paneId: string) => set((state) => {
        if (!state.layout) return state;
        
        const newLayout = replaceNode(state.layout, paneId, null);
        
        return {
          layout: newLayout,
          // If we closed the active pane, unset it
          activePaneId: state.activePaneId === paneId ? null : state.activePaneId,
          // Close workspace completely if no panes left
          isOpen: newLayout !== null
        };
      }),

      updateSplitRatio: (splitId: string, ratio: number) => set((state) => {
        if (!state.layout) return state;
        return {
          layout: updateSplitNodeRatio(state.layout, splitId, ratio)
        };
      }),

      updatePaneState: (paneId: string, updates: Partial<WorkspacePane>) => set((state) => {
        if (!state.layout) return state;
        return {
          layout: updateNodeState(state.layout, paneId, updates)
        };
      }),

      toggleReadOnly: (paneId: string) => set((state) => {
        if (!state.layout) return state;
        const target = findNode(state.layout, paneId);
        if (target && target.type === 'pane') {
          return {
            layout: updateNodeState(state.layout, paneId, { isReadOnly: !target.pane.isReadOnly })
          };
        }
        return state;
      }),

      _findNode: (root, id) => findNode(root, id),
    }),
    {
      name: 'nexus-workspace-storage',
      storage: createJSONStorage(() => localStorage),
      // We don't persist 'isOpen' so the workspace doesn't auto-open on page reload unless intended,
      // but we do persist the layout and panes.
      partialize: (state) => ({ layout: state.layout }),
    }
  )
);
