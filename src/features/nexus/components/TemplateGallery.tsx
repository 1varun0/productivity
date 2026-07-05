import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Target, Lightbulb, Users, Microscope, Feather, Plus } from 'lucide-react';
import { NexusBlocksIcon } from '@/components/icons/NexusBlocksIcon';
import { useNexusStore } from '../store/useNexusStore';
import type { NoteTemplate } from '../types';

interface TemplateGalleryProps {
  onSelectBlank: () => void;
  onSelectTemplate: (template: NoteTemplate) => void;
  onCreateNew?: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  'Target': <Target size={16} />,
  'Lightbulb': <Lightbulb size={16} />,
  'Users': <Users size={16} />,
  'Microscope': <Microscope size={16} />,
  'Brain': <NexusBlocksIcon size={16} />,
  'Feather': <Feather size={16} />,
  'FileText': <FileText size={16} />
};

export function TemplateGallery({ onSelectBlank, onSelectTemplate, onCreateNew }: TemplateGalleryProps) {
  const { isTemplateGalleryOpen, closeTemplateGallery, templates, fetchTemplates } = useNexusStore();
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (isTemplateGalleryOpen) {
      fetchTemplates();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeTemplateGallery();
        if (e.key === 'Enter') {
          e.preventDefault();
          onSelectBlank();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isTemplateGalleryOpen, fetchTemplates, closeTemplateGallery, onSelectBlank]);

  if (!isTemplateGalleryOpen) return null;

  const systemTemplates = templates.filter(t => t.is_system_template);
  const userTemplates = templates.filter(t => !t.is_system_template);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeTemplateGallery}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[85vh] bg-[#0e0e0e]/90 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
            <div>
              <h2 className="text-xl font-medium text-white tracking-wide">Structured Momentum</h2>
              <p className="text-sm text-white/40 mt-1">Begin writing instantly, or choose a template to accelerate your flow.</p>
            </div>
            <div className="flex items-center gap-3">
              {onCreateNew && (
                <button
                  onClick={onCreateNew}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors border border-white/5"
                >
                  <Plus size={14} />
                  Create Custom Template
                </button>
              )}
              <button
                onClick={closeTemplateGallery}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {/* Primary Action */}
            <button
              onClick={onSelectBlank}
              className="w-full relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 text-left hover:bg-white/[0.08] transition-all duration-500 mb-12 shadow-inner"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-start gap-5 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <Plus size={24} className="text-white group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-white tracking-wide mb-2 group-hover:text-primary transition-colors">Blank Note</h3>
                  <p className="text-white/50 text-[15px]">An empty canvas. Press Enter to start typing immediately.</p>
                </div>
              </div>
            </button>

            {/* Template Sections */}
            <div className="space-y-12">
              {/* System Templates */}
              {systemTemplates.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">Built-in Frameworks</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systemTemplates.map(template => (
                      <TemplateCard 
                        key={template.id} 
                        template={template} 
                        onSelect={() => onSelectTemplate(template)}
                        isHovered={hoveredTemplate === template.id}
                        onHoverChange={(hovered) => setHoveredTemplate(hovered ? template.id : null)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* User Templates */}
              {userTemplates.length > 0 && (
                <section>
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">Your Templates</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userTemplates.map(template => (
                      <TemplateCard 
                        key={template.id} 
                        template={template} 
                        onSelect={() => onSelectTemplate(template)}
                        isHovered={hoveredTemplate === template.id}
                        onHoverChange={(hovered) => setHoveredTemplate(hovered ? template.id : null)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function TemplateCard({ 
  template, 
  onSelect, 
  isHovered: _isHovered, 
  onHoverChange 
}: { 
  template: NoteTemplate, 
  onSelect: () => void,
  isHovered: boolean,
  onHoverChange: (hovered: boolean) => void
}) {
  return (
    <motion.button
      onClick={onSelect}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className="relative text-left flex flex-col h-40 rounded-2xl bg-white/[0.02] border border-white/5 p-5 transition-all duration-500 overflow-hidden group hover:bg-white/[0.05] hover:border-white/20 hover:shadow-[0_8px_30px_-10px_rgba(255,255,255,0.05)] hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 group-hover:text-primary transition-colors duration-300">
          {ICONS[template.icon || 'FileText'] || <FileText size={16} />}
        </div>
        {template.category && (
          <span className="text-[10px] uppercase tracking-[0.1em] text-white/30 font-medium px-2 py-1 bg-white/5 rounded-md border border-white/5 group-hover:text-primary/70 transition-colors">
            {template.category}
          </span>
        )}
      </div>
      
      <div className="relative z-10 flex-1">
        <h4 className="text-[15px] font-medium text-white/90 group-hover:mb-1.5 group-hover:text-white transition-all duration-300">
          {template.title}
        </h4>
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300">
          <div className="overflow-hidden">
            <p className="text-[13px] text-white/40 leading-relaxed line-clamp-2 group-hover:text-white/60 transition-colors">
              {template.description}
            </p>
          </div>
        </div>
      </div>

      {/* Ambient background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.button>
  );
}
