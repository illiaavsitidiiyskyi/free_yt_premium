const WatchLater = {

  show() {
    const feed = document.getElementById('feed');
    const playerView = document.getElementById('player-view');
    const view = document.getElementById('watchlater-view');

    feed.classList.add('hidden');
    playerView.classList.add('hidden');
    view.classList.remove('hidden');

    this.render();
  },

  render() {
    const view = document.getElementById('watchlater-view');
    const list = Storage.getWatchLater();

    if (list.length === 0) {
      view.innerHTML = `
        <div class="feed-title"> Watch later</div>
        <div class="empty-state">
          <div class="icon"></div>
          <p>The list is empty. Add a video by clicking + on the card</p>
        </div>
      `;
      return;
    }

    view.innerHTML = `
      <div class="feed-title">
        Watch later
        <span>${list.length} video</span>
        <button class="btn-secondary" onclick="WatchLater.clearAll()"
          style="margin-left:auto; font-size:12px; padding:4px 12px">
          Clear all
        </button>
      </div>
      <div id="feed" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px">
        ${list.map(v => this.renderCard(v)).join('')}
      </div>
    `;
  },

  renderCard(video) {
    return `
      <div class="video-card" onclick="Player.open(${JSON.stringify(video).replace(/"/g, '&quot;')})">
        <div class="video-thumb">
          <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
          <button class="card-wl-btn saved"
            onclick="event.stopPropagation(); WatchLater.remove('${video.id}')"
            title="Remove from list">
            ✓
          </button>
        </div>
        <div class="video-info">
          <div class="video-title">${video.title}</div>
          <div class="video-channel">${video.channel}</div>
          <div class="video-meta">
            <span>${this.formatDate(video.addedAt)}</span>
          </div>
        </div>
      </div>
    `;
  },

  toggleFromCard(video) {
    const inWL = Storage.isInWatchLater(video.id);

    if (inWL) {
      Storage.removeFromWatchLater(video.id);
      App.showToast('Removed from the list');
    } else {
      Storage.addToWatchLater(video);
      App.showToast('Added to watch later', 'success');
    }

    this.updateBadge();

    const btns = document.querySelectorAll('.card-wl-btn');
    btns.forEach(btn => {
      const card = btn.closest('.video-card');
      if (card && card.getAttribute('onclick')?.includes(video.id)) {
        btn.textContent = inWL ? '+' : '✓';
        btn.classList.toggle('saved', !inWL);
      }
    });
  },

  remove(videoId) {
    Storage.removeFromWatchLater(videoId);
    this.render();
    this.updateBadge();
    App.showToast('Removed from the list');
  },

  clearAll() {
    if (!confirm('Clear the entire list?')) return;
    localStorage.removeItem('ytfree_watchlater');
    this.render();
    this.updateBadge();
  },

  updateBadge() {
    const count = Storage.getWatchLater().length;
    const badge = document.querySelector('[data-page="watchlater"] .nav-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline' : 'none';
    }
  },

  formatDate(timestamp) {
    if (!timestamp) return '';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min. back`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days back`;
  }

};