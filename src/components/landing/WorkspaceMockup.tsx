import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const colors = {
  bg: '#0a0a0a',
  surface: '#0f0f0f',
  surface2: '#161616',
  border: '#1e1e1e',
  borderSubtle: '#111',
  borderDark: '#0d0d0d',
  accent: '#534AB7',
  accentBg: '#1a1730',
  accentText: '#AFA9EC',
  blueBg: '#0d1a26',
  blueText: '#85B7EB',
  greenBg: '#0e1f18',
  greenText: '#5DCAA5',
  pinkBg: '#1a1015',
  pinkText: '#ED93B1',
  danger: '#D85A30',
  dangerBg: '#1f0a0a',
  textPrimary: '#e0e0e0',
  textSecondary: '#888',
  textMuted: '#555',
  textGhost: '#444',
  textGhoster: '#333',
};

const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace" };

// ─── Avatar helper ───────────────────────────────────────────────
function Avatar({ initials, bg, fg, size = 22, statusDot, pulsing }: {
  initials: string; bg: string; fg: string; size?: number;
  statusDot?: boolean; pulsing?: boolean;
}) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: bg, color: fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38, fontWeight: 600, ...mono,
        border: `1.5px solid ${colors.bg}`, letterSpacing: '0.02em',
      }}>
        {initials}
      </div>
      {statusDot && (
        <motion.div
          animate={pulsing ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            width: 5, height: 5, borderRadius: '50%',
            background: colors.greenText,
            position: 'absolute', bottom: -1, right: -1,
            border: `1px solid ${colors.bg}`,
          }}
        />
      )}
    </div>
  );
}

// ─── Checkbox ────────────────────────────────────────────────────
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <motion.div
      animate={checked ? {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
        scale: [1, 1.2, 1],
      } : {
        backgroundColor: 'transparent',
        borderColor: '#2a2a2a',
        scale: 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        width: 13, height: 13, borderRadius: 3,
        border: '0.5px solid #2a2a2a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {checked && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ color: '#fff', fontSize: 8, lineHeight: 1 }}
        >✓</motion.span>
      )}
    </motion.div>
  );
}

// ─── Notification Toast ──────────────────────────────────────────
function NotificationToast({ visible, text }: { visible: boolean; text: string }) {
  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'absolute', bottom: 10, right: 10,
        background: colors.surface2, border: `0.5px solid #2a2a2a`,
        borderRadius: 5, padding: '7px 12px',
        display: 'flex', alignItems: 'center', gap: 6,
        pointerEvents: 'none', zIndex: 20,
      }}
    >
      <motion.div
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 5, height: 5, borderRadius: '50%',
          background: colors.greenText, flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 9, color: colors.accentText, ...mono, whiteSpace: 'nowrap' }}>
        {text}
      </span>
    </motion.div>
  );
}

