import { Hash, Plus, GripVertical, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useLists, type List } from '@/features/lists/hooks/useLists';
import { useTasks } from '@/features/tasks/hooks/useTasks';

function SpaceItem({ 
  list, 
  activeListId, 
  setActiveListId, 
  taskCount, 
  onDelete, 
  onDragEnd 
}: { 
  list: List; 
  activeListId: string | null; 
  setActiveListId: (id: string | null) => void; 
  taskCount: number; 
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDragEnd: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item 
      value={list}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, filter: 'blur(4px)', y: -10 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className="relative"
    >
      <div
        onClick={() => setActiveListId(activeListId === list.id ? null : list.id)}
        className={`w-full flex items-center justify-between gap-4 p-3 rounded-xl border transition-all duration-300 group cursor-pointer ${
          activeListId === list.id 
            ? 'bg-card/60 border-border/40 shadow-inset-edge text-foreground' 
            : 'bg-transparent border-transparent hover:border-border/20 hover:bg-muted/30 text-muted-foreground/80'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <div 
            onPointerDown={(e) => dragControls.start(e)}
            className="opacity-0 group-hover:opacity-40 hover:!opacity-100 cursor-grab active:cursor-grabbing transition-opacity -ml-1 flex-shrink-0" 
            title="Drag to reorder"
            style={{ touchAction: 'none' }}
          >
            <GripVertical size={14} />
          </div>
          <span className={`transition-colors ${activeListId === list.id ? 'text-primary/70' : 'text-muted-foreground/40 group-hover:text-muted-foreground/60'}`}>
            {list.icon || <Hash size={14} />}
          </span>
          <span className="text-sm font-medium truncate">{list.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
            {taskCount}
          </span>
          <button 
            onClick={(e) => onDelete(list.id, e)}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all p-1.5 rounded-lg active:scale-90 flex-shrink-0"
            title="Delete Space"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export function SpacesList() {
  const activeListId = useStore(state => state.activeListId);
  const setActiveListId = useStore(state => state.setActiveListId);
  
  const { lists, createList, reorderLists, deleteList, isLoading: isListsLoading } = useLists();
  const { tasks } = useTasks();
  
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [localLists, setLocalLists] = useState<List[]>([]);
  const localListsRef = useRef<List[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only update local lists if lists change from server (and preserve length)
    // to prevent server optimistic update from wiping local drag state before drag ends
    if (lists) {
      setLocalLists(lists);
      localListsRef.current = lists;
    }
  }, [lists]);

  useEffect(() => {
    if (isCreatingList) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCreatingList]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      setIsCreatingList(false);
      return;
    }
    
    await createList({ name: newListName.trim() });
    setNewListName('');
    setIsCreatingList(false);
  };

  const getTaskCount = (listId: string) => {
    if (!tasks) return 0;
    return tasks.filter(t => t.list_id === listId).length;
  };

  const handleDeleteList = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeListId === id) setActiveListId(null);
    await deleteList(id);
  };

  const handleReorder = (newOrder: List[]) => {
    setLocalLists(newOrder); // Update UI locally during drag
    localListsRef.current = newOrder; // Track synchronously for drag end
  };

  const handleDragEnd = () => {
    reorderLists(localListsRef.current.map(l => l.id)); // Sync to database when drop happens
  };

  if (isListsLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground/40 uppercase">
          Spaces
        </h2>
      </div>

      <div className="space-y-1">
        <Reorder.Group axis="y" values={localLists} onReorder={handleReorder} className="space-y-1">
          <AnimatePresence initial={false}>
            {localLists.map(list => (
              <SpaceItem
                key={list.id}
                list={list}
                activeListId={activeListId}
                setActiveListId={setActiveListId}
                taskCount={getTaskCount(list.id)}
                onDelete={handleDeleteList}
                onDragEnd={handleDragEnd}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {isCreatingList ? (
          <form onSubmit={handleCreateList} className="px-3 py-2 mt-2">
            <input
              ref={inputRef}
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onBlur={() => {
                if (!newListName.trim()) setIsCreatingList(false);
              }}
              placeholder="Space name..."
              className="w-full bg-transparent border-b border-border/40 pb-1 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </form>
        ) : (
          <button 
            onClick={() => setIsCreatingList(true)}
            className="w-full flex items-center gap-3 px-3 py-3 mt-1 text-sm font-medium text-muted-foreground/40 hover:text-foreground/80 transition-colors group rounded-xl hover:bg-muted/30"
          >
            <Plus size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="text-[12px]">New Space</span>
          </button>
        )}
      </div>
    </div>
  );
}
