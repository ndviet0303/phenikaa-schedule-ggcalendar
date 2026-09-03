const PKA_CONSTANTS = {
  REAL_ENDPOINT: "https://qldtbeta.phenikaa-uni.edu.vn/sinhvienapi3/api/SV_ThongTin_MH/DSA4BRINKCIpAiAPKSAv",
  CANDIDATE_KEYS: [
    "DSA4BRINKCIpAiAPKSAv",
    "DSA4BRINkCIpAiAPKSAv"
  ],
  DECRYPT_KEY: "AzzSystem",
  DEFAULT_ACTION: "SV_ThongTin_MH/DSA4BRINKCIpAiAPKSAv",
  DEFAULT_FUNC: "pkg_congthongtin_hssv_thongtin.LayDSLichCaNhan",
  DEFAULT_CHUC_NANG_ID: "B46109CD333D4E3DAC50D43E8607ED46",
  AUTHOR: {
    NAME: "Nghiêm Đức Việt (Ziet)",
    WEBSITE: "https://ziet.dev",
    FACEBOOK: "https://fb.com/ziet.cute",
    MESSENGER: "https://m.me/ziet.cute"
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = PKA_CONSTANTS;
}
