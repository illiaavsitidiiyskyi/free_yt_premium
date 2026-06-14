const App = {

  init() {
    if (Auth.handleCallback()) {
      console.log('OAuth callback handled');
    }

    this.initHeader();
    this.initSidebar();
    this.initBottomNav();
    this.initModal();
    Search.init();
    WatchLater.updateBadge();
    this.updateAuthBtn();
    Feed.loadHome();
  },

  initHeader() {
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', () => {
        this.setActivePage('home');
        Feed.loadHome();
      });
    }

    const apiBtn = document.getElementById('api-key-btn');
    if (apiBtn) {
      this.updateApiBtn();
      apiBtn.addEventListener('click', () => this.openApiModal());
    }
  },

  initSidebar() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        this.setActivePage(page);
        this.navigateTo(page);
      });
    });
  },

  initBottomNav() {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const page = item.dataset.page;
        this.setActivePage(page);
        this.navigateTo(page);
      });
    });
  },

  navigateTo(page) {
    if (page === 'home') Feed.loadHome();
    else if (page === 'watchlater') WatchLater.show();
    else if (page === 'history') this.showHistory();
    else if (page === 'account') Account.show();
  },

  initModal() {
    const overlay = document.getElementById('modal-overlay');
    const cancelBtn = document.getElementById('modal-cancel');
    const saveBtn = document.getElementById('modal-save');
    const input = document.getElementById('api-key-input');

    cancelBtn.addEventListener('click', () => this.closeApiModal());

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeApiModal();
    });

    saveBtn.addEventListener('click', () => {
      const key = input.value.trim();
      if (!key) {
        this.showToast('Enter key', 'error');
        return;
      }
      Storage.setApiKey(key);
      this.updateApiBtn();
      this.closeApiModal();
      this.showToast('Key saved', 'success');
      Feed.loadHome();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveBtn.click();
      if (e.key === 'Escape') this.closeApiModal();
    });
  },

  openApiModal() {
    const overlay = document.getElementById('modal-overlay');
    const input = document.getElementById('api-key-input');
    input.value = Storage.getApiKey();
    overlay.classList.add('open');
    setTimeout(() => input.focus(), 100);
  },

  closeApiModal() {
    document.getElementById('modal-overlay').classList.remove('open');
  },

  updateApiBtn() {
    const btn = document.getElementById('api-key-btn');
    if (!btn) return;
    if (Storage.hasApiKey()) {
      btn.textContent = '✓ API Key';
      btn.classList.add('set');
    } else {
      btn.textContent = '⚙ API Key';
      btn.classList.remove('set');
    }
  },

  updateAuthBtn() {
    const btn = document.getElementById('auth-btn');
    if (!btn) return;
    if (Auth.isLoggedIn()) {
      btn.textContent = '✓ Account';
      btn.classList.add('set');
    } else {
      btn.textContent = '👤 Account';
      btn.classList.remove('set');
    }
  },

  showHistory() {
    const feed = document.getElementById('feed');
    const playerView = document.getElementById('player-view');
    const watchlaterView = document.getElementById('watchlater-view');

    feed.classList.add('hidden');
    playerView.classList.add('hidden');
    watchlaterView.classList.remove('hidden');

    const list = Storage.getHistory();
    const view = document.getElementById('watchlater-view');

    if (list.length === 0) {
      view.innerHTML = `
        <div class="feed-title">📺 History</div>
        <div class="empty-state">
          <div class="icon">📺</div>
          <p>History is empty</p>
        </div>
      `;
      return;
    }

    view.innerHTML = `
      <div class="feed-title">
        📺 History
        <span>${list.length} videos</span>
        <button class="btn-secondary" onclick="App.clearHistory()"
          style="margin-left:auto; font-size:12px; padding:4px 12px">
          Clear
        </button>
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px">
        ${list.map(v => Feed.renderCard(v)).join('')}
      </div>
    `;
  },

  clearHistory() {
    if (!confirm('Clear history?')) return;
    Storage.clearHistory();
    this.showHistory();
    this.showToast('History cleared');
  },

  setActivePage(page) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
    });
    const item = document.querySelector(`[data-page="${page}"]`);
    if (item) item.classList.add('active');
  },

  showToast(message, type = '') {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

};

document.addEventListener('DOMContentLoaded', () => App.init());
