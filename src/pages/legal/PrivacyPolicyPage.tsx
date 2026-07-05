import React from 'react';
import { Shield, Lock, Database, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface pt-24 pb-32 px-6 md:px-12 selection:bg-primary/30">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="mono-accent mb-4">LEGAL // DATA_PROTECTION</div>
          <h1 className="font-headline-xl text-5xl md:text-7xl text-glow mb-6">Privacy Policy</h1>
          <p className="font-body-lg text-on-surface-variant text-xl">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <Shield className="text-primary w-6 h-6" />
              <h2 className="font-headline-lg text-2xl text-white">1. Introduction</h2>
            </div>
            <div className="prose prose-invert max-w-none font-body text-on-surface-variant">
              <p className="mb-4">
                At Productivity ("we", "our", or "us"), we prioritize your privacy and data security above all else. This Privacy Policy outlines how we collect, use, and protect your information when you use our comprehensive suite of tools (Spaces, Timetable, Tasks, and Nexus).
              </p>
              <p>
                By using our services, you consent to the data practices described in this statement. We are committed to processing your data in compliance with applicable data protection laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <Database className="text-primary w-6 h-6" />
              <h2 className="font-headline-lg text-2xl text-white">2. Data We Collect</h2>
            </div>
            <div className="prose prose-invert max-w-none font-body text-on-surface-variant">
              <h3 className="text-white font-medium mb-2">2.1. Account Information</h3>
              <p className="mb-4">
                When you create an account, we collect basic identification information, including your email address and profile name, to authenticate your access securely via Supabase Auth.
              </p>
              <h3 className="text-white font-medium mb-2">2.2. Workspace Content</h3>
              <p className="mb-4">
                The content you create—including tasks, timetable schedules, Nexus journals, and space configurations—is synchronized to our secure cloud database to provide real-time collaboration and cross-device functionality.
              </p>
              <h3 className="text-white font-medium mb-2">2.3. Local-First Caching</h3>
              <p>
                Our application utilizes a local-first architecture. This means your active workspace data is temporarily cached in your browser's local storage (IndexedDB) for offline capabilities and rapid loading times. You have full control over clearing this local cache via your browser settings.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <Lock className="text-primary w-6 h-6" />
              <h2 className="font-headline-lg text-2xl text-white">3. Data Security & Storage</h2>
            </div>
            <div className="prose prose-invert max-w-none font-body text-on-surface-variant">
              <p className="mb-4">
                We employ industry-standard security measures to protect your data. All data transmitted between your device and our servers is encrypted in transit using Transport Layer Security (TLS).
              </p>
              <p className="mb-4">
                At rest, your workspace content and account credentials are encrypted using AES-256 encryption within our Supabase-hosted Postgres databases. We adhere strictly to Row Level Security (RLS) policies, ensuring that your data is programmatically isolated and accessible only by you and your explicitly authorized workspace members.
              </p>
              <div className="bg-surface border border-white/10 p-6 rounded-md mt-6">
                <p className="font-label-mono text-sm text-primary mb-2">SECURITY_COMMITMENT</p>
                <p className="text-sm">We do not sell your personal data or workspace content to third parties. Your data is used exclusively to provide and improve the Productivity service.</p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <EyeOff className="text-primary w-6 h-6" />
              <h2 className="font-headline-lg text-2xl text-white">4. Telemetry and Analytics</h2>
            </div>
            <div className="prose prose-invert max-w-none font-body text-on-surface-variant">
              <p className="mb-4">
                To diagnose fragmentation errors and ensure our promised 99.99% uptime, we collect anonymized, non-personally identifiable telemetry data regarding application performance (e.g., load times, error crash logs).
              </p>
              <p>
                This data contains no user-generated content from your Spaces or Nexus modules and can be opted out of within the application settings.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <h2 className="font-headline-lg text-2xl text-white">5. Your Data Rights</h2>
            </div>
            <div className="prose prose-invert max-w-none font-body text-on-surface-variant">
              <p className="mb-4">You maintain absolute ownership of your data. You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Access:</strong> Request a comprehensive export of your workspace data at any time.</li>
                <li><strong>Deletion:</strong> Permanently delete your account and all associated cloud data via the settings menu. Deletions are irreversible.</li>
                <li><strong>Correction:</strong> Update or rectify your account information.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
