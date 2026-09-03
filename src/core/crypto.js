const PKACrypto = (function () {
  const DEFAULT_KEY = typeof PKA_CONSTANTS !== "undefined" ? PKA_CONSTANTS.CANDIDATE_KEYS[0] : "DSA4BRINKCIpAiAPKSAv";
  const DECRYPT_KEY = typeof PKA_CONSTANTS !== "undefined" ? PKA_CONSTANTS.DECRYPT_KEY : "AzzSystem";

  function encryptAE(plaintext, key = DEFAULT_KEY) {
    if (typeof window !== "undefined" && typeof window.AE === "function") {
      return window.AE(plaintext, key);
    }
    const e = [];
    for (let n = 0; n < plaintext.length; n++) {
      const o = plaintext.charCodeAt(n) ^ key[n % key.length].charCodeAt(0);
      e.push(String.fromCharCode(o));
    }
    const utf8Bytes = new TextEncoder().encode(e.join(""));
    let binStr = "";
    for (let i = 0; i < utf8Bytes.length; i++) {
      binStr += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binStr);
  }

  function decryptAD(ciphertext, key = DECRYPT_KEY) {
    if (!ciphertext || typeof ciphertext !== "string") return null;
    let clean = ciphertext.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) clean = clean.slice(1, -1);

    if (typeof window !== "undefined" && typeof window.AD === "function") {
      try {
        const r = window.AD(clean, key);
        if (r) return r;
      } catch (e) {}
    }

    try {
      const binString = atob(clean);
      const bytes = Uint8Array.from(binString, (c) => c.charCodeAt(0));
      const decodedUtf8 = new TextDecoder("utf-8").decode(bytes);

      const res = [];
      for (let i = 0; i < decodedUtf8.length; i++) {
        const o = decodedUtf8.charCodeAt(i) ^ key[i % key.length].charCodeAt(0);
        res.push(String.fromCharCode(o));
      }
      return res.join("");
    } catch (err) {
      return null;
    }
  }

  function tryDecryptScheduleJson(cipherText, extraKey = null) {
    const keys = (typeof PKA_CONSTANTS !== "undefined" ? [...PKA_CONSTANTS.CANDIDATE_KEYS] : [DEFAULT_KEY]);
    if (extraKey && !keys.includes(extraKey)) keys.unshift(extraKey);

    for (const k of keys) {
      const plain = decryptAD(cipherText, k);
      if (plain && plain.startsWith("{")) {
        try {
          const obj = JSON.parse(plain);
          if (obj.func || obj.strNgayBatDau || obj.strQLSV_NguoiHoc_Id || obj.action) {
            return { obj, key: k };
          }
        } catch (e) {}
      }
    }
    return null;
  }

  function extractCipherA(body) {
    if (!body) return null;
    if (typeof body === "string") {
      try {
        const p = new URLSearchParams(body);
        if (p.has("A")) return p.get("A");
      } catch (e) {}
      const m = body.match(/(?:^|&)A=([^&]+)/);
      if (m) return decodeURIComponent(m[1]);
      if (body.startsWith("A=")) return decodeURIComponent(body.slice(2));
      return body;
    }
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      if (body.has("A")) return body.get("A");
    }
    if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
      if (body.has("A")) return body.get("A");
    }
    return null;
  }

  function extractCipherB(rawText) {
    if (!rawText) return null;
    try {
      const obj = JSON.parse(rawText);
      if (obj.Data && obj.Data.B) return obj.Data.B;
      if (obj.B) return obj.B;
      if (obj.d) return obj.d;
    } catch (e) {}
    return rawText;
  }

  return {
    encryptAE,
    decryptAD,
    tryDecryptScheduleJson,
    extractCipherA,
    extractCipherB
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PKACrypto;
}
