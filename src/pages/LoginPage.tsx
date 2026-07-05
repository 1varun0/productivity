import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams } from 'react-router-dom';

export function LoginPage() {
  const { session, signInWithGoogle, signInWithMagicLink } = useAuth();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/app';
  
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (session) {
    return <Navigate to={returnTo} replace />;
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      await signInWithMagicLink(email);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6 selection:bg-primary/20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10 space-y-10"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-lg tracking-tighter shadow-lg shadow-foreground/10">
              P
            </div>
          </div>
          <h1 className="text-2xl font-medium tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your productivity system.</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={signInWithGoogle}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-card/50 hover:bg-accent hover:border-border/80 transition-all text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground tracking-widest">Or</span>
            </div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-card/50 border border-border focus:border-ring focus:ring-1 focus:ring-ring transition-all outline-none text-sm placeholder:text-muted-foreground"
              required
            />
            <button 
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center shadow-sm shadow-primary/20"
            >
              {status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : status === 'success' ? (
                'Check your email'
              ) : (
                'Continue with Email'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
