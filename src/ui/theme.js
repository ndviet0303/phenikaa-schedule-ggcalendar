const PKATheme = (function () {
  function getTheme() {
    return (typeof PKAStorage !== "undefined" ? PKAStorage.getTheme() : "dark");
  }

  function applyTheme(theme, rootElement = document.documentElement) {
    rootElement.setAttribute("data-theme", theme);
    if (typeof PKAStorage !== "undefined") {
      PKAStorage.setTheme(theme);
    }
    return theme;
  }

  function toggleTheme(rootElement = document.documentElement) {
    const current = rootElement.getAttribute("data-theme") || getTheme();
    const next = current === "dark" ? "light" : "dark";
    return applyTheme(next, rootElement);
  }

  return {
    getTheme,
    applyTheme,
    toggleTheme
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PKATheme;
}
