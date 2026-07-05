import { useEffect, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2, ChevronLeft, ChevronRight, Plus, Cloud, CheckCircle2, RotateCcw } from 'lucide-react';
import type { TimetableBlock } from '../types';
import { useWeeklyTimetable } from '../hooks/useWeeklyTimetable';
import { TimetableGrid } from './TimetableGrid';
import { BlockModal } from './BlockModal';
import { PremadeBlocksTray } from './PremadeBlocksTray';
import { CopyBlockModal } from './CopyBlockModal';
import { AddDeadlineModal } from './AddDeadlineModal';
import { MarkerTooltip } from './DueDateMarkerRow';
import { getWeekEnd } from '@/store/useWeeklyTimetableStore';
import { formatDistanceToNow } from 'date-fns';

export function TimetablePage() {
  const {
    blocks,
    blocksByDay,
    today,
    isDirty,
    lastSaved,
    fetchBlocks,
    addBlock,
    updateBlock,
    deleteBlock,
    manualSave,
    undo,
    currentWeekStart,
    dueDateMarkers,
    setWeekOffset,
    addDeadline,
    fetchDeadlinesAndTasks,
  } = useWeeklyTimetable();

  // Fetch on mount
  useEffect(() => {
    fetchBlocks();
    fetchDeadlinesAndTasks(currentWeekStart);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Global Undo listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        // Prevent default (e.g., browser undo) unless we are in an input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return; // Let native undo handle text inputs
        }
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalDay, setModalDay] = useState(0);
  const [modalHour, setModalHour] = useState(0);
  const [modalBlock, setModalBlock] = useState<TimetableBlock | null>(null);

  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);

  const handleCellClick = useCallback((day: number, hour: number) => {
    setModalMode('add');
    setModalDay(day);
    setModalHour(hour);
    setModalBlock(null);
    setModalOpen(true);
  }, []);

  const handleBlockClick = useCallback((block: TimetableBlock) => {
    setModalMode('edit');
    setModalDay(block.day);
    setModalHour(block.start_hour);
    setModalBlock(block);
    setModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setModalBlock(null);
  }, []);

  const [copyBlock, setCopyBlock] = useState<TimetableBlock | null>(null);
  
  const handleBlockContextMenu = useCallback((block: TimetableBlock, _e: React.MouseEvent) => {
    setCopyBlock(block);
  }, []);

  const handleCopyBlocks = async (days: number[]) => {
    if (!copyBlock) return;
    for (const d of days) {
      if (d === copyBlock.day) continue;
      await addBlock(d, copyBlock.start_hour, {
        name: copyBlock.name,
        category: copyBlock.category,
        color: copyBlock.color,
        duration: copyBlock.duration
      });
    }
    setCopyBlock(null);
  };

  const handleBlockDrop = useCallback((day: number, hour: number, payload: any): boolean => {
    // Check for conflicts
    const conflict = blocks.some(b => 
      b.day === day && 
      !b.archived &&
      (b.start_hour <= hour && b.start_hour + b.duration > hour)
    );

    if (conflict) {
      return false; // Reject drop
    }

    addBlock(day, hour, {
      name: payload.title || 'Untitled',
      category: payload.category || 'Custom',
      color: payload.color || '#4F46E5',
      duration: 1, // Instant 1-hour block
    });

    return true; // Accept drop
  }, [blocks, addBlock]);

  // Compact view state
  const [isCompact, setIsCompact] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const el = document.getElementById('timetable-export-container');
    const scrollContainer = el?.parentElement;
    if (!el || !scrollContainer) return;
    
    // Save original scroll
    const originalScrollLeft = scrollContainer.scrollLeft;
    const originalScrollTop = scrollContainer.scrollTop;
    
    // Reset scroll to top-left to fix sticky positioning offset during capture
    scrollContainer.scrollLeft = 0;
    scrollContainer.scrollTop = 0;
    
    setIsExporting(true);
    try {
      // Allow DOM to repaint scroll position
      await new Promise(r => setTimeout(r, 50));
      
      const canvas = await html2canvas(el, {
        backgroundColor: '#0f0f0f',
        scale: 2, // High resolution
        logging: false,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });
      
      const image = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = image;
      a.download = `timetable-${new Date().toISOString().split('T')[0]}.png`;
      a.click();
    } catch (err) {
      console.error('Failed to export timetable:', err);
    } finally {
      // Restore original scroll
      scrollContainer.scrollLeft = originalScrollLeft;
      scrollContainer.scrollTop = originalScrollTop;
      setIsExporting(false);
    }
  }, []);

  const [offset, setOffset] = useState(0);

  // Sync internal offset state with actual date changes
  useEffect(() => {
    const todayLocal = new Date();
    todayLocal.setHours(0, 0, 0, 0);
    const day = todayLocal.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    todayLocal.setDate(todayLocal.getDate() + diff);

    const weekDiff = Math.round((currentWeekStart.getTime() - todayLocal.getTime()) / (1000 * 60 * 60 * 24 * 7));
    setOffset(weekDiff);
  }, [currentWeekStart]);

  const weekEnd = getWeekEnd(currentWeekStart);

  function getWeekLabel(start: Date, end: Date): string {
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}, ${start.getFullYear()}`;
  }

  const [trayOpen, setTrayOpen] = useState(false);

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: '#0F0F0F' }}
    >
      {/* Unified Header */}
      <header
        className="flex items-center justify-between shrink-0 h-14 px-6 border-b border-[#1e1e1e]"
        style={{ backgroundColor: '#0f0f0f', zIndex: 40 }}
      >
        {/* Left: Title + Week Navigator */}
        <div className="flex items-center space-x-6">
          <h2 className="font-semibold text-[15px] tracking-wide text-[#e5e2e1] uppercase m-0">
            Timetable
          </h2>

          <div className="flex items-center space-x-3 border-l border-[#222] pl-6">
            <div className="flex items-center space-x-1">
              <button onClick={() => setWeekOffset(-1)} className="p-1 rounded-md text-[#555] hover:text-[#aaa] hover:bg-[#161616] border border-[#1e1e1e] transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setWeekOffset(1)} className="p-1 rounded-md text-[#555] hover:text-[#aaa] hover:bg-[#161616] border border-[#1e1e1e] transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
            <span className="text-[12px] text-[#888] font-medium tracking-wide">
              {getWeekLabel(currentWeekStart, weekEnd)}
            </span>
            {offset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-[9px] font-bold text-[#555] border border-[#222] rounded-[4px] px-2 py-0.5 uppercase hover:text-[#aaa] hover:border-[#444] transition-colors">
                TODAY
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors group"
            style={{
              backgroundColor: isCompact ? '#1a1a1a' : '#0f0f0f',
              border: isCompact ? '1px solid #333' : '1px solid #1e1e1e',
              color: isCompact ? '#e5e2e1' : '#666',
            }}
            title="Toggle Compact View"
          >
            <span className="text-[9px] font-bold tracking-wider uppercase group-hover:text-[#aaa]">
              Compact
            </span>
            <div style={{ width: 16, height: 8, borderRadius: 4, backgroundColor: isCompact ? '#534AB7' : '#222', position: 'relative', transition: 'background-color 0.2s' }}>
              <div style={{ position: 'absolute', top: 1, left: isCompact ? 9 : 1, width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', transition: 'left 0.2s' }} />
            </div>
          </button>

          <button
            onClick={() => setDeadlineModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#AFA9EC] hover:bg-[#161616] border border-[#1e1e1e] rounded-full transition-colors"
          >
            <Plus size={12} />
            <span>Deadline</span>
          </button>

          <div className="h-4 w-[1px] bg-[#222]" />

          {/* Save Status / Undo */}
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              title="Undo"
              className="p-1.5 rounded text-[#666] hover:text-[#eee] hover:bg-[#161616] transition-colors"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={manualSave}
              title={lastSaved ? `Last saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}` : 'Not saved yet'}
              className="p-1.5 rounded flex items-center transition-colors"
              style={{ color: isDirty ? '#AFA9EC' : '#555', backgroundColor: isDirty ? '#161616' : 'transparent' }}
            >
              {isDirty ? <Cloud size={14} /> : <CheckCircle2 size={14} />}
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#222]" />

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-1.5 rounded text-[#666] hover:text-[#eee] hover:bg-[#161616] transition-colors disabled:opacity-50"
            title="Export as PNG"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          </button>
        </div>
      </header>

      {/* Grid */}
      <TimetableGrid
        blocksByDay={blocksByDay}
        today={today}
        isCompact={isCompact}
        currentWeekStart={currentWeekStart}
        dueDateMarkers={dueDateMarkers}
        onCellClick={handleCellClick}
        onBlockClick={handleBlockClick}
        onBlockContextMenu={handleBlockContextMenu}
        onBlockDrop={handleBlockDrop}
      />

      {/* Tray Toggle at bottom */}
      <div className="flex justify-center shrink-0 border-t border-[#1e1e1e]" style={{ backgroundColor: '#0f0f0f' }}>
        <button
          onClick={() => setTrayOpen(!trayOpen)}
          className="flex items-center justify-center w-32 py-1.5 rounded-t-md transition-colors border border-b-0 border-[#1e1e1e] group"
          style={{
            backgroundColor: trayOpen ? '#1a1a1a' : '#0a0a0a',
            color: trayOpen ? '#AFA9EC' : '#666',
            marginTop: -1
          }}
        >
          <span className="text-[9px] font-bold tracking-widest uppercase group-hover:text-[#aaa] transition-colors">
            {trayOpen ? 'Hide Blocks' : 'Show Blocks'}
          </span>
        </button>
      </div>

      {/* Premade Blocks Tray - Collapsible */}
      <div 
        style={{
          height: trayOpen ? 'auto' : '0px',
          overflow: 'hidden',
          transition: 'height 0.3s ease-in-out'
        }}
      >
        <PremadeBlocksTray />
      </div>

      {/* Modal — portalled outside grid */}
      <BlockModal
        isOpen={modalOpen}
        mode={modalMode}
        day={modalDay}
        hour={modalHour}
        block={modalBlock}
        allBlocks={blocks}
        onClose={handleClose}
        onAdd={addBlock}
        onUpdate={updateBlock}
        onDelete={deleteBlock}
      />

      {copyBlock && (
        <CopyBlockModal
          block={copyBlock}
          onClose={() => setCopyBlock(null)}
          onCopy={handleCopyBlocks}
        />
      )}

      <AddDeadlineModal
        isOpen={deadlineModalOpen}
        defaultDate={currentWeekStart}
        onClose={() => setDeadlineModalOpen(false)}
        onAdd={addDeadline}
      />

      <MarkerTooltip />
    </div>
  );
}
