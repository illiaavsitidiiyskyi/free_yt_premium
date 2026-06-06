const Search = {

    init() {
        const input = document.getElementById('search-input');
        const btn = document.getElementById('search-btn');

        btn.addEventListener('click', () => {
            this.handle(input.value);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handle(input.value);
            }
        });

        input.addEventListener('paste', (e) => {
    setTimeout(() => {
        const text = input.value.trim();
        if (text) {
            this.handle(text);
        }
    }, 50);
});
    },

    handle(value) {
  value = value.trim();
  if (!value) return;

  const input = document.getElementById('search-input');

  console.log('handle:', value);
  console.log('isPlaylist:', UrlParser.isPlaylistUrl(value));
  console.log('isChannel:', UrlParser.isChannelUrl(value));

  if (UrlParser.isPlaylistUrl(value)) {
    input.value = '';
    Playlist.openByUrl(value);
    return;
  }

  if (UrlParser.isChannelUrl(value)) {
    input.value = '';
    Channel.openByUrl(value);
    return;
  }

  if (UrlParser.isYoutubeUrl(value)) {
    input.value = '';
    Player.openByUrl(value);
    return;
  }

  if (UrlParser.getVideoId(value)) {
    input.value = '';
    Player.openByUrl(value);
    return;
  }

  input.value = '';
  Search.setActive('search');
  Feed.loadSearch(value);
},

    setActive(page) {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('active');
        });
        const item = document.querySelector(`[data-page="${page}"]`)
        if (item) item.classList.add('active');
    }

};