import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const FooterSection: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full border-t border-white/10 bg-background pt-16 pb-8 px-8 md:px-16 font-label-mono text-label-mono text-on-surface-variant z-10 relative"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 max-w-7xl mx-auto">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-[8px] shadow-sm shadow-primary/20">
              P
            </div>
            <span className="font-bold text-on-surface text-[14px]">Productivity OS</span>
          </div>
          <p className="max-w-xs mb-8">One app for tasks, notes, habits, time-blocking, and team collaboration.</p>
          <div className="flex gap-4">
            <span className="border border-white/10 px-2 py-1">SYS.V.1.0</span>
            <span className="border border-white/10 px-2 py-1">STABLE</span>
          </div>
        </div>

        <div>
          <h4 className="text-white mb-4 border-b border-white/10 pb-2 inline-block">RESOURCES</h4>
          <ul className="flex flex-col gap-2">
            <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
        <div className="uppercase">© 2026 PRODUCTIVITY. BUILT FOR FOCUS.</div>
        <div className="flex gap-6 uppercase">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </motion.footer>
  );
};
