const PKAStorage = (function () {
  const KEYS = {
    PAYLOAD: "pka_cached_payload",
    ENDPOINT: "pka_cached_endpoint",
    AUTH: "pka_cached_auth",
    KEY: "pka_cached_key",
    THEME: "pka_theme"
  };

  function getLocalPayload() {
    try {
      const raw = localStorage.getItem(KEYS.PAYLOAD);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setLocalPayload(payload) {
    try {
      localStorage.setItem(KEYS.PAYLOAD, JSON.stringify(payload));
    } catch (e) {}
  }

  function getLocalAuth() {
    try {
      return localStorage.getItem(KEYS.AUTH);
    } catch (e) {
      return null;
    }
  }

  function setLocalAuth(auth) {
    try {
      localStorage.setItem(KEYS.AUTH, auth);
    } catch (e) {}
  }

  function getLocalEndpoint() {
    try {
      return localStorage.getItem(KEYS.ENDPOINT);
    } catch (e) {
      return null;
    }
  }

  function setLocalEndpoint(ep) {
    try {
      localStorage.setItem(KEYS.ENDPOINT, ep);
    } catch (e) {}
  }

  function getTheme() {
    try {
      return localStorage.getItem(KEYS.THEME) || "dark";
    } catch (e) {
      return "dark";
    }
  }

  function setTheme(t) {
    try {
      localStorage.setItem(KEYS.THEME, t);
    } catch (e) {}
  }

  function getChromeStorage() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(
          ["pka_live_payload", "pka_endpoint", "pka_auth", "pka_key"],
          (result) => resolve(result || {})
        );
      } else {
        resolve({});
      }
    });
  }

  function setChromeStorage(data) {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(data, () => resolve(true));
      } else {
        resolve(false);
      }
    });
  }

  return {
    KEYS,
    getLocalPayload,
    setLocalPayload,
    getLocalAuth,
    setLocalAuth,
    getLocalEndpoint,
    setLocalEndpoint,
    getTheme,
    setTheme,
    getChromeStorage,
    setChromeStorage
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PKAStorage;
}
