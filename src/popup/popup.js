document.addEventListener("DOMContentLoaded", async () => {
  const htmlRoot = document.documentElement;
  const popStart = document.getElementById("popStart");
  const popEnd = document.getElementById("popEnd");
  const btnFetch = document.getElementById("btnFetch");
  const resultsBox = document.getElementById("resultsBox");
  const resultsTitle = document.getElementById("resultsTitle");
  const btnCopyJson = document.getElementById("btnCopyJson");
  const btnExportIcs = document.getElementById("btnExportIcs");
  const btnToggleWidget = document.getElementById("btnToggleWidget");
  const btnThemeToggle = document.getElementById("btnThemeToggle");
  const iconSun = document.getElementById("iconSun");
  const iconMoon = document.getElementById("iconMoon");
  const statusBadge = document.querySelector(".tag-status");

  let basePayload = null;
  let activeEndpoint = PKA_CONSTANTS.REAL_ENDPOINT;
  let activeKey = PKA_CONSTANTS.CANDIDATE_KEYS[0];
  let lastDecryptedList = [];

  // 0. TAB SWITCHER (LẤY LỊCH & AUTO KHẢO SÁT)
  const tabSchedule = document.getElementById("tabSchedule");
  const tabSurvey = document.getElementById("tabSurvey");
  const sectionSchedule = document.getElementById("sectionSchedule");
  const sectionSurvey = document.getElementById("sectionSurvey");

  function switchTab(tabName) {
    if (tabName === "schedule") {
      tabSchedule.classList.add("active");
      tabSurvey.classList.remove("active");
      sectionSchedule.style.display = "flex";
      sectionSurvey.style.display = "none";
    } else {
      tabSurvey.classList.add("active");
      tabSchedule.classList.remove("active");
      sectionSurvey.style.display = "flex";
      sectionSchedule.style.display = "none";
      checkSurveyPageStatus();
    }
  }

  tabSchedule.onclick = () => switchTab("schedule");
  tabSurvey.onclick = () => switchTab("survey");

  // 1. THEME MANAGEMENT
  function updateThemeIcons(theme) {
    iconSun.style.display = theme === "light" ? "block" : "none";
    iconMoon.style.display = theme === "dark" ? "block" : "none";
  }

  const currentTheme = PKATheme.getTheme();
  PKATheme.applyTheme(currentTheme, htmlRoot);
  updateThemeIcons(currentTheme);

  btnThemeToggle.onclick = () => {
    const newTheme = PKATheme.toggleTheme(htmlRoot);
    updateThemeIcons(newTheme);
  };

  // 2. CHIPS TUẦN
  const chips = [
    document.getElementById("chipThisWeek"),
    document.getElementById("chipNextWeek"),
    document.getElementById("chipPrevWeek"),
    document.getElementById("chipToday")
  ];

  function setActiveChip(target) {
    chips.forEach((c) => c?.classList.remove("active"));
    if (target) target.classList.add("active");
  }

  function setDates(s, e, activeElement) {
    popStart.value = PKASchedule.toISO(s);
    popEnd.value = PKASchedule.toISO(e);
    setActiveChip(activeElement);
  }

  const { mon, sun } = PKASchedule.getWeekRange();
  setDates(mon, sun, document.getElementById("chipThisWeek"));

  popStart.onchange = () => setActiveChip(null);
  popEnd.onchange = () => setActiveChip(null);

  document.getElementById("chipThisWeek").onclick = (e) => {
    const { mon, sun } = PKASchedule.getWeekRange();
    setDates(mon, sun, e.currentTarget);
  };
  document.getElementById("chipNextWeek").onclick = (e) => {
    const next = new Date();
    next.setDate(next.getDate() + 7);
    const { mon, sun } = PKASchedule.getWeekRange(next);
    setDates(mon, sun, e.currentTarget);
  };
  document.getElementById("chipPrevWeek").onclick = (e) => {
    const prev = new Date();
    prev.setDate(prev.getDate() - 7);
    const { mon, sun } = PKASchedule.getWeekRange(prev);
    setDates(mon, sun, e.currentTarget);
  };
  document.getElementById("chipToday").onclick = (e) => {
    const t = new Date();
    setDates(t, t, e.currentTarget);
  };

  function applyPayload(payload, endpoint, key) {
    basePayload = payload;
    activeEndpoint = endpoint || PKA_CONSTANTS.REAL_ENDPOINT;
    if (key) activeKey = key;

    btnFetch.disabled = false;
    if (statusBadge) {
      statusBadge.textContent = "Live Synced";
      statusBadge.classList.add("synced");
    }
    resultsBox.innerHTML = `
      <div class="empty-state" style="color:var(--accent);">
        Đã sẵn sàng phiên đăng nhập!<br>
        Bấm <strong>Truy Vấn Lịch Học</strong> để tải thời khóa biểu.
      </div>
    `;
  }

  // 3. ĐỒNG BỘ TỪ STORAGE
  const storageData = await PKAStorage.getChromeStorage();
  if (storageData.pka_live_payload) {
    applyPayload(storageData.pka_live_payload, storageData.pka_endpoint, storageData.pka_key);
  }

  // 4. QUÉT TRỰC TIẾP TAB NẾU STORAGE CHƯA CÓ
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id && tab.url && tab.url.includes("phenikaa-uni.edu.vn")) {
      const execRes = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          let payload = null;
          let auth = localStorage.getItem("pka_cached_auth");
          try {
            payload = JSON.parse(localStorage.getItem("pka_cached_payload"));
          } catch (e) {}

          if (!auth) {
            for (const st of [sessionStorage, localStorage]) {
              for (let i = 0; i < st.length; i++) {
                const val = st.getItem(st.key(i));
                if (typeof val === "string") {
                  if (val.startsWith("Bearer eyJ")) auth = val;
                  else if (val.startsWith("eyJ") && val.split(".").length === 3) auth = "Bearer " + val;
                }
              }
            }
          }

          if (!payload && auth) {
            try {
              const rawJwt = auth.replace(/^Bearer\s+/i, "");
              const jwtData = JSON.parse(atob(rawJwt.split(".")[1]));
              if (jwtData.unique_name) {
                const studentId = jwtData.unique_name.split(";")[0];
                payload = {
                  action: "SV_ThongTin_MH/DSA4BRINKCIpAiAPKSAv",
                  func: "pkg_congthongtin_hssv_thongtin.LayDSLichCaNhan",
                  iM: "AzzSystem",
                  strQLSV_NguoiHoc_Id: studentId,
                  strNgayBatDau: "01/09/2026",
                  strNgayKetThuc: "07/09/2026",
                  strChucNang_Id: "B46109CD333D4E3DAC50D43E8607ED46",
                  strNguoiThucHien_Id: studentId
                };
              }
            } catch (e) {}
          }
          return { payload, auth };
        }
      });

      if (execRes && execRes[0]?.result) {
        const { payload, auth } = execRes[0].result;
        if (auth) PKAAuth.setAuthHeader(auth);
        if (payload) applyPayload(payload, PKA_CONSTANTS.REAL_ENDPOINT, PKA_CONSTANTS.CANDIDATE_KEYS[0]);
      }
    }
  } catch (err) {}

  // 5. TRUY VẤN LỊCH HỌC
  btnFetch.onclick = async () => {
    if (!basePayload) {
      alert("Chưa kết nối được với phiên Phenikaa. Vui lòng mở portal trước!");
      return;
    }

    const sDate = new Date(popStart.value);
    const eDate = new Date(popEnd.value);

    basePayload.strNgayBatDau = PKASchedule.toVN(sDate);
    basePayload.strNgayKetThuc = PKASchedule.toVN(eDate);

    btnFetch.disabled = true;
    btnFetch.innerHTML = `<span>Đang tải dữ liệu...</span>`;
    resultsBox.innerHTML = `<div class="empty-state">Đang gửi request & giải mã...</div>`;
    btnCopyJson.style.display = "none";
    btnExportIcs.style.display = "none";

    try {
      const { list } = await PKASchedule.fetchSchedule({
        payload: basePayload,
        endpoint: activeEndpoint,
        key: activeKey
      });

      lastDecryptedList = list;
      renderResults(list);
      btnCopyJson.style.display = "inline-flex";

      if (Array.isArray(list) && list.length > 0) {
        btnExportIcs.style.display = "inline-flex";
      }
    } catch (err) {
      resultsBox.innerHTML = `<div class="empty-state" style="color:#f87171;">Lỗi: ${err.message}</div>`;
    } finally {
      btnFetch.disabled = false;
      btnFetch.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        <span>Truy Vấn Lịch Học</span>
      `;
    }
  };

  // 6. XUẤT ICS
  btnExportIcs.onclick = () => {
    if (!lastDecryptedList || lastDecryptedList.length === 0) return;
    PKAIcs.downloadIcsFile(
      lastDecryptedList,
      `LichHoc_Phenikaa_${popStart.value}_${popEnd.value}.ics`
    );

    btnExportIcs.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span style="color:#4ade80;">Đã xuất .ics</span>
    `;
    setTimeout(() => {
      btnExportIcs.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Xuất .ics</span>
      `;
    }, 2000);
  };

  // 7. COPY JSON
  btnCopyJson.onclick = () => {
    if (!lastDecryptedList) return;
    navigator.clipboard.writeText(JSON.stringify(lastDecryptedList, null, 2));
    btnCopyJson.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span style="color:var(--accent);">Đã chép</span>
    `;
    setTimeout(() => {
      btnCopyJson.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy JSON</span>
      `;
    }, 1500);
  };

  function renderResults(list) {
    if (Array.isArray(list) && list.length > 0) {
      resultsTitle.textContent = `Thời khóa biểu (${list.length} lớp)`;
      resultsBox.innerHTML = list.map((item) => {
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
          <div class="card-item" style="border-left-color: ${color.hex};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
              <div class="card-name">${tenHocPhan}</div>
              <span style="width:8px; height:8px; border-radius:50%; background:${color.hex}; flex-shrink:0; margin-top:4px;" title="Màu lịch: ${color.name}"></span>
            </div>
            ${tenLop ? `<div class="card-sub">${tenLop} ${hinhThuc ? `· <span class="gold">${hinhThuc}</span>` : ""}</div>` : ""}
            <div class="card-details">
              <div>Thời gian: <strong>${thuHoc}</strong> · <span class="gold">${tiet}</span> ${gio ? `(${gio})` : ""}</div>
              <div>Địa điểm: <strong>${phong}</strong> · GV: ${gv}</div>
            </div>
          </div>
        `;
      }).join("");
    } else {
      resultsTitle.textContent = "Thời khóa biểu (0 lớp)";
      resultsBox.innerHTML = `<pre style="background:var(--surface); border:1px solid var(--border); padding:10px; border-radius:10px; color:var(--accent); font-size:10.5px; max-height:220px; overflow:auto; white-space:pre-wrap; word-break:break-all; margin:0;">${JSON.stringify(list, null, 2)}</pre>`;
    }
  }

  btnToggleWidget.onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_PKA_WIDGET" });
    }
  };

  // 8. AUTO TICK KHẢO SÁT LOGIC
  let selectedRatingMode = "agree";
  const chipAgree = document.getElementById("chipRatingAgree");
  const chipStrong = document.getElementById("chipRatingStrong");
  const chipRandom = document.getElementById("chipRatingRandom");
  const ratingChips = [
    { el: chipAgree, mode: "agree" },
    { el: chipStrong, mode: "strongly_agree" },
    { el: chipRandom, mode: "random" }
  ];

  ratingChips.forEach((item) => {
    if (item.el) {
      item.el.onclick = () => {
        ratingChips.forEach((c) => c.el?.classList.remove("active"));
        item.el.classList.add("active");
        selectedRatingMode = item.mode;
      };
    }
  });

  const btnSurveyCurrent = document.getElementById("btnSurveyCurrent");
  const btnSurveyAll = document.getElementById("btnSurveyAll");
  const btnSurveyAllText = document.getElementById("btnSurveyAllText");
  const surveyBadge = document.getElementById("surveyBadge");
  const surveyStatusMsg = document.getElementById("surveyStatusMsg");
  const surveyProgressWrap = document.getElementById("surveyProgressWrap");
  const surveyProgressBar = document.getElementById("surveyProgressBar");
  const surveyFeedback = document.getElementById("surveyFeedback");
  const surveySuggestion = document.getElementById("surveySuggestion");

  async function checkSurveyPageStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url || !tab.url.includes("phenikaa-uni.edu.vn")) {
        surveyBadge.textContent = "Ngoài Portal";
        surveyBadge.className = "survey-mini-badge";
        surveyStatusMsg.textContent = "Hãy mở trang portal sinh viên Phenikaa để sử dụng.";
        btnSurveyCurrent.disabled = true;
        btnSurveyAll.disabled = true;
        return;
      }

      if (!tab.url.includes("thuchienkhaosat.aspx")) {
        surveyBadge.textContent = "Chưa vào khảo sát";
        surveyBadge.className = "survey-mini-badge";
        surveyStatusMsg.innerHTML = "Bạn đang ở trang khác. Hãy vào mục <strong>Khảo sát ý kiến</strong> trên portal để sử dụng.";
        btnSurveyCurrent.disabled = true;
        btnSurveyAll.disabled = true;
        return;
      }

      // Đang ở trang khảo sát: Lấy số lượng phiếu
      const res = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        func: () => {
          if (typeof PKASurvey !== "undefined") {
            return {
              isSurvey: PKASurvey.isSurveyPage(),
              stats: PKASurvey.getSurveyStats(),
              isRunning: PKASurvey.isRunning()
            };
          }
          return null;
        }
      });

      if (res && res[0]?.result) {
        const { stats, isRunning } = res[0].result;
        btnSurveyCurrent.disabled = false;
        btnSurveyAll.disabled = false;

        if (isRunning) {
          surveyBadge.textContent = "Đang chạy...";
          surveyBadge.className = "survey-mini-badge running";
          btnSurveyAllText.textContent = "Dừng Lại (Stop)";
          surveyProgressWrap.style.display = "block";
        } else if (stats && stats.total > 0) {
          surveyBadge.textContent = `${stats.completed}/${stats.total} Đã xong`;
          surveyBadge.className = "survey-mini-badge " + (stats.pending === 0 ? "success" : "");
          btnSurveyAllText.textContent = stats.pending > 0 ? `Auto Toàn Bộ (${stats.pending} phiếu)` : "Auto Toàn Bộ Phiếu";
          surveyStatusMsg.textContent = stats.pending === 0
            ? "Tất cả phiếu khảo sát đều đã hoàn thành!"
            : `Tìm thấy ${stats.total} phiếu (${stats.pending} phiếu chưa hoàn thành). Sẵn sàng auto tick!`;
        } else {
          surveyBadge.textContent = "Sẵn sàng";
          surveyBadge.className = "survey-mini-badge";
          surveyStatusMsg.textContent = "Đã kết nối trang khảo sát. Bấm nút bên dưới để thực hiện.";
        }
      }
    } catch (e) {
      console.warn("Survey status check error:", e);
    }
  }

  // Tự động chuyển sang tab khảo sát nếu tab hiện tại là trang khảo sát
  chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (tab && tab.url && tab.url.includes("thuchienkhaosat.aspx")) {
      switchTab("survey");
    }
  });

  // Xử lý nút Auto Tick phiếu hiện tại
  btnSurveyCurrent.onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    btnSurveyCurrent.disabled = true;
    surveyBadge.textContent = "Đang tick...";
    surveyBadge.className = "survey-mini-badge running";

    const options = {
      ratingMode: selectedRatingMode,
      feedbackText: surveyFeedback.value.trim() || "Nội dung bài giảng rõ ràng, giảng dạy tốt.",
      suggestionText: surveySuggestion.value.trim() || "Không có đề xuất gì thêm."
    };

    try {
      const execRes = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        func: (opts) => {
          if (typeof PKASurvey !== "undefined") {
            return PKASurvey.tickCurrent(opts);
          }
          return { success: false, message: "Chưa nạp được module PKASurvey trên trang." };
        },
        args: [options]
      });

      const result = execRes && execRes[0]?.result;
      if (result?.success) {
        surveyBadge.textContent = "Thành công";
        surveyBadge.className = "survey-mini-badge success";
        surveyStatusMsg.textContent = result.message;
      } else {
        surveyBadge.textContent = "Lỗi";
        surveyBadge.className = "survey-mini-badge";
        surveyStatusMsg.textContent = result?.message || "Không thể tick phiếu này. Hãy đảm bảo phiếu đang mở!";
      }
    } catch (err) {
      surveyStatusMsg.textContent = `Lỗi: ${err.message}`;
    } finally {
      btnSurveyCurrent.disabled = false;
    }
  };

  // Xử lý nút Auto toàn bộ phiếu
  btnSurveyAll.onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    // Kiểm tra nếu đang chạy thì chuyển thành nút Dừng lại
    const statusRes = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: () => typeof PKASurvey !== "undefined" && PKASurvey.isRunning()
    });

    if (statusRes && statusRes[0]?.result) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        func: () => {
          if (typeof PKASurvey !== "undefined") PKASurvey.stopAll();
        }
      });
      btnSurveyAllText.textContent = "Auto Toàn Bộ Phiếu";
      surveyBadge.textContent = "Đã dừng";
      surveyBadge.className = "survey-mini-badge";
      surveyStatusMsg.textContent = "Đã gửi yêu cầu dừng tiến trình tự động.";
      return;
    }

    const options = {
      ratingMode: selectedRatingMode,
      feedbackText: surveyFeedback.value.trim() || "Nội dung bài giảng rõ ràng, giảng dạy tốt.",
      suggestionText: surveySuggestion.value.trim() || "Không có đề xuất gì thêm."
    };

    surveyProgressWrap.style.display = "block";
    surveyProgressBar.style.width = "0%";
    surveyBadge.textContent = "Đang chạy...";
    surveyBadge.className = "survey-mini-badge running";
    btnSurveyAllText.textContent = "Dừng Lại (Stop)";

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: (opts) => {
        if (typeof PKASurvey !== "undefined") {
          PKASurvey.runAll(opts, (progress) => {
            window.postMessage({ type: "PKA_SURVEY_PROGRESS", progress }, "*");
          });
        }
      },
      args: [options]
    });
  };

  // Nhận thông báo tiến trình từ trang web
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "SURVEY_PROGRESS_UPDATE" && msg.progress) {
      const p = msg.progress;
      if (p.total && p.current) {
        const pct = Math.round((p.current / p.total) * 100);
        surveyProgressBar.style.width = `${pct}%`;
      }
      if (p.message) surveyStatusMsg.textContent = p.message;
      if (p.stage === "finished") {
        surveyBadge.textContent = "Hoàn tất";
        surveyBadge.className = "survey-mini-badge success";
        btnSurveyAllText.textContent = "Auto Toàn Bộ Phiếu";
        setTimeout(() => {
          surveyProgressWrap.style.display = "none";
          checkSurveyPageStatus();
        }, 3000);
      } else if (p.stage === "aborted") {
        surveyBadge.textContent = "Đã dừng";
        surveyBadge.className = "survey-mini-badge";
        btnSurveyAllText.textContent = "Auto Toàn Bộ Phiếu";
      }
    }
  });
});

