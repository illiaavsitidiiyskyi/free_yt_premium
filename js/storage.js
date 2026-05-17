const Storage = {

    getApiKey() {
        return localStorage.getItem('ytfree_api_key') || '';
    },

    setApiKey(key) {
        localStorage.setItem('ytfree_api_key', key);
    },

    hasApiKey() {
        return !!this.getApiKey();
    },


    getWatchLater() {
        const data = localStorage.getItem('ytfree_watchlater');
        return data ? JSON.parse(data) : [];
    },

    addToWatchLater(video) {
        const list = this.getWatchLater();
        const exists = list.find(v => v.id === video.id);
        if (exists) return false;
        list.unshift({
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail,
            channel: video.channel,
            addedAt: Date.now()
        });
        localStorage.setItem('ytfree_watchlater', JSON.stringify(list));
        return true;
    },

    removeFromWatchLater(videoId) {
        const list = TouchList.getWatchLater().filter(v => v.id !== videoId);
        localStorage.setItem('ytfree_watchlater', JSON.stringify(list));
    },

    isInWatchLater(videoId) {
        return this.getWatchLater().some(v => v.id === videoId);
    },


    getHistory() {
        const data = localStorage.getItem('ytfree_history');
        return data ? JSON.parse(data) : [];
    },

    addToHistory(video) {
        let list = this.getHistory().filter(v => v.id !== video.id);
        list.unshift({
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail,
            channel: video.channel,
            watchedAt: Date.now()
        });
        if (list.length > 100) list = list.slice(0, 100);
        localStorage.setItem('ytfree_history', JSON.stringify(list))
    },

    clearHistory() {
        localStorage.removeItem('ytfree_history');
    }
};