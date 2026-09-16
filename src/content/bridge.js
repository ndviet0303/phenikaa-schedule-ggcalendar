// Bridge giữa web page (world: MAIN) và Chrome Extension Storage (world: ISOLATED)
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PKA_PAYLOAD_CAPTURED") {
    chrome.storage.local.set({
      pka_live_payload: event.data.payload,
      pka_endpoint: event.data.endpoint,
      pka_auth: event.data.auth,
      pka_key: event.data.key,
      pka_time: new Date().toLocaleTimeString()
    });
  } else if (event.data && event.data.type === "PKA_SURVEY_PROGRESS") {
    chrome.runtime.sendMessage({
      action: "SURVEY_PROGRESS_UPDATE",
      progress: event.data.progress
    }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "TOGGLE_PKA_WIDGET") {
    window.postMessage({ type: "TOGGLE_PKA_PANEL" }, "*");
    sendResponse({ ok: true });
  } else if (msg.action === "GET_PKA_STATE") {
    chrome.storage.local.get(["pka_live_payload", "pka_endpoint", "pka_auth", "pka_key"], (res) => {
      sendResponse(res);
    });
    return true;
  }
});
