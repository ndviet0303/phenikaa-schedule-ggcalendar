const PKAIcs = (function () {
  // Bảng màu Google & Apple Calendar chuẩn
  const PALETTE = [
    { name: "tomato", hex: "#D50000" },      // Đỏ cà chua
    { name: "tangerine", hex: "#F4511E" },   // Cam san hô
    { name: "banana", hex: "#F6BF26" },      // Vàng chuối
    { name: "basil", hex: "#0B8043" },       // Xanh lục
    { name: "peacock", hex: "#039BE5" },     // Xanh da trời
    { name: "blueberry", hex: "#3F51B5" },   // Xanh dương đậm
    { name: "grape", hex: "#8E24AA" },       // Tím nho
    { name: "flamingo", hex: "#E67C73" },    // Hồng flamingo
    { name: "sage", hex: "#33B679" },        // Xanh sage
    { name: "lavender", hex: "#7986CB" }     // Tím oải hương
  ];

  function getSubjectColor(subjectName = "") {
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % PALETTE.length;
    return PALETTE[idx];
  }

  function parseDateStr(str) {
    if (!str) return null;
    const match = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      return {
        d: match[1].padStart(2, "0"),
        m: match[2].padStart(2, "0"),
        y: match[3]
      };
    }
    return null;
  }

  function generateIcs(scheduleList) {
    const nowStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const events = [];

    scheduleList.forEach((item, index) => {
      const dateInfo = parseDateStr(item.THUHOC || item.NGAYHOC || item.NgayHoc);
      if (!dateInfo) return;

      let startH = "07", startM = "00";
      let endH = "09", endM = "00";

      if (item.GIOBATDAU !== undefined) {
        startH = String(item.GIOBATDAU).padStart(2, "0");
        startM = String(item.PHUTBATDAU || 0).padStart(2, "0");
      }
      if (item.GIOKETTHUC !== undefined) {
        endH = String(item.GIOKETTHUC).padStart(2, "0");
        endM = String(item.PHUTKETTHUC || 0).padStart(2, "0");
      }

      const dtStart = `${dateInfo.y}${dateInfo.m}${dateInfo.d}T${startH}${startM}00`;
      const dtEnd = `${dateInfo.y}${dateInfo.m}${dateInfo.d}T${endH}${endM}00`;

      const summary = item.TENHOCPHAN || item.TenMonHoc || "Lịch học Phenikaa";
      const location = item.PHONGHOC_TEN || item.TENPHONGHOC || "Phenikaa University";
      const tenLop = item.DANGKY_LOPHOCPHAN_TEN || item.TENLOPHOCPHAN?.replace(/<br>/g, "") || "";
      const gv = item.GIANGVIEN || item.TenGiangVien || "Chưa cập nhật";
      const tiet = item.TIETBATDAU ? `Tiết ${item.TIETBATDAU} - ${item.TIETKETTHUC}` : "";
      const hinhThuc = item.THUOCTINH_TEN || "";

      // Gán mã màu chuẩn theo từng môn
      const color = getSubjectColor(summary);

      const desc = `Lớp: ${tenLop}\\nGiảng viên: ${gv}\\nThời gian: ${tiet} (${hinhThuc})\\nPhenikaa Schedule Dispatcher by Ziet`;

      events.push([
        "BEGIN:VEVENT",
        `UID:pka-${dateInfo.y}${dateInfo.m}${dateInfo.d}-${index}@ziet.dev`,
        `DTSTAMP:${nowStr}`,
        `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}`,
        `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}`,
        `SUMMARY:${summary}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${desc}`,
        `CATEGORIES:${summary}`,
        `COLOR:${color.hex}`,
        `X-COLOR:${color.hex}`,
        `X-APPLE-CALENDAR-COLOR:${color.hex}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      ].join("\r\n"));
    });

    const vTimezone = [
      "BEGIN:VTIMEZONE",
      "TZID:Asia/Ho_Chi_Minh",
      "X-LIC-LOCATION:Asia/Ho_Chi_Minh",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:+0700",
      "TZOFFSETTO:+0700",
      "TZNAME:+07",
      "DTSTART:19700101T000000",
      "END:STANDARD",
      "END:VTIMEZONE"
    ].join("\r\n");

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ziet Dev//Phenikaa Schedule Dispatcher//VI",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Thời Khóa Biểu Phenikaa",
      "X-WR-TIMEZONE:Asia/Ho_Chi_Minh",
      vTimezone,
      ...events,
      "END:VCALENDAR"
    ].join("\r\n");
  }

  function downloadIcsFile(scheduleList, filename = "LichHoc_Phenikaa.ics") {
    const content = generateIcs(scheduleList);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    PALETTE,
    getSubjectColor,
    generateIcs,
    downloadIcsFile
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PKAIcs;
}
