/* LAUNCHFLOW — main.js : landing-page behaviour + bootstrap */
(function (LF) {
  "use strict";
  var $ = LF.$, $$ = LF.$$;

  /* ---------- navigation ---------- */
  var header = $("#siteHeader"), nav = $("#navMenu"), toggle = $("#navToggle"), scrim = $("#navScrim");

  function openMenu() {
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    scrim.hidden = false;
    document.body.classList.add("is-locked");
  }
  LF.closeMenu = function () {
    if (!nav.classList.contains("is-open")) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    scrim.hidden = true;
    if (!$$(".modal:not([hidden])").length) document.body.classList.remove("is-locked");
  };

  function initNav() {
    toggle.addEventListener("click", function () {
      nav.classList.contains("is-open") ? LF.closeMenu() : openMenu();
    });
    scrim.addEventListener("click", LF.closeMenu);
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) LF.closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1023) LF.closeMenu(); });

    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target || target.hidden) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: LF.reduceMotion ? "auto" : "smooth", block: "start" });
      LF.closeMenu();
    });

    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var links = $$(".nav__link");
    var sections = links.map(function (l) { return document.querySelector(l.getAttribute("href")); }).filter(Boolean);
    if ("IntersectionObserver" in window && sections.length) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id); });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function (s) { obs.observe(s); });
    }
  }

  /* ---------- product tabs ---------- */
  var panels = {
    overview: '<div class="panel__grid"><article class="tile"><span class="chip">This week</span><h4>Workspace pulse</h4><p class="tile__metric">87%</p><p>Projects on track across 6 teams.</p></article><article class="tile"><h4>Active projects</h4><div class="tile__rows"><p class="tile__row">Aurora <em>82%</em></p><p class="tile__row">Atlas <em>54%</em></p><p class="tile__row">Beacon <em>31%</em></p></div></article><article class="tile"><h4>Activity feed</h4><div class="tile__rows"><p class="tile__row">Rhea shipped Billing v2</p><p class="tile__row">Ayaan closed 4 tasks</p><p class="tile__row">Design review approved</p></div></article></div>',
    projects: '<div class="panel__grid"><article class="tile"><span class="chip">Board</span><h4>Aurora — Launch</h4><div class="tile__rows"><p class="tile__row">Design QA <em>In review</em></p><p class="tile__row">Pricing page <em>In progress</em></p><p class="tile__row">Docs refresh <em>Todo</em></p></div></article><article class="tile"><h4>Timeline</h4><p>Milestones, dependencies and owners in one view.</p><div class="tile__rows"><p class="tile__row">Sprint 14 <em>Aug 3–17</em></p><p class="tile__row">Beta <em>Aug 24</em></p></div></article><article class="tile"><h4>Owners</h4><div class="tile__rows"><p class="tile__row">Ayaan Khan <em>7 tasks</em></p><p class="tile__row">Rhea Sharma <em>5 tasks</em></p><p class="tile__row">Mia Yates <em>3 tasks</em></p></div></article></div>',
    analytics: '<div class="panel__grid"><article class="tile"><h4>Cycle time</h4><p class="tile__metric">2.4d</p><p>Down 18% versus last month.</p></article><article class="tile"><h4>Throughput</h4><div class="spark" aria-hidden="true"><span style="--h:40%"></span><span style="--h:66%"></span><span style="--h:52%"></span><span style="--h:88%"></span><span style="--h:71%"></span><span style="--h:96%"></span></div><p>Tasks completed per week.</p></article><article class="tile"><h4>Focus split</h4><div class="tile__rows"><p class="tile__row">Product <em>46%</em></p><p class="tile__row">Platform <em>32%</em></p><p class="tile__row">Support <em>22%</em></p></div></article></div>',
    automation: '<div class="panel__grid"><article class="tile"><span class="chip">Live</span><h4>Triage incoming bugs</h4><p>When an issue is labelled <strong>bug</strong>, assign it to on-call and post in Slack.</p></article><article class="tile"><h4>Weekly digest</h4><p>Every Friday at 16:00, summarise progress and email stakeholders.</p></article><article class="tile"><h4>Runs this month</h4><p class="tile__metric">1,284</p><p>About 42% of repetitive work removed.</p></article></div>'
  };

  function initTabs() {
    var tabs = $$(".tab");
    function setTab(tab) {
      var key = tab.id.replace("tab-", "");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute("aria-controls"));
        p.hidden = !on;
      });
      var panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (!panel.innerHTML.trim()) panel.innerHTML = panels[key];
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { setTab(tab); });
      tab.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        setTab(next);
      });
    });
    setTab(tabs[0]);
  }

  /* ---------- FAQ ---------- */
  var faqs = [
    ["What is LaunchFlow?", "LaunchFlow is a focused workspace where teams plan projects, collaborate, automate repetitive work and understand delivery — all in one place."],
    ["Is there a free plan?", "Yes. Every new account starts on the Free plan, which includes 3 projects, basic task management and basic analytics. No credit card required."],
    ["How does the upgrade work in this demo?", "Upgrading opens a simulated payment form. Nothing is sent anywhere: only a masked card representation such as Visa •••• 4242 is stored in your browser."],
    ["Can I invite my team?", "Yes. Invite collaborators by email and manage access with roles and permissions. In this demo, invites are simulated locally."],
    ["Which tools does LaunchFlow integrate with?", "Slack, GitHub, Figma, Google Drive, Notion, Microsoft Teams, Zapier and Linear, plus a documented REST API and webhooks."],
    ["Is my data secure?", "This is a frontend demo, so all data stays in your own browser's local storage. You can wipe it any time from Settings → Reset Demo Account."]
  ];

  function initFaq() {
    var acc = $("#accordion");
    acc.innerHTML = faqs.map(function (f, i) {
      return '<article class="acc"><h3><button class="acc__btn" type="button" id="faq-btn-' + i +
        '" aria-expanded="false" aria-controls="faq-panel-' + i + '"><span>' + f[0] +
        '</span><span class="acc__sign" aria-hidden="true"></span></button></h3><div class="acc__panel" id="faq-panel-' + i +
        '" role="region" aria-labelledby="faq-btn-' + i + '"><div><p>' + f[1] + "</p></div></div></article>";
    }).join("");
    acc.addEventListener("click", function (e) {
      var btn = e.target.closest(".acc__btn");
      if (!btn) return;
      var open = btn.getAttribute("aria-expanded") === "true";
      $$(".acc__btn", acc).forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
        document.getElementById(b.getAttribute("aria-controls")).classList.remove("is-open");
      });
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        document.getElementById(btn.getAttribute("aria-controls")).classList.add("is-open");
      }
    });
  }

  /* ---------- testimonials ---------- */
  var testimonials = [
    { q: "LaunchFlow gave our team one place to plan, communicate and actually understand what is happening across our projects.", n: "Ayaan Khan", r: "Head of Product, Vertex", i: "AK" },
    { q: "Automation removed an entire day of coordination work every week. Our designers finally spend their time designing.", n: "Rhea Sharma", r: "Design Director, Arcadia", i: "RS" },
    { q: "The intelligence layer surfaces blockers before our stand-up does. It changed how we run delivery reviews.", n: "Mia Yates", r: "VP Engineering, Northstar", i: "MY" }
  ];

  function initCarousel() {
    var track = $("#carouselTrack"), dotsWrap = $("#carouselDots");
    track.innerHTML = testimonials.map(function (t, i) {
      return '<li class="slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + " of " + testimonials.length +
        '"><figure class="quote"><blockquote>&ldquo;' + t.q + '&rdquo;</blockquote><figcaption><span class="quote__avatar" aria-hidden="true">' +
        t.i + '</span><span class="quote__who"><span class="quote__name">' + t.n + '</span><span class="quote__role">' + t.r +
        "</span></span></figcaption></figure></li>";
    }).join("");
    dotsWrap.innerHTML = testimonials.map(function (t, i) {
      return '<button type="button" role="tab" aria-selected="' + (i === 0) + '" aria-label="Testimonial ' + (i + 1) + ": " + t.n + '"></button>';
    }).join("");

    var dots = $$("button", dotsWrap), index = 0;
    function goTo(i) {
      index = (i + testimonials.length) % testimonials.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (d, di) { d.setAttribute("aria-selected", String(di === index)); });
    }
    $("#nextSlide").addEventListener("click", function () { goTo(index + 1); });
    $("#prevSlide").addEventListener("click", function () { goTo(index - 1); });
    dots.forEach(function (d, i) { d.addEventListener("click", function () { goTo(i); }); });

    var timer = null, carousel = $("#carousel");
    function start() { if (LF.reduceMotion || timer) return; timer = window.setInterval(function () { goTo(index + 1); }, 6500); }
    function stop() { window.clearInterval(timer); timer = null; }
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    start();
  }

  /* ---------- reveal + counters ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if ("IntersectionObserver" in window && !LF.reduceMotion) {
      var obs = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-visible");
          o.unobserve(en.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      items.forEach(function (el) { obs.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  function initCounters() {
    function run(el) {
      var to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.decimals || "0", 10), suf = el.dataset.suffix || "";
      var fmt = function (n) { return n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
      if (LF.reduceMotion) { el.textContent = fmt(to); return; }
      var start = performance.now();
      requestAnimationFrame(function step(now) {
        var p = Math.min((now - start) / 1400, 1);
        el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      });
    }
    var counters = $$(".counter");
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); o.unobserve(en.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { obs.observe(c); });
    } else { counters.forEach(run); }
  }

  /* ---------- intelligence demo ---------- */
  function initIntelligence() {
    var body = $("#chatBody"), i = 0;
    var prompts = [
      ["Summarise this week for the Atlas team.", "Atlas closed 23 tasks and cleared 4 blockers. Velocity is up 12%, but code review is now the slowest stage at 1.8 days."],
      ["What should we prioritise next sprint?", "Prioritise the three billing tasks blocking the Aurora launch, then the two accessibility fixes flagged by QA."],
      ["Any delivery risks I should know about?", "Two teammates have more than 12 open tasks each. Rebalancing four items would keep the sprint on track."]
    ];
    $("#askIntelligence").addEventListener("click", function () {
      var pair = prompts[i % prompts.length]; i += 1;
      var user = document.createElement("p");
      user.className = "msg msg--user";
      user.textContent = pair[0];
      var ai = document.createElement("p");
      ai.className = "msg msg--ai msg--typing";
      ai.textContent = "LaunchFlow is thinking…";
      body.append(user, ai);
      body.scrollTop = body.scrollHeight;
      window.setTimeout(function () {
        ai.classList.remove("msg--typing");
        ai.textContent = pair[1];
        body.scrollTop = body.scrollHeight;
      }, LF.reduceMotion ? 0 : 900);
    });
  }

  /* ---------- bootstrap ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    $("#year").textContent = String(new Date().getFullYear());
    LF.applyTheme(document.documentElement.getAttribute("data-theme") || "light");
    $("#themeToggle").addEventListener("click", LF.toggleTheme);

    initNav();
    initTabs();
    initFaq();
    initCarousel();
    initReveal();
    initCounters();
    initIntelligence();

    LF.initAuth();
    LF.initPricing();
    LF.initDashboard();
  });
})(window.LF);
