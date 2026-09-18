/**
 * Utilities for formatting and normalizing image and video URLs (including Google Drive, YouTube, CDN)
 */

export function formatImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If it's a Google Drive link
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
    }
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }

  return trimmed;
}

export function formatVideoEmbed(url?: string): {
  type: 'youtube' | 'drive' | 'direct' | 'empty';
  embedUrl: string;
} {
  if (!url) return { type: 'empty', embedUrl: '' };
  const trimmed = url.trim();

  // YouTube
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    let videoId = '';
    if (trimmed.includes('youtu.be/')) {
      videoId = trimmed.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (trimmed.includes('shorts/')) {
      videoId = trimmed.split('shorts/')[1]?.split('?')[0] || '';
    } else if (trimmed.includes('v=')) {
      try {
        videoId = new URLSearchParams(new URL(trimmed).search).get('v') || '';
      } catch (e) {
        const m = trimmed.match(/[?&]v=([^&]+)/);
        videoId = m ? m[1] : '';
      }
    } else if (trimmed.includes('/embed/')) {
      videoId = trimmed.split('/embed/')[1]?.split('?')[0] || '';
    }

    if (videoId) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
      };
    }
  }

  // Google Drive
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    let fileId = '';
    const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      fileId = fileMatch[1];
    } else {
      const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) fileId = idMatch[1];
    }

    if (fileId) {
      return {
        type: 'drive',
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      };
    }
  }

  // Direct video file (mp4, webm, etc.)
  return {
    type: 'direct',
    embedUrl: trimmed,
  };
}
