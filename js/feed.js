const Feed = {

  nextPageToken: '',
  isLoading: false,
  currentQuery: '',

  async loadHome() {
    const feed = document.getElementById('feed');
    const playerView = document.getElementById('player-view');
    const watchlaterView = document.getElementById('watchlater-view');

    playerView.classList.add('hidden');
    watchlaterView.classList.add('hidden');
    feed.classList.remove('hidden');

    this.nextPageToken = '';
    this.currentQuery = '';

    feed.innerHTML = `
      <div class="feed-title"> Trending <span>popular now</span></div>
      <div class="loader"><div class="spinner"></div> Loading...</div>
    `;

    if (!Storage.hasApiKey()) {
      feed.innerHTML = `
        <div class="feed-title">YTFREE</div>
        <div class="empty-state">
          <div class="icon"></div>
          <p>Enter the API key to see the video feed</p>
          <button class="btn-primary" onclick="App.openApiModal()" style="margin-top:12px">
            Add a key
          </button>
        </div>
      `;
      return;
    }

    try {
      const data = await API.getTrending();
      this.nextPageToken = data.nextPageToken || '';
      const videos = (data.items || []).map(item => API.formatVideo(item));
      this.renderVideos(feed, videos, true);
    } catch (e) {
      this.renderError(feed, e.message);
    }
  },

  async loadSearch(query) {
    const feed = document.getElementById('feed');
    const playerView = document.getElementById('player-view');
    const watchlaterView = document.getElementById('watchlater-view');

    playerView.classList.add('hidden');
    watchlaterView.classList.add('hidden');
    feed.classList.remove('hidden');

    this.nextPageToken = '';
    this.currentQuery = query;

    feed.innerHTML = `
      <div class="feed-title">🔍 ${query} <span>search results</span></div>
      <div class="loader"><div class="spinner"></div> Search...</div>
    `;

    try {
      const [videosData, channelsData] = await Promise.all([
        API.search(query),
        API.searchChannels(query)
      ]);

      this.nextPageToken = videosData.nextPageToken || '';
      const videos = (videosData.items || []).map(item => API.formatVideo(item));
      const channels = (channelsData.items || []).map(item => ({
        id: item.snippet?.channelId || item.id?.channelId,
        name: item.snippet?.title || '',
        avatar: item.snippet?.thumbnails?.high?.url || '',
        description: item.snippet?.description || ''
      })).filter(c => c.id);

      const titleHtml = `<div class="feed-title">🔍 ${query} <span>search results</span></div>`;

      let channelsHtml = '';
      if (channels.length > 0) {
        channelsHtml = `
          <div class="search-channels">
            <div class="search-section-title">Channels</div>
            <div class="channels-row">
              ${channels.map(c => `
                <div class="channel-chip" onclick="Channel.open(${JSON.stringify(c).replace(/"/g, '&quot;')})">
                  <div class="channel-chip-avatar">
                    ${c.avatar
                      ? `<img src="${c.avatar}" alt="${c.name}">`
                      : `<div class="channel-chip-placeholder">${c.name[0]}</div>`
                    }
                  </div>
                  <div class="channel-chip-name">${c.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      const videosHtml = videos.map(v => this.renderCard(v)).join('');
      const loadMoreHtml = this.nextPageToken ? this.renderLoadMoreBtn() : '';

      feed.innerHTML = titleHtml + channelsHtml + videosHtml + loadMoreHtml;

    } catch (e) {
      this.renderError(feed, e.message);
    }
  },

  async loadMore() {
    if (this.isLoading || !this.nextPageToken) return;
    this.isLoading = true;

    const btn = document.querySelector('#load-more button');
    if (btn) btn.textContent = 'Loading...';

    try {
      let data;
      if (this.currentQuery) {
        data = await API.search(this.currentQuery, this.nextPageToken);
      } else {
        data = await API.getTrending(this.nextPageToken);
      }

      this.nextPageToken = data.nextPageToken || '';
      const videos = (data.items || []).map(item => API.formatVideo(item));

      const loadMore = document.getElementById('load-more');
      if (loadMore) loadMore.remove();

      const feed = document.getElementById('feed');
      videos.forEach(v => {
        feed.insertAdjacentHTML('beforeend', this.renderCard(v));
      });

      if (this.nextPageToken) {
        feed.insertAdjacentHTML('beforeend', this.renderLoadMoreBtn());
      }
    } catch (e) {
      App.showToast('Loading error', 'error');
    }

    this.isLoading = false;
  },

  renderVideos(container, videos, withTitle = false) {
    if (videos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon"></div>
          <p>Nothing found</p>
        </div>
      `;
      return;
    }

    const title = container.querySelector('.feed-title');
    const titleHtml = title ? title.outerHTML : '';

    container.innerHTML = titleHtml +
      videos.map(v => this.renderCard(v)).join('') +
      (this.nextPageToken ? this.renderLoadMoreBtn() : '');
  },

  renderCard(video) {
    const inWL = Storage.isInWatchLater(video.id);
    const videoJson = JSON.stringify(video).replace(/"/g, '&quot;');
    return `
      <div class="video-card" onclick="Player.open(${videoJson})">
        <div class="video-thumb">
          <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
          ${video.duration ? `<div class="video-duration">${video.duration}</div>` : ''}
          <button class="card-wl-btn ${inWL ? 'saved' : ''}"
            onclick="event.stopPropagation(); WatchLater.toggleFromCard(${videoJson})"
            title="Watch later">
            ${inWL ? '✓' : '+'}
          </button>
        </div>
        <div class="video-info">
          <div class="video-title">${video.title}</div>
          <div class="video-channel">${video.channel}</div>
          <div class="video-meta">
            ${video.views ? `<span>${video.views} views</span>` : ''}
            ${video.publishedAt ? `<span>${video.publishedAt}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  renderLoadMoreBtn() {
    return `
      <div id="load-more">
        <button onclick="Feed.loadMore()">Load more</button>
      </div>
    `;
  },

  renderError(container, message) {
    const isNoKey = message === 'NO_API_KEY';
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">${isNoKey ? '' : ''}</div>
        <p>${isNoKey ? 'Add an API key to continue' : 'Error: ' + message}</p>
        ${isNoKey ? `<button class="btn-primary" onclick="App.openApiModal()" style="margin-top:12px">Add a key</button>` : ''}
      </div>
    `;
  }

};