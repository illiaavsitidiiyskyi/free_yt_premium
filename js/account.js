const Account = {

  async getSubscriptions() {
    const token = Auth.getToken();
    if (!token) return [];

    let allSubs = [];
    let pageToken = '';

    do {
      let url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50&order=alphabetical`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error.message);

      const subs = (data.items || []).map(item => ({
        id: item.snippet.resourceId.channelId,
        name: item.snippet.title,
        avatar: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
        description: item.snippet.description || ''
      }));

      allSubs = [...allSubs, ...subs];
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    return allSubs;
  },

  async getPlaylists() {
    const token = Auth.getToken();
    if (!token) return [];

    let allPlaylists = [];
    let pageToken = '';

    do {
      let url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error.message);

      const playlists = (data.items || []).map(item => ({
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
        videoCount: item.contentDetails.itemCount,
        privacy: item.snippet.privacyStatus || 'public'
      }));

      allPlaylists = [...allPlaylists, ...playlists];
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    return allPlaylists;
  },

  async show() {
    const feed = document.getElementById('feed');
    const playerView = document.getElementById('player-view');
    const watchlaterView = document.getElementById('watchlater-view');

    feed.classList.add('hidden');
    playerView.classList.add('hidden');
    watchlaterView.classList.remove('hidden');

    if (!Auth.isLoggedIn()) {
      watchlaterView.innerHTML = `
        <div class="feed-title">👤 Account</div>
        <div class="empty-state">
          <div class="icon">👤</div>
          <p>Sign in with Google to see your subscriptions and playlists</p>
          <button class="btn-primary" onclick="Auth.login()" style="margin-top:16px">
            Sign in with Google
          </button>
        </div>
      `;
      return;
    }

    watchlaterView.innerHTML = `
      <div class="feed-title">👤 Account
        <button class="btn-secondary" onclick="Account.logout()" style="margin-left:auto; font-size:12px; padding:4px 12px">Sign out</button>
      </div>
      <div class="loader"><div class="spinner"></div> Loading...</div>
    `;

    try {
      const [subs, playlists] = await Promise.all([
        this.getSubscriptions(),
        this.getPlaylists()
      ]);

      watchlaterView.innerHTML = `
        <div class="feed-title">👤 Account
          <button class="btn-secondary" onclick="Account.logout()" style="margin-left:auto; font-size:12px; padding:4px 12px">Sign out</button>
        </div>

        <div class="feed-title" style="font-size:18px; margin-top:16px">
          📋 My playlists <span>${playlists.length}</span>
        </div>
        ${playlists.length === 0 ? '<p style="color:var(--text3); padding:12px 0">No playlists found</p>' : `
        <div class="channels-row" style="margin-bottom:24px">
          ${playlists.map(p => `
            <div class="channel-chip" onclick="Playlist.openByUrl('https://www.youtube.com/playlist?list=${p.id}')">
              <div class="channel-chip-avatar" style="border-radius:6px">
                ${p.thumbnail
                  ? `<img src="${p.thumbnail}" alt="${p.title}" style="border-radius:6px">`
                  : `<div class="channel-chip-placeholder">▶</div>`
                }
              </div>
              <div class="channel-chip-name">${p.title}</div>
              <div style="font-size:10px; color:var(--text3)">${p.videoCount} videos ${p.privacy === 'private' ? '🔒' : ''}</div>
            </div>
          `).join('')}
        </div>`}

        <div class="feed-title" style="font-size:18px; margin-top:8px">
          📺 Subscriptions <span>${subs.length}</span>
        </div>
        ${subs.length === 0 ? '<p style="color:var(--text3); padding:12px 0">No subscriptions found</p>' : `
        <div class="channels-row">
          ${subs.map(s => `
            <div class="channel-chip" onclick="Channel.open(${JSON.stringify(s).replace(/"/g, '&quot;')})">
              <div class="channel-chip-avatar">
                ${s.avatar
                  ? `<img src="${s.avatar}" alt="${s.name}">`
                  : `<div class="channel-chip-placeholder">${s.name[0] || '?'}</div>`
                }
              </div>
              <div class="channel-chip-name">${s.name}</div>
            </div>
          `).join('')}
        </div>`}
      `;
    } catch (e) {
      watchlaterView.innerHTML = `
        <div class="feed-title">👤 Account</div>
        <div class="empty-state">
          <div class="icon">⚠️</div>
          <p>Error: ${e.message}</p>
          <button class="btn-secondary" onclick="Account.logout()" style="margin-top:12px">Sign out and retry</button>
        </div>
      `;
    }
  },

  logout() {
    Auth.logout();
    this.show();
    App.updateAuthBtn();
  }

};
