import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { MarkdownRenderer } from '../features/nexus/components/MarkdownRenderer';
import { formatDistanceToNow } from 'date-fns';

interface PublicNoteData {
  note: {
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
  };
  attachmentUrls: Record<string, string>;
}

export function PublicNotePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicNoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicNote() {
      if (!slug) return;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-public-note`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ slug }),
          }
        );

        if (!response.ok) {
          throw new Error('Note not found or no longer available');
        }

        const json = await response.json();
        setData(json);
      } catch (err: unknown) {
        setError((err as Error).message || 'Failed to load note');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPublicNote();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#928f9e]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-[#928f9e] gap-6 p-6">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 shadow-xl shadow-black/50">
          <ArrowLeft size={24} className="text-[#c5c0ff] opacity-50" />
        </div>
        <h1 className="text-2xl font-medium text-white tracking-tight">This note is no longer available</h1>
        <p className="text-sm opacity-60">The owner may have revoked public access or the link is invalid.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/10"
        >
          Return Home
        </button>
      </div>
    );
  }

  const { note, attachmentUrls } = data;

  // Extract thumbnail image if present for the hero section
  let heroImageUrl = '';
  const imageMatch = note.content?.match(/!\[.*?\]\((.*?)\)/);
  if (imageMatch && imageMatch[1]) {
    const rawUrl = imageMatch[1];
    if (rawUrl.startsWith('attachment:')) {
      const id = rawUrl.replace('attachment:', '');
      heroImageUrl = attachmentUrls[id] || '';
    } else {
      heroImageUrl = rawUrl;
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#c8c4d5] selection:bg-[#c5c0ff]/30 relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#c5c0ff]/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 lg:py-32 relative z-10">
        <header className="mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            {note.title || 'Untitled Note'}
          </h1>
          
          <div className="flex items-center gap-4 text-xs font-mono text-[#928f9e]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5c0ff]" />
              <span>Published Note</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <time dateTime={note.updated_at}>
              Last updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
            </time>
          </div>
        </header>

        {heroImageUrl && (
          <div className="w-full aspect-[21/9] md:aspect-[2.5/1] overflow-hidden rounded-2xl mb-12 border border-white/10 shadow-2xl bg-black/40 relative group">
            <img 
              src={heroImageUrl} 
              alt="Hero thumbnail" 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <main className="public-markdown-content relative">
          <MarkdownRenderer 
            content={note.content || ''} 
            readOnly={true}
            publicAttachmentUrls={attachmentUrls}
          />
        </main>
        
        <footer className="mt-24 pt-8 border-t border-white/5 flex items-center justify-between text-xs text-[#928f9e] font-mono">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c5c0ff]" />
            </div>
            <span>Published with Nexus</span>
          </div>
          <a href="/" className="hover:text-white transition-colors">
            Create your own
          </a>
        </footer>
      </div>
    </div>
  );
}
