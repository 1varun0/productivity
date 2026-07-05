import { LayoutDashboard, CheckSquare, Clock, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function BottomBar() {
  const openCaptureModal = useStore((state) => state.openCaptureModal);

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto w-fit md:hidden z-50">
      <div className="flex items-center gap-2 p-2 rounded-full bg-popover/80 backdrop-blur-xl border border-border/40 shadow-premium shadow-inset-edge">
        <button className="w-12 h-12 flex items-center justify-center text-primary rounded-full hover:bg-accent/50 transition-colors active:scale-95">
          <LayoutDashboard size={20} />
        </button>
        <button className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-accent/50 transition-colors active:scale-95">
          <CheckSquare size={20} />
        </button>
        
        <div className="px-2">
          <button 
            onClick={openCaptureModal}
            className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border border-border/10 shadow-inset-edge"
          >
            <Plus size={24} />
          </button>
        </div>

        <button className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-accent/50 transition-colors active:scale-95">
          <Clock size={20} />
        </button>
        <button className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-accent/50 transition-colors active:scale-95">
          <div className="w-6 h-6 rounded-full bg-accent" />
        </button>
      </div>
    </div>
  );
}
