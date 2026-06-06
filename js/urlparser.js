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

  getChannelInfo(url) {
    if (!url) return null;
    url = url.trim();
    const handleMatch = url.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/);
    if (handleMatch) return { type: 'handle', value: handleMatch[1] };
    const channelMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
    if (channelMatch) return { type: 'id', value: channelMatch[1] };
    const customMatch = url.match(/youtube\.com\/c\/([a-zA-Z0-9_.-]+)/);
    if (customMatch) return { type: 'handle', value: customMatch[1] };
    const userMatch = url.match(/youtube\.com\/user\/([a-zA-Z0-9_.-]+)/);
    if (userMatch) return { type: 'handle', value: userMatch[1] };
    return null;
  },

  isYoutubeUrl(text) {
    if (!text) return false;
    return text.includes('youtube.com') || text.includes('youtu.be');
  },

  isChannelUrl(text) {
    if (!text) return false;
    return (
      text.includes('youtube.com/@') ||
      text.includes('youtube.com/channel/') ||
      text.includes('youtube.com/c/') ||
      text.includes('youtube.com/user/')
    );
  },

  isPlaylistUrl(text) {
    if (!text) return false;
    return text.includes('youtube.com/playlist?list=') ||
           (text.includes('youtube.com/watch') && text.includes('list='));
  },

  getPlaylistId(url) {
    if (!url) return null;
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
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

  getEmbedUrl(videoId, playlistId = null, index = 0) {
    const params = new URLSearchParams({
      autoplay: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      iv_load_policy: 3,
      controls: 1,
      fs: 1,
      enablejsapi: 1,
      origin: window.location.origin
    });

    if (playlistId) {
      params.set('list', playlistId);
      params.set('index', index);
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
  }

};