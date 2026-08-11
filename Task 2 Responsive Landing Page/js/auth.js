/* LAUNCHFLOW — auth.js : localStorage-only simulated authentication */
window.LF = window.LF || {};
(function (LF) {
  "use strict";
  var $ = LF.$;

  var Auth = {
    users: function () { return LF.store.get("users", []); },
    saveUsers: function (u) { LF.store.set("users", u); },
    session: function () { return LF.store.get("session", null); },
    current: function () {
      var s = Auth.session();
      if (!s) return null;
      return Auth.users().find(function (u) { return u.email === s; }) || null;
    },
    signup: function (name, email, password) {
      var users = Auth.users();
      email = email.toLowerCase();
      if (users.some(function (u) { return u.email === email; })) {
        return { ok: false, error: "An account with this email already exists. Try signing in instead." };
      }
      var user = {
        name: name, email: email, password: password,
        plan: "Free", billingCycle: "monthly", paymentMethod: null, createdAt: Date.now()
      };
      users.push(user);
      Auth.saveUsers(users);
      LF.store.set("session", email);
      LF.emit("auth:change", user);
      return { ok: true, user: user };
    },
    login: function (email, password) {
      var user = Auth.users().find(function (u) { return u.email === email.toLowerCase(); });
      if (!user || user.password !== password) {
        return { ok: false, error: "The email or password you entered is incorrect." };
      }
      LF.store.set("session", user.email);
      LF.emit("auth:change", user);
      return { ok: true, user: user };
    },
    logout: function () { LF.store.remove("session"); LF.emit("auth:change", null); },
    update: function (patch) {
      var users = Auth.users(), s = Auth.session();
      var i = users.findIndex(function (u) { return u.email === s; });
      if (i < 0) return null;
      Object.keys(patch).forEach(function (k) { users[i][k] = patch[k]; });
      Auth.saveUsers(users);
      LF.emit("auth:change", users[i]);
      return users[i];
    },
    firstName: function (user) { return user ? String(user.name).trim().split(/\s+/)[0] : ""; },
    initials: function (user) {
      if (!user) return "?";
      var p = String(user.name).trim().split(/\s+/);
      return ((p[0] || "")[0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
    }
  };
  LF.auth = Auth;

  /* ---------- UI sync ---------- */
  function renderAuthUI() {
    var user = Auth.current();
    var guest = $("#guestActions"), area = $("#accountArea"), navCta = $(".nav__cta");
    var navDash = $("#navDashboard"), dash = $("#dashboard");
    if (guest) guest.hidden = !!user;
    if (navCta) navCta.hidden = !!user;
    if (area) area.hidden = !user;
    if (navDash) navDash.hidden = !user;
    if (dash) dash.hidden = !user;
    if (!user) return;
    $("#accountInitial").textContent = Auth.initials(user);
    $("#accountNameShort").textContent = user.name;
    $("#menuName").textContent = user.name;
    $("#menuEmail").textContent = user.email;
    $("#menuPlan").textContent = user.plan + " plan";
    var fn = $("#dashFirstName");
    if (fn) fn.textContent = Auth.firstName(user);
    var st = $("#settingsEmail");
    if (st) st.textContent = user.email;
  }
  LF.renderAuthUI = renderAuthUI;
  LF.on("auth:change", renderAuthUI);

  /* ---------- account menu ---------- */
  LF.closeAccountMenu = function () {
    var m = $("#accountMenu"), b = $("#accountBtn");
    if (m && !m.hidden) { m.hidden = true; b.setAttribute("aria-expanded", "false"); }
  };

  LF.initAuth = function () {
    var btn = $("#accountBtn");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var m = $("#accountMenu");
      m.hidden = !m.hidden;
      btn.setAttribute("aria-expanded", String(!m.hidden));
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("#accountArea")) LF.closeAccountMenu();
    });

    document.addEventListener("click", function (e) {
      var item = e.target.closest("[data-account-action]");
      if (!item) return;
      var action = item.getAttribute("data-account-action");
      LF.closeAccountMenu();
      if (action === "logout") {
        Auth.logout();
        LF.toast("You have been signed out.");
        window.scrollTo({ top: 0, behavior: LF.reduceMotion ? "auto" : "smooth" });
        return;
      }
      if (action === "dashboard") {
        var d = document.getElementById("dashboard");
        if (d) d.scrollIntoView({ behavior: LF.reduceMotion ? "auto" : "smooth", block: "start" });
        return;
      }
      if (action === "plan") {
        var p = document.getElementById("pricing");
        if (p) p.scrollIntoView({ behavior: LF.reduceMotion ? "auto" : "smooth", block: "start" });
        return;
      }
      if (action === "account") { LF.renderAccountModal(); LF.openModal("account"); return; }
      if (action === "billing") { LF.renderBillingModal(); LF.openModal("billing"); return; }
      if (action === "settings") { LF.openModal("settings"); return; }
    });

    /* signup form */
    LF.wireForm($("#signupForm"), {
      "su-name": function (v) { return !v ? "Full name is required." : v.length < 2 ? "Please enter your full name." : ""; },
      "su-email": function (v) { return !v ? "Email is required." : !LF.EMAIL_RE.test(v) ? "Enter a valid email address." : ""; },
      "su-pass": function (v) {
        if (!v) return "Password is required.";
        if (v.length < 8) return "Use at least 8 characters.";
        if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return "Include at least one letter and one number.";
        return "";
      },
      "su-confirm": function (v) {
        if (!v) return "Please confirm your password.";
        return v !== $("#su-pass").value.trim() ? "Passwords do not match." : "";
      }
    }, function (values, form) {
      var alertBox = $("#signupAlert");
      var res = Auth.signup(values["su-name"], values["su-email"], values["su-pass"]);
      if (!res.ok) { alertBox.textContent = res.error; alertBox.hidden = false; return; }
      alertBox.hidden = true;
      LF.clearForm(form);
      LF.closeAllModals();
      LF.toast("Welcome to LaunchFlow, " + Auth.firstName(res.user) + ".");
      var d = document.getElementById("dashboard");
      if (d) window.setTimeout(function () { d.scrollIntoView({ behavior: LF.reduceMotion ? "auto" : "smooth", block: "start" }); }, 120);
    });

    /* login form */
    LF.wireForm($("#loginForm"), {
      "li-email": function (v) { return !v ? "Email is required." : !LF.EMAIL_RE.test(v) ? "Enter a valid email address." : ""; },
      "li-pass": function (v) { return !v ? "Password is required." : ""; }
    }, function (values, form) {
      var alertBox = $("#loginAlert");
      var res = Auth.login(values["li-email"], values["li-pass"]);
      if (!res.ok) { alertBox.textContent = res.error; alertBox.hidden = false; return; }
      alertBox.hidden = true;
      LF.clearForm(form);
      LF.closeAllModals();
      LF.toast("Welcome back, " + Auth.firstName(res.user) + ".");
    });

    renderAuthUI();
  };
})(window.LF);
