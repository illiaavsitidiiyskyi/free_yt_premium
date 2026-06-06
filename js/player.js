const Player = {

  currentVideo: null,

  open(video) {
    this.currentVideo = video;
    Storage.addToHistory(video);

    const view = document.getElementById('player-view');
    const feed = document.getElementById('feed');
    const watchlaterView = document.getElementById('watchlater-view');

    feed.classList.add('hidden');
    watchlaterView.classList.add('hidden');
    view.classList.remove('hidden');

    view.innerHTML = this.renderPlayer(video);
    this.loadRelated(video.id);
    this.updateWatchLaterBtn(video.id);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.initPlaylistAutoplay();
  },

  renderPlayer(video) {
    const playlistIndex = (Playlist.currentVideos || []).findIndex(v => v.id === video.id);
const embedUrl = UrlParser.getEmbedUrl(video.id, Playlist.currentPlaylist?.id, playlistIndex);
    const inWL = Storage.isInWatchLater(video.id);

    const playlistVideos = Playlist.currentVideos || [];
    const otherVideos = playlistVideos.filter(v => v.id !== video.id);

    return `
      <div class="player-wrapper">
        <iframe
          src="${embedUrl}"
          allowfullscreen
          allow="autoplay; fullscreen; picture-in-picture"
        ></iframe>
      </div>

      <div class="player-info">
        <div class="player-title">${video.title}</div>
        <div class="player-meta">
          <div class="player-channel">${video.channel}</div>
          <div class="player-stats">
            ${video.views ? `<span>👁 ${video.views}</span>` : ''}
            ${video.publishedAt ? `<span>${video.publishedAt}</span>` : ''}
          </div>
        </div>
        <div class="player-actions">
          <button class="player-btn ${inWL ? 'saved' : ''}" id="wl-btn" onclick="Player.toggleWatchLater()">
            ${inWL ? '✓ In list' : '🕐 Watch later'}
          </button>
          <button class="player-btn" onclick="Player.copyLink()">
            🔗 Copy link
          </button>
        </div>
      </div>

      ${otherVideos.length > 0 ? `
        <div class="related-title">▶ From playlist</div>
        <div class="related-grid">
          ${otherVideos.map(v => Feed.renderCard(v)).join('')}
        </div>
      ` : '<div id="related-section"></div>'}
    `;
  },

  async loadRelated(videoId) {
    const section = document.getElementById('related-section');
    if (!section) return;

    section.innerHTML = `<div class="loader"><div class="spinner"></div> Loading...</div>`;

    try {
      const data = await API.search(Player.currentVideo?.channel || 'trending');
      const videos = (data.items || [])
        .map(item => API.formatVideo(item))
        .filter(v => v.id !== videoId)
        .slice(0, 8);

      if (videos.length === 0) {
        section.innerHTML = '';
        return;
      }

      section.innerHTML = `
        <div class="related-title">More videos</div>
        <div class="related-grid">
          ${videos.map(v => Feed.renderCard(v)).join('')}
        </div>
      `;
    } catch (e) {
      section.innerHTML = '';
    }
  },

  toggleWatchLater() {
    if (!this.currentVideo) return;
    const btn = document.getElementById('wl-btn');
    const inWL = Storage.isInWatchLater(this.currentVideo.id);

    if (inWL) {
      Storage.removeFromWatchLater(this.currentVideo.id);
      btn.textContent = ' Watch later';
      btn.classList.remove('saved');
      App.showToast('Removed from the list');
    } else {
      Storage.addToWatchLater(this.currentVideo);
      btn.textContent = 'On the list';
      btn.classList.add('saved');
      App.showToast('Added to watch later', 'success');
    }

    WatchLater.updateBadge();
  },

  updateWatchLaterBtn(videoId) {
    const btn = document.getElementById('wl-btn');
    if (!btn) return;
    const inWL = Storage.isInWatchLater(videoId);
    btn.textContent = inWL ? 'On the list' : 'Watch later';
    btn.classList.toggle('saved', inWL);
  },

  copyLink() {
    if (!this.currentVideo) return;
    const url = `https://youtube.com/watch?v=${this.currentVideo.id}`;
    navigator.clipboard.writeText(url).then(() => {
      App.showToast('Link copied', 'success');
    });
  },

  async openByUrl(url) {
    const videoId = UrlParser.getVideoId(url);
    if (!videoId) {
      App.showToast('Invalid link', 'error');
      return;
    }

    App.showToast('Loading video...');

    try {
      const data = await API.getVideo(videoId);
      if (data.items && data.items.length > 0) {
        const video = API.formatVideo(data.items[0]);
        this.open(video);
      } else {
        this.open({
          id: videoId,
          title: 'Video',
          channel: '',
          thumbnail: UrlParser.getThumbnail(videoId),
          views: '',
          duration: '',
          publishedAt: ''
        });
      }
    } catch (e) {
      this.open({
        id: videoId,
        title: 'Video',
        channel: '',
        thumbnail: UrlParser.getThumbnail(videoId),
        views: '',
        duration: '',
        publishedAt: ''
      });
    }
  },

  initPlaylistAutoplay() {
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://www.youtube-nocookie.com') return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange' && data.info === 0) {
          this.playNext();
        }
      } catch (e) {}
    });
  },

  playNext() {
    const videos = Playlist.currentVideos;
    if (!videos || videos.length === 0) return;

    const currentIndex = videos.findIndex(v => v.id === this.currentVideo?.id);
    const nextIndex = (currentIndex + 1) % videos.length;
    const nextVideo = videos[nextIndex];

    if (nextVideo) {
      this.open(nextVideo);
    }
  },

};