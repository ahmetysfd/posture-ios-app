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

/** Extract the YouTube video id from any embed/watch/shorts URL. */
export function getYouTubeVideoId(input: string): string | null {
  try {
    const u = new URL(input.trim());
    const path = u.pathname;
    // /embed/<id> or /shorts/<id>
    if (path.includes('/embed/')) {
      const id = path.split('/embed/')[1]?.split('/')[0]?.split('?')[0];
      if (id) return id;
    }
    if (path.includes('/shorts/')) {
      const id = path.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
      if (id) return id;
    }
    const v = u.searchParams.get('v');
    if (v) return v;
    if (u.hostname === 'youtu.be' || u.hostname === 'www.youtu.be') {
      const id = path.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (id) return id;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Build the iframe `src` for an exercise demo video.
 *
 * Forces the video to:
 *   • autoplay muted (mute=1, autoplay=1)
 *   • run inline on iOS (playsinline=1)
 *   • loop on end (loop=1 + playlist=<videoId>, which is the only way YouTube
 *     respects `loop` for a single video)
 *   • hide all player controls so the user cannot unmute (controls=0,
 *     disablekb=1, modestbranding=1, rel=0)
 */
export function buildExerciseVideoSrc(input: string): string {
  const embed = toYouTubeEmbed(input);
  const id = getYouTubeVideoId(embed);
  const params: Record<string, string> = {
    playsinline: '1',
    rel: '0',
    autoplay: '1',
    mute: '1',
    loop: '1',
    controls: '0',
    disablekb: '1',
    modestbranding: '1',
    iv_load_policy: '3',
    fs: '0',
  };
  if (id) params.playlist = id;
  const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return `${embed}?${qs}`;
}
