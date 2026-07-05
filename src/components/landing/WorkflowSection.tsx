import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Inbox, CheckSquare, Target, Brain } from 'lucide-react';

const nodes = [
  { i: Inbox, l: "CAPTURE", idx: 0 },
  { i: CheckSquare, l: "ORGANISE", idx: 1 },
  { i: Target, l: "FOCUS", idx: 2 },
  { i: Brain, l: "REFLECT", idx: 3 },
];

export const WorkflowSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"]
  });

  const sectionOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const sectionY = useTransform(scrollYProgress, [0, 0.6], [40, 0]);

  return (
    <section ref={sectionRef} className="w-full py-24 px-8 border-b border-white/10 hidden md:flex flex-col items-center bg-white/[0.01]">
      <motion.div style={{ opacity: sectionOpacity, y: sectionY }} className="w-full flex flex-col items-center">
        <div className="mono-accent mb-12">SYSTEM_ARCHITECTURE // WORKFLOW</div>
        <div className="flex items-center gap-4 max-w-5xl w-full justify-center">
          {nodes.map((node, i) => (
            <React.Fragment key={i}>
              <motion.button
                onClick={() => setActiveFeature(node.idx)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: activeFeature === node.idx ? 1 : 0.5, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`flex flex-col items-center text-center w-32 cursor-pointer transition-all ${activeFeature === node.idx ? 'scale-110' : 'hover:opacity-100'}`}
              >
                <div className={`w-12 h-12 border-tech flex items-center justify-center mb-4 transition-colors ${activeFeature === node.idx ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(197,192,255,0.3)]' : 'bg-white/5'}`}>
                  <node.i className={`w-5 h-5 ${activeFeature === node.idx ? 'text-primary' : 'text-white'}`} />
                </div>
                <h4 className={`font-label-mono text-[10px] mb-1 ${activeFeature === node.idx ? 'text-primary' : 'text-white'}`}>{node.l}</h4>
              </motion.button>
              {i < 3 && (
                <div className="relative w-16 h-4 flex items-center justify-center overflow-hidden">
                  <div className="schematic-line-h w-full absolute"></div>
                  {activeFeature > i && (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-1/2 h-[2px] bg-primary absolute z-10 blur-[1px]"
                    ></motion.div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
