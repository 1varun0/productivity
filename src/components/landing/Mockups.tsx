import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Crosshairs = () => (
  <>
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20"></div>
  </>
);

export const TasksMockup = () => {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActive(prev => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden font-label-mono flex bg-[#131315]/50 border border-white/10 rounded">
            <Crosshairs />
            {/* Sidebar */}
            <div className="w-1/3 border-r border-white/10 p-4 hidden sm:flex flex-col gap-3">
                <div className="text-[10px] text-white/50 mb-2">SPACES</div>
                {[0, 1, 2].map(i => (
                    <div key={i} className={`h-6 rounded border ${i === 0 ? 'border-[#534AB7] bg-[#534AB7]/20' : 'border-white/5'} px-2 flex items-center`}>
                        <div className="w-2 h-2 rounded-full bg-white/20 mr-2"></div>
                        <div className={`h-1.5 rounded w-12 ${i === 0 ? 'bg-white' : 'bg-white/20'}`}></div>
                    </div>
                ))}
            </div>
            {/* Main */}
            <div className="flex-1 p-4 flex flex-col relative overflow-hidden">
                <div className="text-[10px] text-white/50 mb-4 border-b border-white/10 pb-2">TODAY'S TASKS</div>
                <div className="flex flex-col gap-3 relative h-full">
                    <AnimatePresence>
                        {[0, 1, 2].map((i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ 
                                    opacity: 1, 
                                    y: i < active ? -20 : 0, 
                                    scale: i === active ? 1.02 : 1,
                                }}
                                className={`p-3 border rounded flex items-center gap-3 transition-colors ${i === active ? 'border-[#534AB7] bg-[#534AB7]/10 z-10' : 'border-white/10 bg-white/[0.02]'}`}
                                style={{ 
                                    display: i < active ? 'none' : 'flex' 
                                }}
                            >
                                <motion.div 
                                    className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center flex-shrink-0"
                                    animate={i === active ? { scale: [1, 1.2, 1], borderColor: ['rgba(255,255,255,0.3)', '#534AB7', 'rgba(255,255,255,0.3)'] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    {i < active && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </motion.div>
                                <div className="flex-1 relative">
                                    <div className={`h-2 rounded w-3/4 ${i === active ? 'bg-white' : 'bg-white/40'}`}></div>
                                    {i === active && (
                                        <motion.div 
                                            className="absolute top-1/2 left-0 h-px bg-[#534AB7]"
                                            initial={{ width: 0 }}
                                            animate={{ width: "75%" }}
                                            transition={{ duration: 0.5, delay: 2 }}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
            <div className="absolute bottom-2 left-2 text-[8px] text-white/30">I-01 // TASKS_SPACES</div>
        </div>
    );
};

export const FocusMockup = () => {
    const [time, setTime] = useState(24 * 60 + 37);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prev => (prev > 0 ? prev - 1 : 24 * 60 + 37));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const mins = Math.floor(time / 60).toString().padStart(2, '0');
    const secs = (time % 60).toString().padStart(2, '0');
    const progress = (time / (25 * 60)) * 100;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="w-full h-full relative overflow-hidden font-label-mono flex items-center justify-center bg-[#131315]/80 border border-white/10 rounded">
            <Crosshairs />
            <motion.div 
                className="absolute w-32 h-32 rounded-full bg-[#534AB7]/10 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                    <motion.circle 
                        cx="50" cy="50" r="40" fill="transparent" 
                        stroke="#534AB7" strokeWidth="2"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "linear" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="text-center z-10 font-mono">
                    <div className="text-3xl text-white tracking-wider font-light">{mins}:{secs}</div>
                    <div className="text-[10px] text-[#534AB7] mt-1 tracking-widest">DEEP WORK</div>
                </div>
            </div>
            <div className="absolute bottom-2 right-2 text-[8px] text-white/30">T-02 // FOCUS_TIMER</div>
        </div>
    );
};

export const NexusMockup = () => {
    const text = "The architecture scales horizontally.\nWe need to ensure zero-downtime deployments.\n";
    const [typed, setTyped] = useState("");

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i <= text.length) {
                setTyped(text.slice(0, i));
                i++;
            } else {
                i = 0;
                setTyped("");
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden font-label-mono flex bg-[#131315] border border-white/10 rounded">
            <Crosshairs />
            {/* Pinned Note */}
            <div className="w-1/3 border-r border-white/10 p-4 bg-white/[0.01] hidden sm:block">
                <div className="text-[8px] text-white/40 mb-3 flex items-center gap-1"> ARCHITECTURE.md</div>
                <div className="space-y-2">
                    <div className="h-1.5 w-full bg-white/20 rounded"></div>
                    <div className="h-1.5 w-4/5 bg-white/20 rounded"></div>
                    <div className="h-1.5 w-5/6 bg-white/20 rounded"></div>
                </div>
            </div>
            {/* Editor */}
            <div className="flex-1 p-4 relative flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                    <div className="text-[10px] text-white">system_design.md</div>
                    <motion.div 
                        className="text-[8px] text-[#534AB7]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >Saving...</motion.div>
                </div>
                <div className="flex-1 text-[12px] text-white/80 whitespace-pre-wrap leading-relaxed">
                    {typed}<span className="inline-block w-1.5 h-3 bg-white/50 animate-pulse ml-0.5 align-middle"></span>
                </div>
                
                {/* Slash Command Hint */}
                <motion.div 
                    className="absolute bottom-6 left-6 right-6 border border-white/10 bg-background/90 backdrop-blur p-2 rounded flex items-center gap-2"
                    animate={{ opacity: typed.length > 5 && typed.length < 15 ? 1 : 0, y: typed.length > 5 && typed.length < 15 ? 0 : 10 }}
                >
                    <div className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">/</div>
                    <div className="text-[10px] text-white/50">Type '/' for commands</div>
                </motion.div>
            </div>
            <div className="absolute bottom-2 left-2 text-[8px] text-white/30">N-03 // MARKDOWN_ENGINE</div>
        </div>
    );
};

export const HabitsMockup = () => {
    const cols = 12;
    const rows = 5;
    
    return (
        <div className="w-full h-full relative overflow-hidden font-label-mono p-6 bg-[#131315] border border-white/10 rounded flex flex-col justify-center">
            <Crosshairs />
            <div className="text-[10px] text-white/50 mb-4 flex justify-between">
                <span>CONSISTENCY_GRID</span>
                <span className="text-[#534AB7]">84% COMPLETION</span>
            </div>
            
            <div className="grid grid-cols-12 gap-1 mb-6 relative">
                {/* Perfect streak shimmer */}
                <motion.div 
                    className="absolute top-[20%] left-0 w-full h-[20%] bg-gradient-to-r from-transparent via-[#534AB7]/30 to-transparent z-10 pointer-events-none"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {Array.from({ length: rows * cols }).map((_, i) => {
                    const isToday = i === rows * cols - 1;
                    const isActive = Math.random() > 0.3 || (i >= cols && i < cols*2);
                    return (
                        <motion.div 
                            key={i}
                            className={`aspect-square rounded-sm ${isActive ? 'bg-[#534AB7]/80' : 'bg-white/5'}`}
                            animate={isToday ? { scale: [1, 1.1, 1], backgroundColor: ['rgba(255,255,255,0.05)', 'rgba(83,74,183,0.5)', 'rgba(255,255,255,0.05)'] } : {}}
                            transition={isToday ? { duration: 1.5, repeat: Infinity } : {}}
                        />
                    );
                })}
            </div>
            
            <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
                <motion.div 
                    className="h-full bg-[#534AB7]"
                    initial={{ width: 0 }}
                    animate={{ width: '84%' }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                />
            </div>
            <div className="absolute bottom-2 right-2 text-[8px] text-white/30">H-04 // CONSISTENCY_GRID</div>
        </div>
    );
};

export const TimetableMockup = () => {
    return (
        <div className="w-full h-full relative overflow-hidden font-label-mono p-4 bg-[#131315] border border-white/10 rounded flex gap-4">
            <Crosshairs />
            {/* Tray */}
            <div className="w-1/4 border-r border-white/10 pr-4 flex flex-col gap-2">
                <div className="text-[8px] text-white/50 mb-2">BACKLOG</div>
                <div className="h-6 rounded border border-white/10 bg-white/5"></div>
                <div className="h-6 rounded border border-white/10 bg-white/5"></div>
                <motion.div 
                    className="h-6 rounded border border-[#534AB7] bg-[#534AB7]/20 relative z-20"
                    animate={{ 
                        x: [0, 80, 80, 0], 
                        y: [0, 40, 40, 0],
                        opacity: [1, 1, 0, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            {/* Grid */}
            <div className="flex-1 grid grid-cols-4 gap-1 relative">
                <div className="col-span-4 text-[8px] text-white/50 mb-2 grid grid-cols-4 gap-1">
                    <span>MON</span><span>TUE</span><span>WED</span><span>THU</span>
                </div>
                {Array.from({ length: 4 * 4 }).map((_, i) => (
                    <div key={i} className="h-8 border border-white/5 rounded-sm relative bg-white/[0.01]">
                        {i === 2 && <div className="absolute inset-0 bg-white/10 m-0.5 rounded-sm"></div>}
                        {i === 5 && <div className="absolute inset-0 bg-white/10 m-0.5 rounded-sm"></div>}
                        
                        {i === 6 && (
                            <>
                                <motion.div 
                                    className="absolute inset-0 border border-[#534AB7] rounded-sm"
                                    animate={{ opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.6, 1] }}
                                />
                                <motion.div 
                                    className="absolute inset-0 bg-[#534AB7]/40 m-0.5 rounded-sm"
                                    animate={{ opacity: [0, 0, 1, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.5, 0.6, 1] }}
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="absolute bottom-2 left-2 text-[8px] text-white/30">C-05 // TIME_BLOCKING</div>
        </div>
    );
};

export const WorkspaceMockup = () => {
    return (
        <div className="w-full h-full relative overflow-hidden font-label-mono bg-[#131315] border border-white/10 rounded flex flex-col">
            <Crosshairs />
            {/* Topbar */}
            <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-white/[0.02]">
                <div className="text-[10px] text-white">PROJECT_ALPHA</div>
                <div className="flex -space-x-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border border-background bg-white/10 relative">
                            {i < 2 && (
                                <motion.div 
                                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* Content */}
            <div className="flex-1 p-4 grid grid-cols-2 gap-4">
                <div className="border border-white/5 rounded bg-white/[0.01] p-2 flex flex-col gap-2">
                    <div className="text-[8px] text-white/40 mb-2">IN PROGRESS</div>
                    <div className="h-8 rounded border border-white/10 bg-white/5"></div>
                    
                    <motion.div 
                        className="h-8 rounded border border-[#534AB7] bg-[#534AB7]/20 z-10"
                        animate={{ x: [0, 120, 120, 0], opacity: [1, 1, 0, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
                <div className="border border-white/5 rounded bg-white/[0.01] p-2 flex flex-col gap-2 relative">
                    <div className="text-[8px] text-white/40 mb-2">COMPLETED</div>
                    <div className="h-8 rounded border border-white/10 bg-white/5 opacity-50"></div>
                    <motion.div 
                        className="absolute top-12 left-2 right-2 h-8 rounded border border-green-500/50 bg-green-500/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, times: [0, 0.5, 0.6, 1] }}
                    />
                </div>
            </div>
            <div className="absolute bottom-2 right-2 text-[8px] text-white/30">W-06 // TEAM_SYNC</div>
        </div>
    );
};
