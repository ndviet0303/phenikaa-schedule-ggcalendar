const PKAAuth = (function () {
  let cachedAuthHeader = null;

  function scanStorageForAuth() {
    try {
      for (const st of [sessionStorage, localStorage]) {
        for (let i = 0; i < st.length; i++) {
          const k = st.key(i);
          const v = st.getItem(k);
          if (typeof v === "string") {
            if (v.startsWith("Bearer eyJ")) {
              cachedAuthHeader = v;
              return cachedAuthHeader;
            }
            if (v.startsWith("eyJ") && v.split(".").length === 3) {
              cachedAuthHeader = "Bearer " + v;
              return cachedAuthHeader;
            }
            if (v.includes('"token":"eyJ')) {
              const m = v.match(/"token":"(eyJ[^"]+)"/);
              if (m) {
                cachedAuthHeader = "Bearer " + m[1];
                return cachedAuthHeader;
              }
            }
          }
        }
      }
    } catch (e) {}
    return cachedAuthHeader;
  }

  function extractStudentIdFromJwt(authHeader) {
    if (!authHeader) return null;
    try {
      const raw = authHeader.replace(/^Bearer\s+/i, "");
      const parts = raw.split(".");
      if (parts.length < 2) return null;
      const json = JSON.parse(atob(parts[1]));
      if (json.unique_name) {
        return json.unique_name.split(";")[0];
      }
    } catch (e) {}
    return null;
  }

  function getAuthHeader() {
    if (cachedAuthHeader) return cachedAuthHeader;
    if (typeof PKAStorage !== "undefined") {
      cachedAuthHeader = PKAStorage.getLocalAuth();
    }
    if (!cachedAuthHeader) {
      cachedAuthHeader = scanStorageForAuth();
    }
    return cachedAuthHeader;
  }

  function setAuthHeader(val) {
    cachedAuthHeader = val;
    if (typeof PKAStorage !== "undefined") {
      PKAStorage.setLocalAuth(val);
    }
  }

  return {
    scanStorageForAuth,
    extractStudentIdFromJwt,
    getAuthHeader,
    setAuthHeader
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PKAAuth;
}
