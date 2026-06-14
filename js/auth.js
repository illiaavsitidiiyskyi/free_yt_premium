const Auth = {

  CLIENT_ID: '938400051774-4e446dfh4cua1kols24uh30c28o8ofns.apps.googleusercontent.com',
  SCOPE: 'https://www.googleapis.com/auth/youtube.readonly',
  TOKEN_KEY: 'ytfree_access_token',
  TOKEN_EXPIRY_KEY: 'ytfree_token_expiry',

  getToken() {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      this.logout();
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  login() {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: window.location.origin + window.location.pathname,
      response_type: 'token',
      scope: this.SCOPE,
      include_granted_scopes: 'true'
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  },

  handleCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, Date.now() + parseInt(expiresIn) * 1000);
      window.location.hash = '';
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

};
