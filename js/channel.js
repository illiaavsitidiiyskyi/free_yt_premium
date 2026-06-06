const Channel = {

  currentChannel: null,

  async openByUrl(url) {
    const info = UrlParser.getChannelInfo(url);
    if (!info) {
      App.showToast('Invalid channel link', 'error');
      return;
    }
    App.showToast('Loading channel...');
    try {
      let data;
      if (info.type === 'handle') {
        data = await API.getChannelByHandle(info.value);
      } else {
        data = await API.getChannelById(info.value);
      }
      if (!data.items || data.items.length === 0) {
        App.showToast('Channel not found', 'error');
        return;
      }
      const channel = API.formatChannel(data.items[0]);
      this.open(channel);
    } catch (e) {
      App.showToast('Channel loading error', 'error');
    }
  },

  async open(channel) {
    this.currentChannel = channel;
    const feed = document.getElementById('feed');
    const playerView = document.getElementById('player-view');
    const watchlaterView = document.getElementById('watchlater-view');
    feed.classList.add('hidden');
    playerView.classList.add('hidden');
    watchlaterView.classList.remove('hidden');
    watchlaterView.innerHTML = this.renderHeader(channel) +
      `<div id="channel-videos">
        <div class="loader"><div class="spinner"></div> Loading videos...</div>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await this.loadVideos(channel.id);
  },

  renderHeader(channel) {
    const name = channel.name || 'Channel';
    const avatar = channel.avatar || '';
    const description = channel.description || '';
    const subscribers = channel.subscribers || '';
    const videoCount = channel.videoCount || '';
    return `
      <div class="channel-header">
        <div class="channel-avatar">
          ${avatar
            ? `<img src="${avatar}" alt="${name}">`
            : `<div class="channel-avatar-placeholder">${name[0] || '?'}</div>`
          }
        </div>
        <div class="channel-info">
          <div class="channel-name">${name}</div>
          <div class="channel-stats">
            ${subscribers ? `<span>👥 ${subscribers} subscribers</span>` : ''}
            ${videoCount ? `<span>🎬 ${videoCount} videos</span>` : ''}
          </div>
          ${description ? `<div class="channel-desc">${description.slice(0, 150)}${description.length > 150 ? '...' : ''}</div>` : ''}
          <div style="margin-top: 10px; display: flex; gap: 8px;">
            <button class="player-btn" onclick="Channel.shuffle()">
              🔀 Shuffle
            </button>
          </div>
        </div>
      </div>
      <div class="feed-title" style="margin-bottom: 16px">
        🎬 Channel videos
      </div>
    `;
  },

  async loadVideos(channelId, pageToken = '') {
    const container = document.getElementById('channel-videos');
    if (!container) return;
    try {
      const data = await API.getChannelVideos(channelId, pageToken);
      const videos = (data.items || [])
        .map(item => API.formatPlaylistVideo(item))
        .filter(v => v.id);
      if (videos.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="icon">📭</div>
            <p>No videos</p>
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
              onclick="Channel.loadVideos('${channelId}', '${data.nextPageToken}')">
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
  },

  shuffle() {
    const container = document.querySelector('#channel-videos [style*="grid"]');
    if (!container) {
      App.showToast('Videos still loading...', 'error');
      return;
    }
    const cards = Array.from(container.children);
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    cards.forEach(card => container.appendChild(card));
    App.showToast('Channel shuffled 🔀', 'success');
  }

};
