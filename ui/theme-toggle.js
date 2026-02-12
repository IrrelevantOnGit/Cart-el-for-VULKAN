(function () {
    "use strict";

    var STORAGE_KEY = "theme";
    var root = document.documentElement;

    var sunIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4.93 4.93L6.34 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17.66 17.66L19.07 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M2 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4.93 19.07L6.34 17.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    var moonIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 13.2C20.31 13.49 19.56 13.65 18.77 13.65C15.58 13.65 13 11.07 13 7.88C13 6.66 13.38 5.53 14.03 4.6C13.39 4.42 12.72 4.32 12.03 4.32C7.6 4.32 4 7.92 4 12.35C4 16.78 7.6 20.38 12.03 20.38C16.13 20.38 19.5 17.31 19.97 13.34C20.31 13.31 20.65 13.26 21 13.2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

    function sanitizeTheme(theme) {
        return theme === "dark" ? "dark" : "light";
    }

    function getTheme() {
        return sanitizeTheme(localStorage.getItem(STORAGE_KEY) || "light");
    }

    function setTheme(theme) {
        var next = sanitizeTheme(theme);
        root.setAttribute("data-theme", next);
        localStorage.setItem(STORAGE_KEY, next);
        updateButtons(next);
    }

    function applySavedTheme() {
        setTheme(getTheme());
    }

    function ensureToggleNearProfile() {
        var profileContainers = document.querySelectorAll(".profile-dropdown");
        profileContainers.forEach(function (container) {
            var parent = container.parentElement;
            if (!parent) return;
            if (parent.querySelector(".theme-toggle")) return;

            var btn = document.createElement("button");
            btn.className = "theme-toggle";
            btn.id = "themeToggle";
            btn.type = "button";
            btn.setAttribute("aria-label", "Toggle theme");
            parent.insertBefore(btn, container);
        });
    }

    function updateButtons(theme) {
        var toggles = document.querySelectorAll(".theme-toggle");
        toggles.forEach(function (btn) {
            btn.innerHTML = theme === "dark" ? moonIcon : sunIcon;
            btn.setAttribute("title", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
            btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
            btn.dataset.themeState = theme;
        });
    }

    function bindEvents() {
        document.querySelectorAll(".theme-toggle").forEach(function (btn) {
            if (btn.dataset.themeBound === "1") return;
            btn.dataset.themeBound = "1";
            btn.addEventListener("click", function () {
                var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
                setTheme(current === "dark" ? "light" : "dark");
            });
        });
    }

    function init() {
        ensureToggleNearProfile();
        applySavedTheme();
        bindEvents();
    }

    window.CartelThemeToggle = {
        init: init,
        setTheme: setTheme,
        getTheme: getTheme
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
