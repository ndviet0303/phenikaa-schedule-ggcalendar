/**
 * PKASurvey - Dịch vụ tự động hóa khảo sát ý kiến sinh viên Phenikaa
 * (Aura Court Edition)
 */
const PKASurvey = (function () {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function isSurveyPage() {
    return !!(document.getElementById("tblNoiDung") || document.getElementById("tblDoiTuong"));
  }

  function getSurveyStats() {
    const items = Array.from(document.querySelectorAll("#tblDoiTuong .cmc-question-item"));
    let completed = 0;
    let pending = 0;

    items.forEach((item) => {
      const statusSpan = item.querySelector(".status");
      const text = statusSpan ? statusSpan.textContent.trim().toLowerCase() : "";
      if (text.includes("hoàn thành") && !text.includes("chưa")) {
        completed++;
      } else {
        pending++;
      }
    });

    return {
      total: items.length,
      completed,
      pending
    };
  }

  function tickCurrent(options = {}) {
    const {
      ratingMode = "agree", // "agree" ("Đồng ý"), "strongly_agree" ("Hoàn toàn đồng ý"), "random"
      feedbackText = "Nội dung bài giảng rõ ràng, giảng dạy tốt.",
      suggestionText = "Không có đề xuất gì thêm."
    } = options;

    const contentBox = document.getElementById("tblNoiDung");
    if (!contentBox) {
      return {
        success: false,
        message: "Không tìm thấy nội dung phiếu khảo sát (#tblNoiDung)!"
      };
    }

    const questionGroups = contentBox.querySelectorAll(".student-choose");
    if (questionGroups.length === 0) {
      return {
        success: false,
        message: "Không tìm thấy câu hỏi trắc nghiệm nào trên phiếu!"
      };
    }

    let countRadio = 0;
    questionGroups.forEach((group) => {
      let target = "Đồng ý";
      if (ratingMode === "strongly_agree") {
        target = "Hoàn toàn đồng ý";
      } else if (ratingMode === "random") {
        target = Math.random() < 0.8 ? "Hoàn toàn đồng ý" : "Đồng ý";
      }

      const labels = group.querySelectorAll(".form-check-label");
      let matched = false;

      labels.forEach((label) => {
        if (label.textContent.trim().toLowerCase() === target.toLowerCase()) {
          const radio =
            label.closest(".form-check")?.querySelector('input[type="radio"]') ||
            document.getElementById(label.getAttribute("for"));
          if (radio) {
            radio.checked = true;
            radio.click();
            radio.dispatchEvent(new Event("change", { bubbles: true }));
            countRadio++;
            matched = true;
          }
        }
      });

      // Dự phòng: Nếu không khớp text thì chọn option cuối cùng
      if (!matched && labels.length > 0) {
        const lastLabel = labels[labels.length - 1];
        const radio =
          lastLabel.closest(".form-check")?.querySelector('input[type="radio"]') ||
          document.getElementById(lastLabel.getAttribute("for"));
        if (radio) {
          radio.checked = true;
          radio.click();
          radio.dispatchEvent(new Event("change", { bubbles: true }));
          countRadio++;
        }
      }
    });

    // Điền ô nhận xét ý kiến khác nếu có
    const textInputs = contentBox.querySelectorAll('input[type="text"]');
    if (textInputs.length >= 1 && !textInputs[0].value.trim()) {
      textInputs[0].value = feedbackText;
      textInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      textInputs[0].dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (textInputs.length >= 2 && !textInputs[1].value.trim()) {
      textInputs[1].value = suggestionText;
      textInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      textInputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    }

    return {
      success: true,
      countRadio,
      totalQuestions: questionGroups.length,
      message: `Đã tick thành công ${countRadio}/${questionGroups.length} câu hỏi và điền nhận xét!`
    };
  }

  async function saveCurrentSurvey() {
    window.confirm = () => true;
    window.alert = () => true;

    const btnSave =
      document.getElementById("btnLuuKetQua") ||
      document.querySelector(".btnLuuKetQua");
    if (!btnSave) return false;

    btnSave.click();
    await sleep(800);

    const confirmBtn = document.querySelector(
      ".swal2-confirm, .bootbox-accept, .modal.show .btn-primary"
    );
    if (confirmBtn) confirmBtn.click();
    return true;
  }

  let isRunningAll = false;
  let shouldAbort = false;

  function stopAll() {
    shouldAbort = true;
  }

  async function runAll(options = {}, onProgress = () => {}) {
    if (isRunningAll) {
      return { success: false, message: "Đang có tiến trình chạy tự động!" };
    }

    isRunningAll = true;
    shouldAbort = false;

    try {
      window.confirm = () => true;
      window.alert = () => true;

      const items = Array.from(
        document.querySelectorAll("#tblDoiTuong .cmc-question-item")
      );
      if (items.length === 0) {
        return {
          success: false,
          message: "Không tìm thấy danh sách phiếu khảo sát (#tblDoiTuong)!"
        };
      }

      let totalToRun = 0;
      items.forEach((item) => {
        const status =
          item.querySelector(".status")?.textContent?.trim().toLowerCase() || "";
        if (!status.includes("hoàn thành") || status.includes("chưa")) {
          totalToRun++;
        }
      });

      if (totalToRun === 0) {
        onProgress({
          stage: "finished",
          current: 0,
          total: 0,
          message: "Tất cả phiếu khảo sát đều đã hoàn thành!"
        });
        return { success: true, completedCount: 0, message: "Tất cả phiếu đều đã hoàn thành!" };
      }

      let completedCount = 0;
      let currentStep = 0;

      for (let i = 0; i < items.length; i++) {
        if (shouldAbort) {
          onProgress({ stage: "aborted", message: "Đã dừng tiến trình tự động." });
          return { success: false, message: "Đã dừng tự động theo yêu cầu." };
        }

        const item = items[i];
        const statusSpan = item.querySelector(".status");
        const statusText = statusSpan ? statusSpan.textContent.trim().toLowerCase() : "";

        if (statusText.includes("hoàn thành") && !statusText.includes("chưa")) {
          continue;
        }

        currentStep++;
        const title = item.querySelector("p")?.textContent?.trim() || `Phiếu ${i + 1}`;
        onProgress({
          stage: "opening",
          current: currentStep,
          total: totalToRun,
          title,
          message: `Đang mở phiếu ${currentStep}/${totalToRun}: ${title.substring(0, 40)}...`
        });

        const link = item.querySelector("a") || item;
        link.click();
        await sleep(1300);

        if (shouldAbort) break;

        onProgress({
          stage: "ticking",
          current: currentStep,
          total: totalToRun,
          title,
          message: `Đang tick đánh giá phiếu ${currentStep}/${totalToRun}...`
        });

        tickCurrent(options);
        await sleep(600);

        if (shouldAbort) break;

        onProgress({
          stage: "saving",
          current: currentStep,
          total: totalToRun,
          title,
          message: `Đang lưu phiếu ${currentStep}/${totalToRun}...`
        });

        await saveCurrentSurvey();
        completedCount++;

        await sleep(1600);
      }

      onProgress({
        stage: "finished",
        current: completedCount,
        total: totalToRun,
        message: `Hoàn tất khảo sát! Đã tự động hoàn thành ${completedCount}/${totalToRun} phiếu.`
      });

      return {
        success: true,
        completedCount,
        message: `Hoàn thành tự động khảo sát ${completedCount}/${totalToRun} phiếu!`
      };
    } finally {
      isRunningAll = false;
      shouldAbort = false;
    }
  }

  return {
    isSurveyPage,
    getSurveyStats,
    tickCurrent,
    saveCurrentSurvey,
    runAll,
    stopAll,
    isRunning: () => isRunningAll
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PKASurvey;
}
