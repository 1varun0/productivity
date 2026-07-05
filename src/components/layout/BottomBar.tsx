import { LayoutDashboard, Activity, Calendar, Plus, User } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomBar() {
  const openCaptureModal = useStore((state) => state.openCaptureModal);
  const openSettingsModal = useStore((state) => state.openSettingsModal);
  const setActiveListId = useStore((state) => state.setActiveListId);
  const navigate = useNavigate();
  const location = useLocation();

  const isOverview = location.pathname === '/app';
  const isHabits = location.pathname === '/app/habits';
  const isTimetable = location.pathname.startsWith('/app/timetable');

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto w-fit md:hidden z-50">
      <div className="flex items-center gap-2 p-2 rounded-full bg-popover/80 backdrop-blur-xl border border-border/40 shadow-premium shadow-inset-edge">
        <button 
          onClick={() => {
            navigate('/app');
            setActiveListId(null);
          }}
          className={`w-12 h-12 flex items-center justify-center rounded-full hover:bg-accent/50 transition-colors active:scale-95 ${isOverview ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <LayoutDashboard size={20} />
        </button>
        <button 
          onClick={() => navigate('/app/habits')}
          className={`w-12 h-12 flex items-center justify-center rounded-full hover:bg-accent/50 transition-colors active:scale-95 ${isHabits ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Activity size={20} />
        </button>
        
        <div className="px-2">
          <button 
            onClick={openCaptureModal}
            className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border border-border/10 shadow-inset-edge"
          >
            <Plus size={24} />
          </button>
        </div>

        <button 
          onClick={() => navigate('/app/timetable')}
          className={`w-12 h-12 flex items-center justify-center rounded-full hover:bg-accent/50 transition-colors active:scale-95 ${isTimetable ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Calendar size={20} />
        </button>
        <button 
          onClick={openSettingsModal}
          className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-accent/50 transition-colors active:scale-95"
        >
          <User size={20} />
        </button>
      </div>
    </div>
  );
}
