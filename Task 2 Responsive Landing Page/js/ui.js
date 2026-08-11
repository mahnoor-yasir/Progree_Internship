/* LAUNCHFLOW — ui.js : helpers, theme, nav, modals, forms, toasts */
window.LF = window.LF || {};
(function (LF) {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  LF.$ = $; LF.$$ = $$;
  LF.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- storage ---- */
  LF.store = {
    get: function (k, fb) {
      try { var v = localStorage.getItem("launchflow:" + k); return v === null ? fb : JSON.parse(v); }
      catch (e) { return fb; }
    },
    set: function (k, v) { try { localStorage.setItem("launchflow:" + k, JSON.stringify(v)); } catch (e) {} },
    remove: function (k) { try { localStorage.removeItem("launchflow:" + k); } catch (e) {} },
    clearAll: function () {
      try {
        Object.keys(localStorage)
          .filter(function (k) { return k.indexOf("launchflow:") === 0; })
          .forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) {}
    }
  };

  /* ---- tiny event bus ---- */
  var subs = {};
  LF.on = function (name, fn) { (subs[name] = subs[name] || []).push(fn); };
  LF.emit = function (name, data) { (subs[name] || []).forEach(function (fn) { fn(data); }); };

  /* ---- toast ---- */
  LF.toast = function (message, ok) {
    var stack = $("#toastStack");
    if (!stack) return;
    var el = document.createElement("p");
    el.className = "toast" + (ok === false ? "" : " toast--ok");
    el.textContent = message;
    stack.appendChild(el);
    window.setTimeout(function () { el.remove(); }, 3600);
  };

  /* ---- theme ---- */
  LF.applyTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = $("#themeToggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
    LF.store.set("theme", theme);
  };
  LF.toggleTheme = function () {
    LF.applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  };

  /* ---- modals ---- */
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  var lastFocused = null;

  LF.openModal = function (name) {
    var modal = document.getElementById("modal-" + name);
    if (!modal) return null;
    LF.closeMenu && LF.closeMenu();
    LF.closeAccountMenu && LF.closeAccountMenu();
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("is-locked");
    var first = $(FOCUSABLE, $(".modal__panel", modal));
    if (first) first.focus();
    LF.emit("modal:open", name);
    return modal;
  };
  LF.closeModal = function (modal) {
    if (!modal) return;
    modal.hidden = true;
    if (!$$(".modal:not([hidden])").length) document.body.classList.remove("is-locked");
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  };
  LF.closeAllModals = function () { $$(".modal:not([hidden])").forEach(LF.closeModal); };

  /* ---- form validation helpers ---- */
  LF.EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  LF.setError = function (input, message) {
    var box = document.getElementById("err-" + input.id);
    if (box) box.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  };

  LF.clearForm = function (form) {
    form.reset();
    $$("input, select, textarea", form).forEach(function (f) { LF.setError(f, ""); });
    $$(".form__alert, .form__success", form).forEach(function (a) { a.hidden = true; });
  };

  /**
   * Wire a form with a rules map: { inputId: function(value, form) { return "error" | ""; } }
   * onSubmit receives an object of trimmed values keyed by input id.
   */
  LF.wireForm = function (form, rules, onSubmit) {
    if (!form) return;
    var ids = Object.keys(rules);
    var get = function (id) { return document.getElementById(id); };
    var check = function (id) {
      var el = get(id);
      if (!el) return true;
      return LF.setError(el, rules[id](el.value.trim(), form) || "");
    };
    ids.forEach(function (id) {
      var el = get(id);
      if (!el) return;
      el.addEventListener("blur", function () { check(id); });
      el.addEventListener("input", function () {
        if (el.getAttribute("aria-invalid") === "true") check(id);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = ids.map(check).every(Boolean);
      if (!ok) {
        var bad = ids.map(get).find(function (el) { return el && el.getAttribute("aria-invalid") === "true"; });
        if (bad) bad.focus();
        return;
      }
      var values = {};
      ids.forEach(function (id) { var el = get(id); values[id] = el ? el.value.trim() : ""; });
      onSubmit(values, form);
    });
  };

  /* ---- global listeners: modals, scroll-to, demo links ---- */
  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open-modal]");
    if (opener) { e.preventDefault(); LF.closeAllModals(); LF.openModal(opener.getAttribute("data-open-modal")); return; }

    var closer = e.target.closest("[data-close-modal]");
    if (closer) { LF.closeModal(closer.closest(".modal")); return; }

    var demo = e.target.closest("[data-demo-link]");
    if (demo) {
      LF.toast(demo.getAttribute("data-demo-link") + " is not part of this landing-page demo.");
      return;
    }
  });

  document.addEventListener("keydown", function (e) {
    var open = $(".modal:not([hidden])");
    if (e.key === "Escape") {
      if (open) { LF.closeModal(open); return; }
      LF.closeAccountMenu && LF.closeAccountMenu();
      LF.closeMenu && LF.closeMenu();
      return;
    }
    if (e.key === "Tab" && open) {
      var items = $$(FOCUSABLE, $(".modal__panel", open)).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})(window.LF);
