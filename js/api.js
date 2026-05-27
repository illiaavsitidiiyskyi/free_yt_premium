const API = {

  BASE_URL: 'https://www.googleapis.com/youtube/v3',

  key() {
    return Storage.getApiKey();
  },

  async request(endpoint, params = {}) {
    const key = this.key();
    if (!key) throw new Error('NO_API_KEY');

    const url = new URL(`${this.BASE_URL}/${endpoint}`);
    url.searchParams.set('key', key);
    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || 'API Error');
    return data;
  },

  async getTrending(pageToken = '') {
    const params = {
      part: 'snippet',
      q: 'trending 2026',
      type: 'video',
      order: 'viewCount',
      maxResults: 24,
      relevanceLanguage: 'en'
    };
    if (pageToken) params.pageToken = pageToken;
    return this.request('search', params);
  },

  async search(query, pageToken = '') {
    const params = {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 24,
      safeSearch: 'none'
    };
    if (pageToken) params.pageToken = pageToken;
    return this.request('search', params);
  },

  async getVideo(videoId) {
    return this.request('videos', {
      part: 'snippet,contentDetails,statistics',
      id: videoId
    });
  },

  async getRelated(videoId) {
    return this.request('search', {
      part: 'snippet',
      relatedToVideoId: videoId,
      type: 'video',
      maxResults: 12
    });
  },

  async getChannelByHandle(handle) {
    return this.request('channels', {
      part: 'snippet,statistics,contentDetails',
      forHandle: handle
    });
  },

  async getChannelById(channelId) {
    return this.request('channels', {
      part: 'snippet,statistics,contentDetails',
      id: channelId
    });
  },

  async getChannelVideos(channelId, pageToken = '') {
    const params = {
      part: 'snippet',
      channelId: channelId,
      type: 'video',
      order: 'date',
      maxResults: 24
    };
    if (pageToken) params.pageToken = pageToken;
    return this.request('search', params);
  },

  formatVideo(item) {
    const id = item.id?.videoId || item.id;
    const snippet = item.snippet || {};
    const stats = item.statistics || {};
    const details = item.contentDetails || {};
    return {
      id,
      title: snippet.title || 'Untitled',
      channel: snippet.channelTitle || '',
      thumbnail: snippet.thumbnails?.high?.url ||
                 snippet.thumbnails?.medium?.url ||
                 UrlParser.getThumbnail(id),
      views: this.formatViews(stats.viewCount),
      duration: this.formatDuration(details.duration),
      publishedAt: this.formatDate(snippet.publishedAt)
    };
  },

  formatChannel(item) {
    const snippet = item.snippet || {};
    const stats = item.statistics || {};
    return {
      id: item.id,
      name: snippet.title || '',
      description: snippet.description || '',
      avatar: snippet.thumbnails?.high?.url ||
              snippet.thumbnails?.medium?.url || '',
      subscribers: this.formatViews(stats.subscriberCount),
      videoCount: stats.videoCount || '0',
      uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads || ''
    };
  },

  formatViews(views) {
    if (!views) return '';
    const n = parseInt(views);
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  },

  formatDuration(iso) {
    if (!iso) return '';
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    const h = parseInt(match[1] || 0);
    const m = parseInt(match[2] || 0);
    const s = parseInt(match[3] || 0);
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
  }

};