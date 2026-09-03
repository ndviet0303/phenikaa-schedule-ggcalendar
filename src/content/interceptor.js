(function () {
  let currentPayload = null;
  let activeEndpoint = PKA_CONSTANTS.REAL_ENDPOINT;
  let currentKey = PKA_CONSTANTS.CANDIDATE_KEYS[0];
  let lastDecryptedList = [];

  // Khôi phục từ storage hoặc quét JWT
  function initSession() {
    currentPayload = PKAStorage.getLocalPayload();
    activeEndpoint = PKAStorage.getLocalEndpoint() || PKA_CONSTANTS.REAL_ENDPOINT;
    const auth = PKAAuth.getAuthHeader();

    if (!currentPayload && auth) {
      const studentId = PKAAuth.extractStudentIdFromJwt(auth);
      if (studentId) {
        const { mon, sun } = PKASchedule.getWeekRange();
        currentPayload = PKASchedule.createPayload(studentId, mon, sun);
        syncPayload();
      }
    }
  }

  function syncPayload() {
    PKAStorage.setLocalPayload(currentPayload);
    PKAStorage.setLocalEndpoint(activeEndpoint);

    window.postMessage({
      type: "PKA_PAYLOAD_CAPTURED",
      payload: currentPayload,
      endpoint: activeEndpoint,
      auth: PKAAuth.getAuthHeader(),
      key: currentKey
    }, "*");

    onPayloadCaptured(currentPayload);
  }

  // HOOK XMLHTTPREQUEST
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

  XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    if (!this._headers) this._headers = {};
    this._headers[header.toLowerCase()] = value;
    if (header.toLowerCase() === "authorization") {
      PKAAuth.setAuthHeader(value);
    }
    return originalSetRequestHeader.apply(this, arguments);
  };

  XMLHttpRequest.prototype.open = function (method, url) {
    this._reqUrl = url;
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    const xhr = this;
    const url = xhr._reqUrl || "";
    if (xhr._headers && xhr._headers["authorization"]) {
      PKAAuth.setAuthHeader(xhr._headers["authorization"]);
    }

    const cipherA = PKACrypto.extractCipherA(body);
    if (cipherA) {
      const res = PKACrypto.tryDecryptScheduleJson(cipherA);
      if (res) {
        currentPayload = res.obj;
        currentKey = res.key;
        activeEndpoint = url.startsWith("http") ? url : PKA_CONSTANTS.REAL_ENDPOINT;
        syncPayload();
      }

      xhr.addEventListener("load", function () {
        const cipherB = PKACrypto.extractCipherB(this.responseText);
        const dec = PKACrypto.decryptAD(cipherB, PKA_CONSTANTS.DECRYPT_KEY) || PKACrypto.decryptAD(cipherB, currentKey);
        if (dec) {
          try {
            const list = JSON.parse(dec);
            if (Array.isArray(list)) {
              lastDecryptedList = list;
              renderClasses(list);
            }
          } catch (e) {}
        }
      });
    }
    return originalSend.apply(this, arguments);
  };

  // HOOK FETCH
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    try {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
      const opts = args[1] || {};
      if (opts.headers) {
        const h = new Headers(opts.headers);
        if (h.has("authorization")) PKAAuth.setAuthHeader(h.get("authorization"));
      }
      const cipherA = PKACrypto.extractCipherA(opts.body);
      if (cipherA) {
        const res = PKACrypto.tryDecryptScheduleJson(cipherA);
        if (res) {
          currentPayload = res.obj;
          currentKey = res.key;
          activeEndpoint = url.startsWith("http") ? url : PKA_CONSTANTS.REAL_ENDPOINT;
          syncPayload();
        }

        const clone = response.clone();
        clone.text().then((resText) => {
          const cipherB = PKACrypto.extractCipherB(resText);
          const dec = PKACrypto.decryptAD(cipherB, PKA_CONSTANTS.DECRYPT_KEY) || PKACrypto.decryptAD(cipherB, currentKey);
          if (dec) {
            try {
              const list = JSON.parse(dec);
              if (Array.isArray(list)) {
                lastDecryptedList = list;
                renderClasses(list);
              }
            } catch (e) {}
          }
        });
      }
    } catch (e) {}
    return response;
  };

  // GIAO DIỆN WIDGET
  function injectWidgetUI() {
    if (document.getElementById("pka-widget-root")) return;

    const root = document.createElement("div");
    root.id = "pka-widget-root";
    PKATheme.applyTheme(PKATheme.getTheme(), root);

    root.innerHTML = `
      <div id="pka-dock-btn" title="Mở bảng điều khiển lịch học">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>

      <div id="pka-panel">
        <div id="pka-panel-head">
          <div class="w-brand-box">
            <div class="w-brand-mark">Z</div>
            <span class="w-brand-title">Schedule Dispatcher</span>
          </div>
          <div class="w-head-actions">
            <span id="wBadge">Live Ready</span>
            <button id="wThemeToggle" class="w-btn-icon" title="Đổi giao diện Sáng / Tối">
              <svg id="wIconSun" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <svg id="wIconMoon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
            <button id="wCloseBtn" class="w-btn-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div id="pka-panel-main">
          <div class="w-date-grid">
            <div>
              <label class="w-field-label">Từ ngày</label>
              <div class="w-date-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input type="date" id="wStart" class="w-date-input" />
              </div>
            </div>
            <div>
              <label class="w-field-label">Đến ngày</label>
              <div class="w-date-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input type="date" id="wEnd" class="w-date-input" />
              </div>
            </div>
          </div>

          <div class="w-chips">
            <span class="w-chip active" id="wChipThisWeek">Tuần này</span>
            <span class="w-chip" id="wChipNextWeek">Tuần sau</span>
            <span class="w-chip" id="wChipPrevWeek">Tuần trước</span>
            <span class="w-chip" id="wChipToday">Hôm nay</span>
          </div>

          <button id="wExecuteBtn" class="w-btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            <span id="wExecuteBtnText">Truy Vấn Lịch Học</span>
          </button>

          <div id="wResults">
            <div style="text-align:center; color:var(--w-muted); font-size:12px; padding:20px 0;">
              Chọn ngày và nhấn nút để tải danh sách lịch học
            </div>
          </div>

          <div class="w-footer">
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="${PKA_CONSTANTS.AUTHOR.WEBSITE}" target="_blank" rel="noreferrer">ziet.dev</a>
              <span>·</span>
              <a href="${PKA_CONSTANTS.AUTHOR.MESSENGER}" target="_blank" rel="noreferrer" class="w-report-bug">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Báo lỗi qua Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    const dockBtn = document.getElementById("pka-dock-btn");
    const panel = document.getElementById("pka-panel");
    const closeBtn = document.getElementById("wCloseBtn");
    const themeBtn = document.getElementById("wThemeToggle");
    const sunIcon = document.getElementById("wIconSun");
    const moonIcon = document.getElementById("wIconMoon");

    function updateThemeIcons(theme) {
      sunIcon.style.display = theme === "light" ? "block" : "none";
      moonIcon.style.display = theme === "dark" ? "block" : "none";
    }
    updateThemeIcons(PKATheme.getTheme());

    themeBtn.onclick = () => {
      const newTheme = PKATheme.toggleTheme(root);
      updateThemeIcons(newTheme);
    };

    function togglePanel() {
      panel.style.display = panel.style.display === "flex" ? "none" : "flex";
    }

    dockBtn.onclick = togglePanel;
    closeBtn.onclick = () => (panel.style.display = "none");

    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === "TOGGLE_PKA_PANEL") togglePanel();
    });

    initDefaultDates();
    setupEvents();
    makeDraggable(panel, document.getElementById("pka-panel-head"));

    if (currentPayload) onPayloadCaptured(currentPayload);
  }

  function initDefaultDates() {
    const { mon, sun } = PKASchedule.getWeekRange();
    const s = document.getElementById("wStart");
    const e = document.getElementById("wEnd");
    if (s) s.value = PKASchedule.toISO(mon);
    if (e) e.value = PKASchedule.toISO(sun);
  }

  function onPayloadCaptured(payload) {
    const badge = document.getElementById("wBadge");
    const btn = document.getElementById("wExecuteBtn");
    if (badge) {
      badge.textContent = "Live Synced";
      badge.classList.add("synced");
    }
    if (btn) btn.disabled = false;

    if (payload.strNgayBatDau && payload.strNgayKetThuc) {
      function parseVN(str) {
        const [d, m, y] = str.split("/");
        return new Date(`${y}-${m}-${d}`);
      }
      const s = document.getElementById("wStart");
      const e = document.getElementById("wEnd");
      if (s) s.value = PKASchedule.toISO(parseVN(payload.strNgayBatDau));
      if (e) e.value = PKASchedule.toISO(parseVN(payload.strNgayKetThuc));
    }
  }

  function setupEvents() {
    const sInp = document.getElementById("wStart");
    const eInp = document.getElementById("wEnd");
    const chips = [
      document.getElementById("wChipThisWeek"),
      document.getElementById("wChipNextWeek"),
      document.getElementById("wChipPrevWeek"),
      document.getElementById("wChipToday")
    ];

    function setActiveChip(el) {
      chips.forEach((c) => c?.classList.remove("active"));
      if (el) el.classList.add("active");
    }

    function setDateValues(s, e, activeChip) {
      sInp.value = PKASchedule.toISO(s);
      eInp.value = PKASchedule.toISO(e);
      if (currentPayload) {
        currentPayload.strNgayBatDau = PKASchedule.toVN(s);
        currentPayload.strNgayKetThuc = PKASchedule.toVN(e);
      }
      setActiveChip(activeChip);
    }

    sInp.onchange = () => {
      if (currentPayload) currentPayload.strNgayBatDau = PKASchedule.toVN(new Date(sInp.value));
      setActiveChip(null);
    };
    eInp.onchange = () => {
      if (currentPayload) currentPayload.strNgayKetThuc = PKASchedule.toVN(new Date(eInp.value));
      setActiveChip(null);
    };

    document.getElementById("wChipThisWeek").onclick = (e) => {
      const { mon, sun } = PKASchedule.getWeekRange();
      setDateValues(mon, sun, e.currentTarget);
    };
    document.getElementById("wChipNextWeek").onclick = (e) => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const { mon, sun } = PKASchedule.getWeekRange(d);
      setDateValues(mon, sun, e.currentTarget);
    };
    document.getElementById("wChipPrevWeek").onclick = (e) => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const { mon, sun } = PKASchedule.getWeekRange(d);
      setDateValues(mon, sun, e.currentTarget);
    };
    document.getElementById("wChipToday").onclick = (e) => {
      const d = new Date();
      setDateValues(d, d, e.currentTarget);
    };

    document.getElementById("wExecuteBtn").onclick = async () => {
      if (!currentPayload) {
        alert("Chưa kết nối được với phiên Phenikaa. Hãy thử tải lại trang!");
        return;
      }

      const btn = document.getElementById("wExecuteBtn");
      const resBox = document.getElementById("wResults");
      btn.disabled = true;
      btn.innerHTML = `<span>Đang tải dữ liệu...</span>`;
      resBox.innerHTML = `<div style="text-align:center; color:var(--w-muted); font-size:12px; padding:20px 0;">Đang gửi request & giải mã...</div>`;

      try {
        currentPayload.strNgayBatDau = PKASchedule.toVN(new Date(sInp.value));
        currentPayload.strNgayKetThuc = PKASchedule.toVN(new Date(eInp.value));

        const { list } = await PKASchedule.fetchSchedule({
          payload: currentPayload,
          endpoint: activeEndpoint,
          key: currentKey
        });

        lastDecryptedList = list;
        renderClasses(list);
      } catch (err) {
        resBox.innerHTML = `<div style="text-align:center; color:#f87171; font-size:12px; padding:20px 0;">Lỗi: ${err.message}</div>`;
      } finally {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <span id="wExecuteBtnText">Truy Vấn Lịch Học</span>
        `;
      }
    };
  }

  function renderClasses(list) {
    const resBox = document.getElementById("wResults");
    const headBar = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="font-size:10px; font-weight:750; text-transform:uppercase; letter-spacing:0.08em; color:var(--w-muted);">Thời khóa biểu (${list.length} lớp)</span>
        <div style="display:flex; gap:6px;">
          <button id="wExportIcs" style="background:var(--w-surface); border:1px solid var(--w-border); color:var(--w-muted); font-size:11px; padding:3px 9px; border-radius:9999px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Xuất .ics</span>
          </button>
          <button id="wCopyBtn" style="background:var(--w-surface); border:1px solid var(--w-border); color:var(--w-muted); font-size:11px; padding:3px 9px; border-radius:9999px; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy JSON</span>
          </button>
        </div>
      </div>
    `;

    if (Array.isArray(list) && list.length > 0) {
      const itemsHtml = list.map((item) => {
        const tenHocPhan = item.TENHOCPHAN || item.TenMonHoc || item.TenHocPhan || "Môn học";
        const tenLop = item.DANGKY_LOPHOCPHAN_TEN || item.TENLOPHOCPHAN?.replace(/<br>/g, "") || "";
        const phong = item.PHONGHOC_TEN || item.TENPHONGHOC || item.Phong || "N/A";
        const thuHoc = item.THUHOC || item.NGAYHOC || item.NgayHoc || "";
        const tiet = (item.TIETBATDAU && item.TIETKETTHUC) ? `Tiết ${item.TIETBATDAU} - ${item.TIETKETTHUC}` : (item.TietHoc || "N/A");
        const gio = (item.GIOBATDAU !== undefined && item.GIOKETTHUC !== undefined)
          ? `${String(item.GIOBATDAU).padStart(2, "0")}:${String(item.PHUTBATDAU || 0).padStart(2, "0")} - ${String(item.GIOKETTHUC).padStart(2, "0")}:${String(item.PHUTKETTHUC || 0).padStart(2, "0")}`
          : "";
        const gv = item.GIANGVIEN || item.TenGiangVien || "Chưa cập nhật";
        const hinhThuc = item.THUOCTINH_TEN || "";
        const color = PKAIcs.getSubjectColor(tenHocPhan);

        return `
          <div class="w-card-item" style="border-left-color: ${color.hex};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
              <div class="w-card-name">${tenHocPhan}</div>
              <span style="width:8px; height:8px; border-radius:50%; background:${color.hex}; flex-shrink:0; margin-top:4px;" title="Màu lịch: ${color.name}"></span>
            </div>
            ${tenLop ? `<div class="w-card-sub">${tenLop} ${hinhThuc ? `· <span class="gold">${hinhThuc}</span>` : ""}</div>` : ""}
            <div class="w-card-details">
              <div>Thời gian: <strong>${thuHoc}</strong> · <span class="gold">${tiet}</span> ${gio ? `(${gio})` : ""}</div>
              <div>Địa điểm: <strong>${phong}</strong> · GV: ${gv}</div>
            </div>
          </div>
        `;
      }).join("");

      resBox.innerHTML = headBar + itemsHtml;

      const expBtn = document.getElementById("wExportIcs");
      if (expBtn) {
        expBtn.onclick = () => {
          PKAIcs.downloadIcsFile(list, `LichHoc_Phenikaa_${document.getElementById("wStart").value}_${document.getElementById("wEnd").value}.ics`);
        };
      }
    } else {
      resBox.innerHTML = headBar + `<pre style="background:var(--w-surface); border:1px solid var(--w-border); padding:10px; border-radius:10px; font-size:10.5px; color:var(--w-accent); max-height:180px; overflow:auto; white-space:pre-wrap; word-break:break-all; margin:0;">${JSON.stringify(list, null, 2)}</pre>`;
    }

    const copyBtn = document.getElementById("wCopyBtn");
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(JSON.stringify(list, null, 2));
        copyBtn.innerHTML = `<span>Đã chép</span>`;
        setTimeout(() => { copyBtn.innerHTML = `<span>Copy JSON</span>`; }, 1500);
      };
    }
  }

  function makeDraggable(el, handle) {
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    handle.onmousedown = (e) => {
      e.preventDefault();
      p3 = e.clientX;
      p4 = e.clientY;
      document.onmouseup = () => {
        document.onmouseup = null;
        document.onmousemove = null;
      };
      document.onmousemove = (e) => {
        e.preventDefault();
        p1 = p3 - e.clientX;
        p2 = p4 - e.clientY;
        p3 = e.clientX;
        p4 = e.clientY;
        el.style.top = (el.offsetTop - p2) + "px";
        el.style.left = (el.offsetLeft - p1) + "px";
        el.style.bottom = "auto";
      };
    };
  }

  initSession();
  if (document.body) injectWidgetUI();
  else document.addEventListener("DOMContentLoaded", injectWidgetUI);
})();
