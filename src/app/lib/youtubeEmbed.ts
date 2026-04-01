/** Convert a YouTube watch / shorts URL to embed URL for iframe */
export function toYouTubeEmbed(input: string): string {
  try {
    const u = new URL(input.trim());
    const path = u.pathname;
    if (path.includes('/shorts/')) {
      const id = path.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;
    if (u.hostname === 'youtu.be' || u.hostname === 'www.youtu.be') {
      const id = path.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    /* ignore */
  }
  return input;
}
