const UrlParser = {

  getVideoId(url) {
    if (!url) return null;
    url = url.trim();

    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    const watchMatch = url.match(/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];

    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

    const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch) return liveMatch[1];

    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    const idMatch = url.match(/^[a-zA-Z0-9_-]{11}$/);
    if (idMatch) return url;

    return null;
  },

  isYoutubeUrl(text) {
    if (!text) return false;
    return (
      text.includes('youtube.com') ||
      text.includes('youtu.be')
    );
  },

  getThumbnail(videoId, quality = 'hq') {
    const qualities = {
      max: 'maxresdefault',
      hq: 'hqdefault',
      mq: 'mqdefault',
      sd: 'sddefault'
    };
    const q = qualities[quality] || 'hqdefault';
    return `https://i.ytimg.com/vi/${videoId}/${q}.jpg`;
  },

  getEmbedUrl(videoId) {
  const params = new URLSearchParams({
    autoplay: 1,
    rel: 0,
    modestbranding: 1,
    playsinline: 1,
    disablekb: 0,
    iv_load_policy: 3,
    cc_load_policy: 0,
    controls: 1,
    fs: 1
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
},

};