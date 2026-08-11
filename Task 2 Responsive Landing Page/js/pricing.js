/* LAUNCHFLOW — pricing.js : billing cycle, upgrade, demo payment, downgrade */
window.LF = window.LF || {};
(function (LF) {
  "use strict";
  var $ = LF.$;
  var PRICE = { monthly: 18, yearly: 15 };

  function cycle() { return LF.store.get("billingCycle", "monthly"); }
  function setCycle(c) { LF.store.set("billingCycle", c); }
  LF.cycle = cycle;

  function priceLabel(c) {
    return c === "yearly" ? "$15 / user / month" : "$18 / user / month";
  }
  function amount(c) { return (c === "yearly" ? PRICE.yearly * 12 : PRICE.monthly).toFixed(2); }
  LF.nextBillingDate = function (c) {
    var d = new Date();
    if (c === "yearly") d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  };

  function renderPricing() {
    var user = LF.auth.current();
    var plan = user ? user.plan : null;
    var c = cycle();

    $("#growthPrice").textContent = c === "yearly" ? "$15" : "$18";
    $("#growthPer").textContent = c === "yearly" ? "/ user / month, billed yearly" : "/ user / month";
    $("#billingToggle").setAttribute("aria-checked", String(c === "yearly"));
    $("#labelMonthly").classList.toggle("is-on", c !== "yearly");
    $("#labelYearly").classList.toggle("is-on", c === "yearly");

    var free = $("#planBtnFree"), growth = $("#planBtnGrowth");
    $('[data-plan="free"]').classList.toggle("is-current", plan === "Free");
    $('[data-plan="growth"]').classList.toggle("is-current", plan === "Growth");

    if (!user) {
      free.textContent = "Get Started"; free.disabled = false;
      growth.textContent = "Start Free Trial"; growth.disabled = false;
    } else if (plan === "Free") {
      free.textContent = "Current Plan"; free.disabled = true;
      growth.textContent = "Upgrade to Growth"; growth.disabled = false;
    } else {
      free.textContent = "Downgrade to Free"; free.disabled = false;
      growth.textContent = "Current Plan"; growth.disabled = true;
    }

    var manage = $("#planManage");
    manage.hidden = !user;
    if (user) {
      $("#managePlanName").textContent = user.plan;
      $("#managePlanMeta").textContent = user.plan === "Growth"
        ? "Billed " + user.billingCycle + " · " + (user.paymentMethod || "no payment method") + " · Active"
        : "You are on the Free plan. Upgrade for unlimited projects and automation.";
      $("#downgradeBtn").hidden = user.plan !== "Growth";
    }

    var kpi = $("#kpiPlan");
    if (kpi && user) {
      kpi.textContent = user.plan;
      $("#kpiPlanNote").textContent = user.plan === "Growth" ? "Unlimited projects" : "3 projects included";
      $("#dashUpgradeBtn").textContent = user.plan === "Growth" ? "Manage Plan" : "Upgrade Plan";
    }
  }
  LF.renderPricing = renderPricing;
  LF.on("auth:change", renderPricing);

  function openUpgrade() {
    var c = cycle();
    $("#upgradePrice").textContent = priceLabel(c);
    $("#upgradeCycle").textContent = c === "yearly" ? "Yearly" : "Monthly";
    $("#upgradeTotal").textContent = "$" + amount(c) + (c === "yearly" ? " / user / year" : " / user");
    LF.openModal("upgrade");
  }
  LF.openUpgrade = openUpgrade;

  function formatCard(v) {
    var d = v.replace(/\D/g, "").slice(0, 19);
    return d.replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExp(v) {
    var d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length <= 2) return d;
    return d.slice(0, 2) + " / " + d.slice(2);
  }
  function luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var n = parseInt(num.charAt(i), 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }
  function brand(num) {
    if (/^4/.test(num)) return "Visa";
    if (/^5[1-5]/.test(num)) return "Mastercard";
    if (/^3[47]/.test(num)) return "Amex";
    return "Card";
  }

  LF.initPricing = function () {
    $("#billingToggle").addEventListener("click", function () {
      var next = cycle() === "yearly" ? "monthly" : "yearly";
      LF.$$(".plan").forEach(function (p) { p.classList.add("is-switching"); });
      setCycle(next);
      window.setTimeout(function () {
        renderPricing();
        LF.$$(".plan").forEach(function (p) { p.classList.remove("is-switching"); });
      }, LF.reduceMotion ? 0 : 150);
      var u = LF.auth.current();
      if (u && u.plan === "Growth") LF.auth.update({ billingCycle: next });
    });

    $("#changeBillingBtn").addEventListener("click", function () {
      $("#billingToggle").click();
      LF.toast("Billing cycle switched to " + (cycle() === "yearly" ? "monthly" : "yearly") + ".");
    });

    $("#planBtnFree").addEventListener("click", function () {
      var user = LF.auth.current();
      if (!user) { LF.openModal("signup"); return; }
      if (user.plan === "Growth") LF.confirmDowngrade();
    });

    $("#planBtnGrowth").addEventListener("click", function () {
      var user = LF.auth.current();
      if (!user) { LF.openModal("signup"); return; }
      if (user.plan === "Free") openUpgrade();
    });

    $("#continueToPayment").addEventListener("click", function () {
      var c = cycle();
      LF.closeAllModals();
      $("#paymentSub").textContent = "Growth plan — " + priceLabel(c) + ", billed " + c + ".";
      $("#payAmount").textContent = "$" + amount(c);
      var u = LF.auth.current();
      if (u) { $("#pay-name").value = u.name; $("#pay-email").value = u.email; }
      LF.openModal("payment");
    });

    var card = $("#pay-card"), exp = $("#pay-exp"), cvc = $("#pay-cvc");
    card.addEventListener("input", function () { card.value = formatCard(card.value); });
    exp.addEventListener("input", function () { exp.value = formatExp(exp.value); });
    cvc.addEventListener("input", function () { cvc.value = cvc.value.replace(/\D/g, "").slice(0, 4); });

    LF.wireForm($("#paymentForm"), {
      "pay-name": function (v) { return !v ? "Cardholder name is required." : v.length < 2 ? "Enter the name on the card." : ""; },
      "pay-card": function (v) {
        var d = v.replace(/\D/g, "");
        if (!d) return "Card number is required.";
        if (d.length < 13 || d.length > 19 || !luhn(d)) return "Please enter a valid card number.";
        return "";
      },
      "pay-exp": function (v) {
        var d = v.replace(/\D/g, "");
        if (!d) return "Expiry date is required.";
        if (d.length !== 4) return "Use the MM / YY format.";
        var m = parseInt(d.slice(0, 2), 10), y = 2000 + parseInt(d.slice(2), 10);
        if (m < 1 || m > 12) return "Enter a valid month.";
        var now = new Date();
        if (y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1)) return "This card has expired.";
        return "";
      },
      "pay-cvc": function (v) { return !v ? "CVC is required." : !/^\d{3,4}$/.test(v) ? "Enter the 3 or 4 digit CVC." : ""; },
      "pay-email": function (v) { return !v ? "Billing email is required." : !LF.EMAIL_RE.test(v) ? "Enter a valid email address." : ""; }
    }, function (values, form) {
      var digits = values["pay-card"].replace(/\D/g, "");
      var masked = brand(digits) + " •••• " + digits.slice(-4);
      var c = cycle();
      // Only a masked representation is stored — never the full number, never the CVC.
      LF.auth.update({ plan: "Growth", billingCycle: c, paymentMethod: masked, since: Date.now() });
      LF.clearForm(form);
      LF.closeAllModals();
      $("#successCycle").textContent = c === "yearly" ? "Yearly" : "Monthly";
      $("#successCard").textContent = masked;
      $("#successNext").textContent = LF.nextBillingDate(c);
      LF.openModal("success");
    });

    $("#downgradeBtn").addEventListener("click", function () { LF.confirmDowngrade(); });

    LF.confirmDowngrade = function () {
      LF.confirm("Downgrade to Free?", "Your Growth features and stored demo payment method will be removed.", function () {
        LF.auth.update({ plan: "Free", paymentMethod: null, billingCycle: "monthly" });
        setCycle("monthly");
        renderPricing();
        LF.toast("You are now on the Free plan.");
      });
    };

    LF.confirm = function (title, message, onYes) {
      $("#confirmTitle").textContent = title;
      $("#confirmMessage").textContent = message;
      var btn = $("#confirmYes");
      var clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener("click", function () { LF.closeAllModals(); onYes(); });
      LF.openModal("confirm");
    };

    /* Sales modal */
    LF.wireForm($("#salesForm"), {
      "sl-name": function (v) { return !v ? "Full name is required." : ""; },
      "sl-email": function (v) {
        if (!v) return "Work email is required.";
        if (!LF.EMAIL_RE.test(v)) return "Enter a valid email address.";
        if (/@(gmail|yahoo|outlook|hotmail)\./i.test(v)) return "Please use your work email address.";
        return "";
      },
      "sl-company": function (v) { return !v ? "Company is required." : ""; },
      "sl-size": function (v) { return !v ? "Select your team size." : ""; },
      "sl-message": function (v) { return v.length < 10 ? "Please add a little more detail (10+ characters)." : ""; }
    }, function (values, form) {
      LF.clearForm(form);
      var ok = $("#salesSuccess");
      ok.hidden = false;
      LF.toast("Thanks. Your request has been received.");
      window.setTimeout(function () { ok.hidden = true; }, 6000);
    });

    renderPricing();
  };
})(window.LF);
