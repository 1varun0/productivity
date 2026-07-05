import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { ProjectInvite } from '../types';
import { Loader2, X } from 'lucide-react';

type InviteState =
  | 'loading'
  | 'valid'
  | 'expired'
  | 'invalid'
  | 'already_member'
  | 'accepted'
  | 'needs_login'
  | 'error';

// We extend the ProjectInvite type since we're joining project and inviter
interface PopulatedInvite extends ProjectInvite {
  project: { id: string; name: string; color: string; icon: string };
  inviter: { name: string } | null;
}

export function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isLoading: authLoading } = useAuth();
  const fetchProjects = useWorkspaceStore(state => state.fetchProjects);
  
  const [inviteState, setInviteState] = useState<InviteState>('loading');
  const [invite, setInvite] = useState<PopulatedInvite | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  useEffect(() => {
    async function validateInviteToken() {
      if (!token) {
        setInviteState('invalid');
        return;
      }

      const { data, error } = await supabase
        .from('project_invites')
        .select(`
          *,
          project:project_id(id, name, color, icon),
          inviter:invited_by(username)
        `)
        .eq('token', token)
        .single();

      if (error || !data) {
        setInviteState('invalid');
        return;
      }

      if (data.accepted || new Date(data.expires_at) < new Date()) {
        setInviteState('expired');
        return;
      }

      setInvite(data as PopulatedInvite);
      setInviteState('valid');
    }

    if (!authLoading) {
      validateInviteToken();
    }
  }, [token, authLoading]);

  const acceptInvite = async () => {
    if (!invite || !token) return;
    setIsAccepting(true);
    setAcceptError('');

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      navigate(`/login?returnTo=/invite/${token}`);
      return;
    }

    try {
      // Check already a member
      const { data: existing } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', invite.project_id)
        .eq('user_id', user.user.id)
        .single();

      if (existing) {
        setInviteState('already_member');
        setIsAccepting(false);
        return;
      }

      // Add to project_members FIRST to ensure it succeeds before marking accepted
      const { error: insertError } = await supabase.from('project_members').insert({
        project_id: invite.project_id,
        user_id: user.user.id,
        role: invite.role,
      });

      if (insertError) {
        throw new Error('Failed to join project');
      }

      // Mark invite as accepted
      const { error: updateError } = await supabase
        .from('project_invites')
        .update({ accepted: true })
        .eq('id', invite.id);

      if (updateError) {
        console.error("Failed to mark invite as accepted", updateError);
        // We still consider it joined if insert succeeded, but this is a rare edge case.
      }

      setInviteState('accepted');
      
      // Fetch projects so it appears in the sidebar right away
      await fetchProjects();

      // Redirect to project after 2s
      setTimeout(() => {
        navigate(`/app/workspace/${invite.project_id}`);
      }, 2000);

    } catch (err) {
      console.error(err);
      setAcceptError('Something went wrong. Please try again.');
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#131313', color: '#e5e2e1' }}>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_#2a2a2a_0%,_transparent_60%)] opacity-30" />
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* App Logo & Wordmark */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-lg" style={{ backgroundColor: '#e5e2e1', color: '#131313' }}>
            N
          </div>
          <span className="text-xl font-medium tracking-tight">Nexus</span>
        </div>

        <div className="w-full flex flex-col items-center text-center p-8 rounded-lg shadow-2xl" style={{ backgroundColor: '#201f1f', border: '1px solid #474553' }}>
          {(inviteState === 'loading' || authLoading) && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 size={32} className="animate-spin" style={{ color: '#534AB7' }} />
              <span style={{ fontFamily: 'Inter', color: '#928f9e', fontSize: '14px' }}>Verifying invite...</span>
            </div>
          )}

          {inviteState === 'valid' && invite && (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2" style={{ backgroundColor: invite.project.color + '20', color: invite.project.color, border: `1px solid ${invite.project.color}50` }}>
                {invite.project.icon}
              </div>
              
              <div className="flex flex-col gap-2">
                <h2 style={{ fontFamily: 'Inter', fontSize: '24px', fontWeight: 500, letterSpacing: '-0.02em', color: '#e5e2e1' }}>
                  You've been invited
                </h2>
                <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#928f9e' }}>
                  <strong style={{ color: '#e5e2e1', fontWeight: 500 }}>{invite.inviter?.name || 'Someone'}</strong> invited you to join <strong style={{ color: '#e5e2e1', fontWeight: 500 }}>{invite.project.name}</strong> as a <span className="uppercase tracking-wider text-[11px] font-bold" style={{ color: '#c5c0ff' }}>{invite.role}</span>.
                </p>
              </div>

              {acceptError && (
                <div className="w-full py-2 px-3 rounded-md mt-2" style={{ backgroundColor: '#D85A3015', border: '1px solid #D85A3050', color: '#D85A30', fontSize: '13px' }}>
                  {acceptError}
                </div>
              )}

              <button 
                onClick={acceptInvite}
                disabled={isAccepting}
                className="w-full py-3 rounded-md flex items-center justify-center gap-2 mt-2 transition-colors hover:bg-[#6056d6]"
                style={{ 
                  backgroundColor: '#534AB7', 
                  color: '#fff', 
                  fontFamily: 'Inter', 
                  fontSize: '13px', 
                  fontWeight: 600,
                  opacity: isAccepting ? 0.7 : 1
                }}
              >
                {isAccepting ? <><Loader2 size={16} className="animate-spin" /> Accepting...</> : 'Accept Invite'}
              </button>
            </div>
          )}

          {inviteState === 'invalid' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2a2a2a', color: '#928f9e' }}>
                <X size={24} />
              </div>
              <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, color: '#e5e2e1' }}>Invalid Invite</h2>
              <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#928f9e' }}>This invite link is invalid or doesn't exist.</p>
              <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 rounded-md transition-colors hover:bg-[#333]" style={{ backgroundColor: '#2a2a2a', color: '#e5e2e1', fontSize: '13px', fontWeight: 500 }}>Return Home</button>
            </div>
          )}

          {inviteState === 'expired' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2a2a2a', color: '#928f9e' }}>
                <X size={24} />
              </div>
              <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, color: '#e5e2e1' }}>Invite Expired</h2>
              <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#928f9e' }}>This invite link has expired or already been used.</p>
              <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 rounded-md transition-colors hover:bg-[#333]" style={{ backgroundColor: '#2a2a2a', color: '#e5e2e1', fontSize: '13px', fontWeight: 500 }}>Return Home</button>
            </div>
          )}

          {inviteState === 'already_member' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: '#5DCAA520', color: '#5DCAA5' }}>
                ✓
              </div>
              <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, color: '#e5e2e1' }}>Already a Member</h2>
              <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#928f9e' }}>You are already a member of this project.</p>
              <button onClick={() => navigate(`/app/workspace/${invite?.project_id}`)} className="mt-4 px-6 py-2 rounded-md transition-colors hover:bg-[#6056d6]" style={{ backgroundColor: '#534AB7', color: '#fff', fontSize: '13px', fontWeight: 500 }}>Go to Project</button>
            </div>
          )}

          {inviteState === 'accepted' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-2" style={{ backgroundColor: '#5DCAA520', color: '#5DCAA5' }}>
                ✓
              </div>
              <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, color: '#5DCAA5' }}>
                You've joined {invite?.project.name}
              </h2>
              <p style={{ fontFamily: 'Inter', fontSize: '14px', color: '#444444' }}>Redirecting to workspace...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