// ─── Chat Typing Bubble ─────────────────────────────────────────
function ChatTypingBubble({ visible }: { visible: boolean }) {
  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'absolute', bottom: 10, left: 10,
        background: colors.surface2, border: `0.5px solid #2a2a2a`,
        borderRadius: 5, padding: '7px 10px',
        maxWidth: 150, pointerEvents: 'none', zIndex: 20,
      }}
    >
      <div style={{ fontSize: 9, color: colors.accentText, ...mono, marginBottom: 4 }}>
        SR is typing
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            style={{ width: 4, height: 4, borderRadius: '50%', background: colors.textGhost }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export const WorkspaceMockup = () => {
  // ── Animation 1 state: task completion ──
  const [task3Checked, setTask3Checked] = useState(false);
  const [task3Visible, setTask3Visible] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  // ── Notification state (shared by anim 1 & 3) ──
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifText, setNotifText] = useState('');

  // ── Animation 2 state: chat typing ──
  const [chatVisible, setChatVisible] = useState(false);

  // ── Animation 3 state: new member joins ──
  const [mrOnline, setMrOnline] = useState(false);
  const [onlineCount, setOnlineCount] = useState(3);

  // ── Animation 4 state: presence pulse ──
  const [pulsingAvatar, setPulsingAvatar] = useState(0);

  // ── Animation 1: Task completion loop ──
  useEffect(() => {
    let cancelled = false;
    const loop = async () => {
      while (!cancelled) {
        await sleep(2000);
        if (cancelled) break;

        setTask3Checked(true);
        await sleep(600);
        if (cancelled) break;

        setTask3Visible(false);
        await sleep(400);
        if (cancelled) break;

        setShowCompleted(true);

        setNotifText('SR completed "Review PR #42"');
        setNotifVisible(true);
        await sleep(2500);
        if (cancelled) break;

        setNotifVisible(false);
        await sleep(1000);
        if (cancelled) break;

        setShowCompleted(false);
        setTask3Checked(false);
        setTask3Visible(true);
        await sleep(1500);
      }
    };
    loop();
    return () => { cancelled = true; };
  }, []);

  // ── Animation 2: Chat typing bubble loop ──
  useEffect(() => {
    let cancelled = false;
    const loop = async () => {
      while (!cancelled) {
        await sleep(3000);
        if (cancelled) break;
        setChatVisible(true);
        await sleep(2000);
        if (cancelled) break;
        setChatVisible(false);
        await sleep(4000);
      }
    };
    loop();
    return () => { cancelled = true; };
  }, []);

  // ── Animation 3: New member joins loop ──
  useEffect(() => {
    let cancelled = false;
    const loop = async () => {
      while (!cancelled) {
        await sleep(6000);
        if (cancelled) break;

        setMrOnline(true);
        setOnlineCount(4);
        setNotifText('MR joined the project');
        setNotifVisible(true);
        await sleep(2500);
        if (cancelled) break;

        setNotifVisible(false);
        await sleep(5000);
        if (cancelled) break;

        setMrOnline(false);
        setOnlineCount(3);
        await sleep(3000);
      }
    };
    loop();
    return () => { cancelled = true; };
  }, []);

  // ── Animation 4: Presence pulse ──
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsingAvatar(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const avatars = [
    { initials: 'AK', bg: colors.accentBg, fg: colors.accentText },
    { initials: 'JD', bg: colors.blueBg, fg: colors.blueText },
    { initials: 'SR', bg: colors.greenBg, fg: colors.greenText },
  ];

  const tabs = ['TASKS', 'DOCS', 'CHAT', 'FILES'] as const;

  return (
    <div style={{
      width: '100%', maxWidth: 560, background: colors.bg,
      border: `0.5px solid ${colors.border}`, borderRadius: 8,
      overflow: 'hidden', position: 'relative', ...mono,
      aspectRatio: '560 / 320',
    }}>
      {/* ═══ TOP BAR ═══ */}
      <div style={{
        height: 40, borderBottom: `0.5px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px',
      }}>
        {/* Left: project badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 10, height: 10, background: colors.accent,
            borderRadius: 2, flexShrink: 0,
          }} />
          <span style={{
            fontSize: 11, color: colors.textPrimary,
            letterSpacing: '0.04em', ...mono,
          }}>
            PROJECT ALPHA
          </span>
        </div>

        {/* Center: presence avatars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {avatars.map((a, i) => (
              <div key={a.initials} style={{ marginLeft: i > 0 ? -6 : 0 }}>
                <Avatar {...a} statusDot pulsing={pulsingAvatar === i} />
              </div>
            ))}
            {/* MR avatar (animated entry) */}
            <motion.div
              animate={{
                opacity: mrOnline ? 1 : 0,
                width: mrOnline ? 22 : 0,
                marginLeft: mrOnline ? -6 : 0,
              }}
              transition={{ duration: 0.5 }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
            >
              <Avatar initials="MR" bg={colors.pinkBg} fg={colors.pinkText} statusDot />
            </motion.div>
          </div>
          <span style={{ fontSize: 9, color: colors.textGhost, letterSpacing: '0.06em', ...mono, marginLeft: 4 }}>
            {onlineCount} ONLINE
          </span>
        </div>

        {/* Right: invite button */}
        <div style={{
          fontSize: 9, color: colors.textMuted, ...mono,
          border: `0.5px solid #222`, padding: '3px 8px',
          borderRadius: 3, cursor: 'default', letterSpacing: '0.04em',
        }}>
          + INVITE
        </div>
      </div>

      {/* ═══ TAB ROW ═══ */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: `0.5px solid ${colors.border}`,
        background: colors.surface,
      }}>
        {tabs.map(tab => (
          <div key={tab} style={{
            padding: '8px 12px', fontSize: 9, letterSpacing: '0.06em',
            color: tab === 'TASKS' ? colors.textPrimary : colors.textGhost,
            borderBottom: tab === 'TASKS' ? `1.5px solid ${colors.textPrimary}` : '1.5px solid transparent',
            ...mono, cursor: 'default',
          }}>
            {tab}
          </div>
        ))}
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* ── LEFT PANEL ── */}
        <div style={{ width: '55%', borderRight: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
          {/* Add task input (decorative) */}
          <div style={{
            padding: '8px 12px', borderBottom: `0.5px solid ${colors.borderSubtle}`,
            fontSize: 10, color: colors.textMuted, ...mono,
          }}>
            + Add a task…
          </div>

          {/* Section label */}
          <div style={{
            padding: '6px 12px 4px', fontSize: 9, color: colors.textGhoster,
            letterSpacing: '0.08em', ...mono,
          }}>
            IN PROGRESS
          </div>

          {/* Task Row 1 — selected */}
          <div style={{
            height: 32, padding: '6px 12px',
            borderBottom: `0.5px solid ${colors.borderDark}`,
            display: 'flex', alignItems: 'center', gap: 8,
            background: colors.accentBg, borderLeft: `2px solid ${colors.accent}`,
          }}>
            <Checkbox checked={false} />
            <span style={{ flex: 1, fontSize: 11, color: '#ccc', ...mono }}>
              Design onboarding flow
            </span>
            <Avatar initials="AK" bg={colors.accentBg} fg={colors.accentText} size={14} />
            <span style={{ fontSize: 9, color: colors.textGhost, ...mono }}>Jun 12</span>
          </div>

          {/* Task Row 2 — static */}
          <div style={{
            height: 32, padding: '6px 12px',
            borderBottom: `0.5px solid ${colors.borderDark}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Checkbox checked={false} />
            <span style={{ flex: 1, fontSize: 11, color: '#ccc', ...mono }}>
              Set up auth
            </span>
            <Avatar initials="JD" bg={colors.blueBg} fg={colors.blueText} size={14} />
            <span style={{ fontSize: 9, color: colors.textGhost, ...mono }}>Jun 14</span>
          </div>

          {/* Task Row 3 — animated */}
          <AnimatePresence>
            {task3Visible && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  height: 32, padding: '6px 12px',
                  borderBottom: `0.5px solid ${colors.borderDark}`,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <Checkbox checked={task3Checked} />
                <motion.span
                  animate={{
                    color: task3Checked ? colors.textGhost : '#ccc',
                    textDecoration: task3Checked ? 'line-through' : 'none',
                  }}
                  style={{ flex: 1, fontSize: 11, ...mono }}
                >
                  Review PR #42
                </motion.span>
                <Avatar initials="SR" bg={colors.greenBg} fg={colors.greenText} size={14} />
                <span style={{ fontSize: 9, color: colors.danger, ...mono }}>Overdue</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completed section (appears after task animation) */}
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  padding: '6px 12px 4px', fontSize: 9, color: colors.textGhoster,
                  letterSpacing: '0.08em', ...mono,
                }}>
                  COMPLETED
                </div>
                <div style={{
                  height: 32, padding: '6px 12px',
                  borderBottom: `0.5px solid ${colors.borderDark}`,
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: 0.4,
                }}>
                  <Checkbox checked={true} />
                  <span style={{
                    flex: 1, fontSize: 11, color: colors.textGhost,
                    textDecoration: 'line-through', ...mono,
                  }}>
                    Review PR #42
                  </span>
                  <Avatar initials="SR" bg={colors.greenBg} fg={colors.greenText} size={14} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom add row */}
          <div style={{
            marginTop: 'auto', padding: '6px 12px',
            fontSize: 10, color: colors.textSecondary,
            opacity: 0.3, ...mono,
          }}>
            + CAPTURE
          </div>
        </div>

        {/* ── RIGHT PANEL — task detail ── */}
        <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          {/* Title */}
          <div style={{ fontSize: 13, fontWeight: 500, color: colors.textPrimary, ...mono }}>
            Design onboarding flow
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 8, background: colors.accentBg, color: colors.accentText,
              borderRadius: 3, padding: '2px 6px', ...mono,
            }}>
              IN PROGRESS
            </span>
            <span style={{
              fontSize: 8, background: colors.dangerBg, color: colors.danger,
              borderRadius: 3, padding: '2px 6px', ...mono,
            }}>
              HIGH
            </span>
          </div>

          {/* Assigned to */}
          <div>
            <div style={{ fontSize: 8, color: colors.textGhost, letterSpacing: '0.08em', marginBottom: 4, ...mono }}>
              ASSIGNED TO
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar initials="AK" bg={colors.accentBg} fg={colors.accentText} size={16} />
              <span style={{ fontSize: 10, color: colors.textSecondary, ...mono }}>Alex K.</span>
            </div>
          </div>

          {/* Due date */}
          <div>
            <div style={{ fontSize: 8, color: colors.textGhost, letterSpacing: '0.08em', marginBottom: 4, ...mono }}>
              DUE DATE
            </div>
            <span style={{ fontSize: 10, color: colors.textSecondary, ...mono }}>Jun 12, 2026</span>
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: 8, color: colors.textGhost, letterSpacing: '0.08em', marginBottom: 4, ...mono }}>
              DESCRIPTION
            </div>
            <div style={{
              background: colors.borderSubtle, border: `0.5px solid ${colors.border}`,
              padding: '6px 8px', borderRadius: 4,
              fontSize: 9, color: colors.textMuted, lineHeight: 1.5, ...mono,
            }}>
              Design the full onboarding sequence including welcome screen, setup wizard...
            </div>
          </div>
        </div>
      </div>

      {/* ═══ OVERLAYS ═══ */}
      <NotificationToast visible={notifVisible} text={notifText} />
      <ChatTypingBubble visible={chatVisible} />
    </div>
  );
};
