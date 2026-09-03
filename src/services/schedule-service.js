const PKASchedule = (function () {
  function toVN(d) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
  }

  function toISO(d) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }

  function getWeekRange(baseDate = new Date()) {
    const curr = new Date(baseDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(curr.setDate(diff));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { mon, sun };
  }

  function createPayload(studentId, startDate, endDate) {
    return {
      action: PKA_CONSTANTS.DEFAULT_ACTION,
      func: PKA_CONSTANTS.DEFAULT_FUNC,
      iM: PKA_CONSTANTS.DECRYPT_KEY,
      strQLSV_NguoiHoc_Id: studentId,
      strNgayBatDau: typeof startDate === "string" ? startDate : toVN(startDate),
      strNgayKetThuc: typeof endDate === "string" ? endDate : toVN(endDate),
      strChucNang_Id: PKA_CONSTANTS.DEFAULT_CHUC_NANG_ID,
      strNguoiThucHien_Id: studentId
    };
  }

  async function fetchSchedule({ payload, endpoint, key, authHeader }) {
    const targetEndpoint = endpoint || PKA_CONSTANTS.REAL_ENDPOINT;
    const encryptionKey = key || PKA_CONSTANTS.CANDIDATE_KEYS[0];
    const token = authHeader || (typeof PKAAuth !== "undefined" ? PKAAuth.getAuthHeader() : null);

    const plaintext = JSON.stringify(payload);
    const encryptedA = PKACrypto.encryptAE(plaintext, encryptionKey);
    const postBody = "A=" + encodeURIComponent(encryptedA);

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest"
    };
    if (token) headers["Authorization"] = token;

    const res = await fetch(targetEndpoint, {
      method: "POST",
      headers,
      body: postBody
    });

    const resText = await res.text();
    const cipherB = PKACrypto.extractCipherB(resText);

    // Giải mã Data.B bằng khóa AzzSystem
    const decrypted = PKACrypto.decryptAD(cipherB, PKA_CONSTANTS.DECRYPT_KEY) ||
                      PKACrypto.decryptAD(cipherB, encryptionKey);

    if (!decrypted) {
      throw new Error("Không thể giải mã dữ liệu thời khóa biểu từ máy chủ");
    }

    let parsed = null;
    try {
      parsed = JSON.parse(decrypted);
    } catch (e) {
      parsed = decrypted;
    }

    const list = Array.isArray(parsed)
      ? parsed
      : (parsed?.data || parsed?.Table || parsed?.LichHoc || []);

    return { raw: parsed, list };
  }

  return {
    toVN,
    toISO,
    getWeekRange,
    createPayload,
    fetchSchedule
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PKASchedule;
}
