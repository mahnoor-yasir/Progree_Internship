/* LAUNCHFLOW — dashboard.js : authenticated workspace, account, billing, settings */
window.LF = window.LF || {};
(function (LF) {
  "use strict";
  var $ = LF.$;

  var projects = [
    { name: "Aurora Launch", progress: 82, status: "On track", team: ["AK", "RS", "MY"] },
    { name: "Atlas Migration", progress: 54, status: "At risk", team: ["JD", "RS"] },
    { name: "Beacon Research", progress: 31, status: "On track", team: ["MY", "TC", "AK"] }
  ];
  var activity = [
    ["RS", "Rhea shipped Billing v2", "2 hours ago"],
    ["AK", "Ayaan closed 4 tasks in Aurora", "5 hours ago"],
    ["MY", "Design review approved", "Yesterday"],
    ["TC", "Tom automated bug triage", "2 days ago"]
  ];

  function renderProjects() {
    var wrap = $("#dashProjects");
    if (!wrap) return;
    wrap.innerHTML = projects.map(function (p) {
      return '<article class="project"><div class="project__top"><h4>' + p.name +
        '</h4><span class="status ' + (p.status === "On track" ? "status--on" : "status--risk") + '">' + p.status + '</span></div>' +
        '<div class="bar" style="margin-top:12px"><i style="--v:' + p.progress + '%"></i></div>' +
        '<div class="project__meta"><span>' + p.progress + '% complete</span>' +
        '<span class="avatars">' + p.team.map(function (t) { return '<span class="avatar">' + t + "</span>"; }).join("") + "</span></div></article>";
    }).join("");
  }

  function renderActivity() {
    var wrap = $("#dashActivity");
    if (!wrap) return;
    wrap.innerHTML = activity.map(function (a) {
      return '<li><span class="avatar" aria-hidden="true">' + a[0] + "</span><span><span>" + a[1] + "</span><time>" + a[2] + "</time></span></li>";
    }).join("");
  }

  LF.renderAccountModal = function () {
    var u = LF.auth.current();
    if (!u) return;
    $("#accountBody").innerHTML =
      '<div style="display:flex;align-items:center;gap:14px;min-width:0"><span class="avatar avatar--lg">' + LF.auth.initials(u) +
      '</span><span style="min-width:0"><strong style="display:block">' + u.name + '</strong><span style="color:var(--muted);font-size:.88rem;overflow-wrap:anywhere">' + u.email + "</span></span></div>" +
      '<div class="billing-grid" style="margin-top:18px">' +
      '<div class="billing-item"><span>Current plan</span><b>' + u.plan + "</b></div>" +
      '<div class="billing-item"><span>Billing cycle</span><b>' + (u.plan === "Growth" ? (u.billingCycle === "yearly" ? "Yearly" : "Monthly") : "—") + "</b></div>" +
      '<div class="billing-item"><span>Payment method</span><b>' + (u.paymentMethod || "None") + "</b></div>" +
      '<div class="billing-item"><span>Member since</span><b>' + new Date(u.createdAt).toLocaleDateString() + "</b></div></div>";
  };

  LF.renderBillingModal = function () {
    var u = LF.auth.current();
    if (!u) return;
    var growth = u.plan === "Growth";
    $("#billingBody").innerHTML =
      '<div class="billing-grid">' +
      '<div class="billing-item"><span>Current plan</span><b>' + u.plan + "</b></div>" +
      '<div class="billing-item"><span>Billing cycle</span><b>' + (growth ? (u.billingCycle === "yearly" ? "Yearly" : "Monthly") : "—") + "</b></div>" +
      '<div class="billing-item"><span>Subscription status</span><b>' + (growth ? "Active" : "Free plan") + "</b></div>" +
      '<div class="billing-item"><span>Payment method</span><b>' + (u.paymentMethod || "None on file") + "</b></div>" +
      '<div class="billing-item"><span>Next billing date</span><b>' + (growth ? LF.nextBillingDate(u.billingCycle) : "—") + "</b></div>" +
      '<div class="billing-item"><span>Amount</span><b>' + (growth ? (u.billingCycle === "yearly" ? "$180.00 / user / year" : "$18.00 / user / month") : "$0.00") + "</b></div></div>" +
      '<p class="notice" style="margin-top:14px">Simulated billing. No real payment has been processed.</p>' +
      '<div class="quick" style="margin-top:14px">' +
      (growth
        ? '<button class="btn btn--ghost btn--sm" type="button" id="billingChange">Change Billing</button><button class="btn btn--danger btn--sm" type="button" id="billingDowngrade">Downgrade to Free</button>'
        : '<button class="btn btn--primary btn--sm" type="button" id="billingUpgrade">Upgrade to Growth</button>') + "</div>";

    var chg = $("#billingChange"), dg = $("#billingDowngrade"), up = $("#billingUpgrade");
    if (chg) chg.addEventListener("click", function () { LF.closeAllModals(); $("#changeBillingBtn").click(); });
    if (dg) dg.addEventListener("click", function () { LF.closeAllModals(); LF.confirmDowngrade(); });
    if (up) up.addEventListener("click", function () { LF.closeAllModals(); LF.openUpgrade(); });
  };

  LF.initDashboard = function () {
    renderProjects();
    renderActivity();

    var quickConfig = {
      project: ["Create project", "Project name", "Create project"],
      task: ["Add task", "Task title", "Add task"],
      invite: ["Invite member", "Teammate email", "Send invite"]
    };
    var quickKind = "project";

    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-quick]");
      if (!b) return;
      var kind = b.getAttribute("data-quick");
      if (kind === "upgrade") {
        var u = LF.auth.current();
        if (u && u.plan === "Growth") { LF.renderBillingModal(); LF.openModal("billing"); }
        else LF.openUpgrade();
        return;
      }
      quickKind = kind;
      var cfg = quickConfig[kind];
      $("#quickTitle").textContent = cfg[0];
      $("#quickLabel").textContent = cfg[1];
      $("#quickSubmit").textContent = cfg[2];
      LF.clearForm($("#quickForm"));
      LF.openModal("quick");
    });

    LF.wireForm($("#quickForm"), {
      "quick-input": function (v) {
        if (!v) return "This field is required.";
        if (quickKind === "invite" && !LF.EMAIL_RE.test(v)) return "Enter a valid email address.";
        if (quickKind !== "invite" && v.length < 3) return "Use at least 3 characters.";
        return "";
      }
    }, function (values, form) {
      var v = values["quick-input"];
      if (quickKind === "project") {
        projects.unshift({ name: v, progress: 0, status: "On track", team: [LF.auth.initials(LF.auth.current())] });
        renderProjects();
        LF.toast('Project "' + v + '" created.');
      } else if (quickKind === "task") {
        activity.unshift([LF.auth.initials(LF.auth.current()), "You added task: " + v, "Just now"]);
        renderActivity();
        LF.toast("Task added.");
      } else {
        activity.unshift([LF.auth.initials(LF.auth.current()), "Invite sent to " + v, "Just now"]);
        renderActivity();
        LF.toast("Invite sent to " + v + ".");
      }
      LF.clearForm(form);
      LF.closeAllModals();
    });

    $("#settingsTheme").addEventListener("click", function () { LF.toggleTheme(); });
    $("#resetDemoBtn").addEventListener("click", function () {
      LF.closeAllModals();
      LF.confirm("Reset demo account?", "This clears your local LaunchFlow account, plan, billing cycle and payment method.", function () {
        LF.store.clearAll();
        LF.emit("auth:change", null);
        LF.applyTheme(document.documentElement.getAttribute("data-theme"));
        LF.renderPricing();
        LF.toast("Demo data cleared. You are back to the public landing page.");
        window.scrollTo({ top: 0, behavior: LF.reduceMotion ? "auto" : "smooth" });
      });
    });
  };
})(window.LF);
