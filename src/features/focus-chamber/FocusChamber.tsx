import { motion } from 'framer-motion';
import { SpaceBackground } from './SpaceBackground';
import { OrbitalSystem } from './OrbitalSystem';
import { FocusOrb } from './FocusOrb';
import { ContextualPanels } from './ContextualPanels';
import type { FocusMode } from '@/store/useStore';
import { DURATIONS, EASING } from './theme/motion';

interface FocusChamberProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onPlanetClick: (mode: FocusMode) => void;
  onEndEarly?: () => void;
  isConfirmingExit?: boolean;
  onOpenNexus?: () => void;
  [key: string]: any; // Allow other props passed by FocusEnvironment
}

export function FocusChamber({
  timeLeft,
  formatTime,
  isPaused,
  onPause,
  onResume,
  onPlanetClick,
  onEndEarly,
  isReflecting,
  isConfirmingExit = false,
  ...props
}: FocusChamberProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: DURATIONS.slow, ease: EASING.cinematic } }}
      className="fixed inset-0 overflow-hidden flex flex-col font-sans"
      style={{ backgroundColor: '#0f0f0f' }}
    >
      <SpaceBackground />
      
      <OrbitalSystem 
        onPlanetClick={onPlanetClick}
        isReflecting={isReflecting}
      />

      <ContextualPanels
        task={props.task}
        sessionCaptures={props.sessionCaptures}
        attachments={props.attachments}
        getFileUrl={props.getFileUrl}
        onParkThought={props.onParkThought}
        onImageClick={props.onImageClick}
        isReflecting={isReflecting}
        isConfirmingExit={isConfirmingExit}
        onOpenNexus={props.onOpenNexus}
      />

      {/* The Sun / Focus Timer in the center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <FocusOrb 
            timeLeft={timeLeft}
            formatTime={formatTime}
            isPaused={isPaused}
            onPause={onPause}
            onResume={onResume}
            isReflecting={isReflecting}
            onEndEarly={onEndEarly}
            isConfirmingExit={isConfirmingExit}
          />
        </div>
      </div>

      {/* UI Layer (Matches Stitch export top-nav) */}
      <motion.div 
        animate={{ opacity: isReflecting ? 0 : 1 }}
        transition={{ duration: 1 }}
        className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none flex flex-col justify-between p-8"
      >
        <div className="flex justify-between items-start w-full pointer-events-auto">
          {/* Top nav is empty since we moved exit to dock */}
        </div>
      </motion.div>
    </motion.div>
  );
}
