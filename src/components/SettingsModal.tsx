import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStore } from '@/store/useProfileStore';
import { ACCENT_COLORS } from '@/types/profile';
import { X, LogOut, Check, Loader2, Keyboard } from 'lucide-react';

type SettingsSection = 'profile' | 'appearance' | 'shortcuts';

export function SettingsModal() {
  const { isSettingsModalOpen, closeSettingsModal } = useStore();
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const handleSignOut = async () => {
    await signOut();
    useProfileStore.setState({ profile: null });
    closeSettingsModal();
  };

  useEffect(() => {
    if (!isSettingsModalOpen) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettingsModal();
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSettingsModalOpen, closeSettingsModal]);

  return (
    <AnimatePresence>
      {isSettingsModalOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-40"
            onClick={closeSettingsModal}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, y: 10, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-[800px] h-[520px] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/5 rounded-2xl overflow-hidden pointer-events-auto relative flex flex-row"
              onClick={e => e.stopPropagation()}
            >
              {/* Subtle top glare */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
              
              <button 
                onClick={closeSettingsModal}
                className="absolute top-5 right-5 p-1.5 rounded-md text-white/40 hover:text-white/90 hover:bg-white/10 transition-all duration-200 z-20"
              >
                <X size={16} />
              </button>

              <SettingsNav 
                activeSection={activeSection} 
                onChangeSection={setActiveSection} 
                onSignOut={handleSignOut} 
              />
              
              <div className="flex-1 min-w-0 p-10 overflow-y-auto custom-scrollbar relative">
                {activeSection === 'profile' && <ProfileSection />}
                {activeSection === 'appearance' && <AppearanceSection />}
                {activeSection === 'shortcuts' && <ShortcutsSection />}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function SettingsNav({ 
  activeSection, 
  onChangeSection, 
  onSignOut 
}: { 
  activeSection: SettingsSection; 
  onChangeSection: (section: SettingsSection) => void;
  onSignOut: () => void;
}) {
  return (
    <div className="w-56 shrink-0 border-r border-white/5 bg-[#0d0d0f]/50 flex flex-col pt-8 pb-6 px-4">
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px] shadow-sm shadow-primary/20">
          P
        </div>
        <span className="text-[13px] font-semibold text-white/90 tracking-tight">Productivity</span>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <button
          onClick={() => onChangeSection('profile')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
            activeSection === 'profile' 
              ? 'bg-white/10 text-white/95 shadow-sm' 
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => onChangeSection('appearance')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
            activeSection === 'appearance' 
              ? 'bg-white/10 text-white/95 shadow-sm' 
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          Appearance
        </button>
        <button
          onClick={() => onChangeSection('shortcuts')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all mt-2 border-t border-white/5 pt-3 ${
            activeSection === 'shortcuts' 
              ? 'bg-white/10 text-white/95 shadow-sm' 
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <Keyboard size={14} className={activeSection === 'shortcuts' ? 'opacity-100' : 'opacity-70'} />
          Keyboard Shortcuts
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-white/5">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function ProfileSection() {
  const profile = useProfileStore(s => s.profile);
  const updateProfile = useProfileStore(s => s.updateProfile);
  const sendPasswordReset = useProfileStore(s => s.sendPasswordReset);
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = 
    displayName !== (profile?.display_name ?? '') || 
    username !== (profile?.username ?? '');

  const usernameValid = /^[a-z0-9_]{2,30}$/.test(username);
  const usernameError = username.length > 0 && !usernameValid 
    ? 'Lowercase letters, numbers, underscores only. 2–30 chars.' 
    : null;

  const handleSave = async () => {
    if (!isDirty || usernameError) return;
    setIsSaving(true);
    await updateProfile({ display_name: displayName, username });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordReset = async () => {
    await sendPasswordReset();
    setPasswordResetSent(true);
    setTimeout(() => setPasswordResetSent(false), 3000);
  };

  const initial = (displayName || username || 'U').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col max-w-sm h-full">
      <h2 className="text-[18px] font-medium text-white/95 mb-8 tracking-tight">Profile Settings</h2>

      <div className="flex items-center gap-5 mb-8">
        <div 
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-medium shadow-inner"
          style={{ backgroundColor: '#1a1730', color: '#AFA9EC', border: '1px solid rgba(175, 169, 236, 0.1)' }}
        >
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-medium text-white/90">{profile?.username || 'Your Name'}</span>
          <span className="text-[12px] text-white/40">@{profile?.username || 'username'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full bg-[#131316] border border-white/10 rounded-lg px-3.5 py-2 text-[13px] text-white/90 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/20"
            placeholder="How you appear to others"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase())}
            className="w-full bg-[#131316] border border-white/10 rounded-lg px-3.5 py-2 text-[13px] text-white/90 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/20"
            placeholder="Unique identifier"
          />
          {usernameError && (
            <span className="text-[11px] text-[#D85A30] mt-0.5">{usernameError}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Email Address</label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            disabled
            className="w-full bg-[#131316]/50 border border-white/5 rounded-lg px-3.5 py-2 text-[13px] text-white/30 outline-none cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Security</label>
          <button
            onClick={handlePasswordReset}
            disabled={passwordResetSent}
            className="w-fit text-[12px] font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordResetSent ? 'Reset link sent ✓' : 'Send password reset email'}
          </button>
        </div>
      </div>

      <div className="mt-auto pt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!isDirty || !!usernameError || isSaving}
          className="h-8 px-5 rounded-md bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
        </button>
        <AnimatePresence>
          {saved && (
            <motion.div 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[#5DCAA5] text-[12px] font-medium flex items-center gap-1.5"
            >
              <Check size={14} /> Saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const profile = useProfileStore(s => s.profile);
  const updateAppearance = useProfileStore(s => s.updateAppearance);

  const handleThemeChange = (theme: string) => {
    if (theme !== 'dark') return;
    updateAppearance({ theme: 'dark' });
  };

  const handleCompactToggle = (enabled: boolean) => {
    updateAppearance({ compact_mode: enabled });
  };

  const handleAccentChange = (color: string) => {
    updateAppearance({ accent_color: color });
  };

  const currentTheme = profile?.theme || 'dark';
  const currentAccent = profile?.accent_color || '#534AB7';
  const isCompact = profile?.compact_mode || false;

  return (
    <div className="flex flex-col max-w-sm">
      <h2 className="text-[18px] font-medium text-white/95 mb-8 tracking-tight">Appearance</h2>

      <div className="flex flex-col gap-6">
        {/* Theme Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Interface Theme</label>
          <div className="flex gap-3">
            <button 
              onClick={() => handleThemeChange('light')}
              className="flex-1 aspect-[4/3] rounded-lg border border-white/10 bg-[#e5e5e5] overflow-hidden opacity-40 cursor-not-allowed pointer-events-none relative flex flex-col"
            >
              <div className="h-2 w-full bg-[#d4d4d4]" />
              <div className="flex-1 flex p-2 gap-2">
                <div className="w-1/3 h-full bg-[#d4d4d4] rounded-sm" />
                <div className="flex-1 flex flex-col gap-1.5 pt-1">
                  <div className="h-1 w-full bg-[#d4d4d4] rounded-full" />
                  <div className="h-1 w-2/3 bg-[#d4d4d4] rounded-full" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-semibold text-[#888]">LIGHT</div>
            </button>
            <button 
              onClick={() => handleThemeChange('dark')}
              className="flex-1 aspect-[4/3] rounded-lg overflow-hidden relative flex flex-col transition-all hover:brightness-110"
              style={{ 
                backgroundColor: '#131316', 
                border: currentTheme === 'dark' ? `1.5px solid var(--color-accent)` : '1px solid rgba(255,255,255,0.1)' 
              }}
            >
              <div className="h-2 w-full bg-[#1e1e24]" />
              <div className="flex-1 flex p-2 gap-2">
                <div className="w-1/3 h-full bg-[#1e1e24] rounded-sm" />
                <div className="flex-1 flex flex-col gap-1.5 pt-1">
                  <div className="h-1 w-full bg-[#2a2a30] rounded-full" />
                  <div className="h-1 w-2/3 bg-[#2a2a30] rounded-full" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-semibold text-white/90">DARK</div>
              {currentTheme === 'dark' && (
                <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full flex items-center justify-center bg-[var(--color-accent)] border border-white/10">
                  <Check size={8} className={currentAccent === '#FFFFFF' ? 'text-black' : 'text-white'} strokeWidth={3} />
                </div>
              )}
            </button>
            <button 
              onClick={() => handleThemeChange('system')}
              className="flex-1 aspect-[4/3] rounded-lg border border-white/10 bg-gradient-to-br from-[#e5e5e5] to-[#131316] overflow-hidden opacity-40 cursor-not-allowed pointer-events-none relative"
            >
              <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-semibold mix-blend-difference text-white">SYSTEM</div>
            </button>
          </div>
        </div>

        {/* Accent Color */}
        <div className="flex flex-col gap-3 mt-2">
          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Accent Color</label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => handleAccentChange(c.value)}
                className="group relative w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: c.value }}
                title={c.label}
              >
                {currentAccent === c.value ? (
                  <Check size={14} className={`${c.value === '#FFFFFF' ? 'text-black' : 'text-white'} drop-shadow-md`} strokeWidth={3} />
                ) : (
                  <div className="absolute inset-0 rounded-full border-2 border-white/0 group-hover:border-white/30 transition-colors" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Mode */}
        <div className="flex flex-col gap-3 mt-4">
          <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Density</label>
          <div 
            className="flex items-center justify-between p-3.5 rounded-lg border border-white/5 bg-[#131316] cursor-pointer hover:bg-[#1a1a1e] transition-colors"
            onClick={() => handleCompactToggle(!isCompact)}
          >
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-white/90">Compact Mode</span>
              <span className="text-[11px] text-white/40">Reduces padding across the interface</span>
            </div>
            
            {/* Custom Toggle Switch */}
            <div 
              className="w-8 h-4.5 rounded-full relative transition-colors duration-200"
              style={{ backgroundColor: isCompact ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)' }}
            >
              <div 
                className="absolute top-0.5 left-0.5 bottom-0.5 aspect-square rounded-full transition-transform duration-200 shadow-sm"
                style={{ 
                  backgroundColor: isCompact && currentAccent === '#FFFFFF' ? '#131316' : 'white',
                  transform: isCompact ? 'translateX(14px)' : 'translateX(0)' 
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ShortcutsSection() {
  const shortcutGroups = [
    {
      title: "Global Shortcuts",
      items: [
        { keys: ['Ctrl', 'Space'], label: 'Quick Task Capture', desc: 'Opens the Capture Modal from anywhere' },
        { keys: ['Ctrl', 'Shift', 'Space', 'or', 'Ctrl', 'Shift', 'P'], label: 'Global Mental Capture', desc: 'Dumps a thought into the Mental Inbox' },
        { keys: ['Ctrl', 'K'], label: 'Command Palette', desc: 'Access navigation, tasks, and quick actions' },
        { keys: ['Alt', 'N'], label: 'New Note', desc: 'Automatically opens Nexus and creates a new note' },
        { keys: ['Ctrl', '/'], label: 'Shortcuts Reference', desc: 'Opens the visual shortcuts reference sheet' },
        { keys: ['F'], label: 'Enter Focus Mode', desc: 'Enters the Focus Chamber (disabled when typing)' },
        { keys: ['Esc'], label: 'Close Modal', desc: 'Gracefully closes any active modal or panel' },
      ]
    },
    {
      title: "Nexus (Markdown Editor)",
      items: [
        { keys: ['Ctrl', 'B'], label: 'Bold text', desc: '**text**' },
        { keys: ['Ctrl', 'I'], label: 'Italicize text', desc: '*text*' },
        { keys: ['Ctrl', 'Shift', 'C'], label: 'Format as inline code', desc: '`code`' },
      ]
    },
    {
      title: "Command Palette",
      items: [
        { keys: ['↑', '↓'], label: 'Navigate list', desc: '' },
        { keys: ['Enter'], label: 'Execute selected action', desc: '' },
        { keys: ['Esc'], label: 'Close palette', desc: '' },
      ]
    },
    {
      title: "Focus Chamber (Orb Ritual)",
      items: [
        { keys: ['Space'], label: 'Pause / Resume', desc: 'Pause or resume focus session' },
        { keys: ['Esc'], label: 'End session / Close input', desc: 'End session early or close custom input' },
        { keys: ['0-9'], label: 'Custom extension', desc: 'Input custom temporal extension (minutes)' },
        { keys: ['Enter'], label: 'Submit', desc: 'Submit temporal extension' },
        { keys: ['Backspace'], label: 'Remove digit', desc: 'Remove last digit in custom input' },
      ]
    },
    {
      title: "Timetable",
      items: [
        { keys: ['Ctrl', 'Z'], label: 'Undo action', desc: 'Undo last grid action (if not typing)' },
      ]
    },
    {
      title: "Task Details Panel",
      items: [
        { keys: ['Esc'], label: 'Close panel', desc: 'Close panel, link composer, or image lightbox' },
        { keys: ['Ctrl', 'Enter'], label: 'Save changes', desc: 'Save task changes and blur input' },
      ]
    },
    {
      title: "Thought Parking",
      items: [
        { keys: ['Esc'], label: 'Close modal', desc: 'Close thought parking modal' },
        { keys: ['Enter'], label: 'Save thought', desc: 'Save parked thought to session context' },
      ]
    }
  ];

  return (
    <div className="flex flex-col max-w-2xl pb-8">
      <h2 className="text-[18px] font-medium text-white/95 mb-2 tracking-tight">Keyboard Shortcuts</h2>
      <p className="text-[13px] text-white/40 mb-8">For macOS users, CTRL shortcuts map directly to the CMD key.</p>

      <div className="flex flex-col gap-10">
        {shortcutGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
              {group.title}
            </h3>
            <div className="flex flex-col gap-3">
              {group.items.map((item, i) => (
                <div key={i} className="flex items-start justify-between group">
                  <div className="flex flex-col pr-6">
                    <span className="text-[13px] font-medium text-white/90 group-hover:text-white transition-colors">{item.label}</span>
                    {item.desc && <span className="text-[11px] text-white/40 mt-0.5">{item.desc}</span>}
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end max-w-[200px]">
                    {item.keys.map((k, kIdx) => (
                      k === 'or' ? (
                        <span key={kIdx} className="text-[11px] text-white/40 px-1 self-center">or</span>
                      ) : (
                        <kbd key={kIdx} className="font-sans font-medium bg-white/5 border border-white/10 text-white/80 shadow-sm px-2 py-1 rounded-md text-[11px] min-w-[24px] text-center">
                          {k}
                        </kbd>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
