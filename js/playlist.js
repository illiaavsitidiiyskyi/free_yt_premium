const Playlist = {

  currentPlaylist: null,

  async openByUrl(url) {
    const playlistId = UrlParser.getPlaylistId(url);
    if (!playlistId) {
      App.showToast('Invalid playlist link', 'error');
      return;
    }

    App.showToast('Loading playlist...');

    const playlist = {
      id: playlistId,
      title: 'Playlist',
      channel: '',
      thumbnail: '',
      videoCount: ''
    };

    this.open(playlist);
  },

  async open(playlist) {
    this.currentPlaylist = playlist;

    const feed = document.getElementById('feed');
    const playerView = document.getElementById('player-view');
    const watchlaterView = document.getElementById('watchlater-view');

    feed.classList.add('hidden');
    playerView.classList.add('hidden');
    watchlaterView.classList.remove('hidden');

    watchlaterView.innerHTML = this.renderHeader(playlist) +
      `<div id="playlist-videos">
        <div class="loader"><div class="spinner"></div> Loading videos...</div>
      </div>`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    await this.loadVideos(playlist.id);
  },

  renderHeader(playlist) {
    return `
      <div class="channel-header">
        <div class="channel-avatar" style="border-radius: 8px">
          ${playlist.thumbnail
            ? `<img src="${playlist.thumbnail}" alt="${playlist.title}" style="border-radius:8px">`
            : `<div class="channel-avatar-placeholder">▶</div>`
          }
        </div>
        <div class="channel-info">
          <div class="channel-name">${playlist.title}</div>
          <div class="channel-stats">
            ${playlist.channel ? `<span>📺 ${playlist.channel}</span>` : ''}
            ${playlist.videoCount ? `<span>🎬 ${playlist.videoCount} videos</span>` : ''}
          </div>
        </div>
      </div>
      <div class="feed-title" style="margin-bottom: 16px">
        ▶ Playlist videos
      </div>
    `;
  },

  async loadVideos(playlistId, pageToken = '') {
    const container = document.getElementById('playlist-videos');
    if (!container) return;

    try {
      const data = await API.getPlaylist(playlistId);
alert('items: ' + (data.items ? data.items.length : 'none') + ' error: ' + JSON.stringify(data.error));
      const videos = (data.items || [])
        .map(item => API.formatPlaylistVideo(item))
        .filter(v => v.id);

      if (videos.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="icon">📭</div>
            <p>Playlist is empty</p>
          </div>
        `;
        return;
      }

      const grid = `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px">
          ${videos.map(v => Feed.renderCard(v)).join('')}
        </div>
        ${data.nextPageToken ? `
          <div id="load-more" style="display:flex; justify-content:center; padding:20px">
            <button class="btn-secondary"
              onclick="Playlist.loadVideos('${playlistId}', '${data.nextPageToken}')">
              Load more
            </button>
          </div>
        ` : ''}
      `;

      if (pageToken) {
        const loadMore = document.getElementById('load-more');
        if (loadMore) loadMore.remove();
        container.insertAdjacentHTML('beforeend', grid);
      } else {
        container.innerHTML = grid;
      }
    } catch (e) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">⚠️</div>
          <p>Error loading videos</p>
        </div>
      `;
    }
  }

};