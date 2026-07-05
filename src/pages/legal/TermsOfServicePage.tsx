import React from 'react';
import { FileSignature, Scale, AlertTriangle, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface pt-24 pb-32 px-6 md:px-12 selection:bg-primary/30">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="mono-accent mb-4">LEGAL // AGREEMENT_TERMS</div>
          <h1 className="font-headline-xl text-5xl md:text-7xl text-glow mb-6">Terms of Service</h1>
          <p className="font-body-lg text-on-surface-variant text-xl">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <FileSignature className="text-primary w-6 h-6" />
              <h2 className="font-headline-lg text-2xl text-white">1. Acceptance of Terms</h2>
            </div>
            <div className="prose prose-invert max-w-none font-body text-on-surface-variant">
              <p className="mb-4">
                By accessing or using the Productivity application, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.
              </p>
              <p>
                We reserve the right to modify or replace these terms at any time. Material changes will be communicated via your registered email address or an in-app notification prior to taking effect.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <Terminal className="text-primary w-6 h-6" />
              <h2 className="font-headline-lg text-2xl text-white">2. Acceptable Use</h2>
            </div>
            <div className="prose prose-invert max-w-none font-body text-on-surface-variant">
              <p className="mb-4">
                The Productivity suite (Spaces, Timetable, Tasks, Nexus) is designed to streamline your workflow. You agree not to use the Service:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>In any way that violates applicable national or international law or regulations.</li>
                <li>To store, distribute, or transmit any malware, viruses, or malicious code.</li>
                <li>To engage in any automated scraping, data mining, or extraction methods without explicit permission.</li>
                <li>To attempt to bypass or disrupt the Row Level Security (RLS) policies protecting other users' workspaces.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <AlertTriangle className="text-primary w-6 h-6" />
              <h2 className="font-headline-lg text-2xl text-white">3. Service Level & Availability</h2>
            </div>
            <div className="prose prose-invert max-w-none font-body text-on-surface-variant">
              <p className="mb-4">
                We strive for the 99.99% uptime advertised on our platform, leveraging globally distributed edge networks and highly available Postgres databases. However, the Service is provided on an "AS IS" and "AS AVAILABLE" basis.
              </p>
              <p className="mb-4">
                We do not warrant that the Service will be uninterrupted, timely, secure, or error-free. You acknowledge that local-first caching relies on your device's storage capabilities and network connectivity to synchronize correctly.
              </p>
              <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-md mt-6">
                <p className="font-label-mono text-sm text-orange-400 mb-2">WARNING // ACCOUNT_TERMINATION</p>
                <p className="text-sm">We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for conduct that we determine, in our sole discretion, violates these Terms or is harmful to other users of the Service.</p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <Scale className="text-primary w-6 h-6" />
              <h2 className="font-headline-lg text-2xl text-white">4. Limitation of Liability</h2>
            </div>
            <div className="prose prose-invert max-w-none font-body text-on-surface-variant">
              <p className="mb-4 uppercase text-sm tracking-wider leading-relaxed text-white/50">
                In no event shall Productivity, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
