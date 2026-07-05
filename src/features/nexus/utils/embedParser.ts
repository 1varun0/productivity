export type EmbedType = 'youtube' | 'pdf' | 'video' | 'loom' | 'reel';

export interface EmbedData {
  type: EmbedType;
  url: string;
  videoId?: string;
  provider?: 'youtube' | 'instagram' | 'tiktok' | 'uploaded';
}

export function parseEmbed(text: string): EmbedData | null {
  const trimmed = text.trim();

  // 1. Check smart syntax: !embed[type](url)
  const smartSyntaxRegex = /^!embed\[(.*?)\]\((.*?)\)$/i;
  const match = trimmed.match(smartSyntaxRegex);
  
  if (match) {
    const type = match[1].toLowerCase();
    const url = match[2];
    
    if (type === 'youtube') return extractYouTube(url);
    if (type === 'pdf') return { type: 'pdf', url };
    if (type === 'video') return { type: 'video', url };
    if (type === 'loom') return extractLoom(url);
    if (type === 'reel') return extractReel(url) || { type: 'reel', url, provider: 'uploaded' };
    return null;
  }
  
  // 2. Check raw URLs
  if (!trimmed.startsWith('http') && !trimmed.startsWith('attachment:')) return null;
  
  const yt = extractYouTube(trimmed);
  if (yt) return yt;
  
  const reel = extractReel(trimmed);
  if (reel) return reel;
  
  const loom = extractLoom(trimmed);
  if (loom) return loom;
  
  if (trimmed.endsWith('.pdf')) return { type: 'pdf', url: trimmed };
  if (trimmed.match(/\.(mp4|webm|mov)$/i)) return { type: 'video', url: trimmed };
  
  return null;
}

function extractYouTube(url: string): EmbedData | null {
  try {
    // Handle both http:// and raw attachment: (though YT won't be attachment, standardizing URL parsing)
    if (!url.startsWith('http')) return null;
    
    const urlObj = new URL(url);
    
    // Check if it's a Short
    if (urlObj.pathname.startsWith('/shorts/')) {
      const videoId = urlObj.pathname.split('/shorts/')[1].split('/')[0];
      if (videoId) return { type: 'reel', url, videoId, provider: 'youtube' };
    }

    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId = '';
      if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.searchParams.has('v')) {
        videoId = urlObj.searchParams.get('v') || '';
      }
      if (videoId) return { type: 'youtube', url, videoId };
    }
  } catch (e) { }
  return null;
}

function extractReel(url: string): EmbedData | null {
  try {
    if (!url.startsWith('http')) return null;
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('instagram.com') && urlObj.pathname.includes('/reel/')) {
      const parts = urlObj.pathname.split('/reel/');
      if (parts.length > 1) {
        const videoId = parts[1].replace('/', '');
        return { type: 'reel', url, videoId, provider: 'instagram' };
      }
    }
    
    if (urlObj.hostname.includes('tiktok.com')) {
      return { type: 'reel', url, provider: 'tiktok' };
    }
    
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/shorts/')) {
       const videoId = urlObj.pathname.split('/shorts/')[1].split('/')[0];
       return { type: 'reel', url, videoId, provider: 'youtube' };
    }
  } catch(e) {}
  return null;
}

function extractLoom(url: string): EmbedData | null {
  try {
    if (!url.startsWith('http')) return null;
    
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('loom.com')) {
      const match = urlObj.pathname.match(/\/share\/([a-z0-9]+)/i);
      if (match && match[1]) {
        return { type: 'loom', url, videoId: match[1] };
      }
    }
  } catch (e) { }
  return null;
}
