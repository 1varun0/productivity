import { useState } from 'react';
import { Grid3X3 } from 'lucide-react';
import { CreateProjectModal } from './modals/CreateProjectModal';

export function WorkspaceEmpty() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="h-full flex flex-col items-center justify-center relative">
        {/* Grid background decoration */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#1e1e1e 1px, transparent 1px), linear-gradient(90deg, #1e1e1e 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            opacity: 0.03,
            zIndex: 0,
          }}
        />

        <div className="flex flex-col items-center text-center max-w-[400px] px-6 relative z-10">
          {/* Grid icon box */}
          <div
            className="w-[80px] h-[80px] flex items-center justify-center mb-6"
            style={{
              border: '1px solid #1e1e1e',
              backgroundColor: '#161616',
            }}
          >
            <Grid3X3 size={48} strokeWidth={0.5} style={{ color: '#2a2a2a' }} />
          </div>

          {/* Heading */}
          <h1
            className="text-lg font-medium tracking-tight mb-2"
            style={{
              color: '#e0e0e0',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '24px',
              letterSpacing: '-0.01em',
            }}
          >
            Your workspace is empty
          </h1>

          {/* Body */}
          <p
            className="text-[13px] leading-relaxed mb-12"
            style={{
              color: '#555555',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '20px',
            }}
          >
            Create a project to start collaborating with your team in real time.
          </p>

          {/* CTA */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#534AB7',
              color: '#ffffff',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              lineHeight: '12px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              textTransform: 'uppercase',
              border: '1px solid transparent',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: '1' }}>+</span>
            Create your first project
          </button>
        </div>

        {/* Decorative technical text */}
        <div
          className="absolute bottom-12 left-12 hidden lg:block"
          style={{
            color: '#555',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            lineHeight: '18px',
            opacity: 0.5,
          }}
        >
          SYS.RDY // 0.00
        </div>
        <div
          className="absolute bottom-12 right-12 hidden lg:block"
          style={{
            color: '#555',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            lineHeight: '18px',
            opacity: 0.5,
          }}
        >
          GRID_REF: ALPHA_01
        </div>
      </div>

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
