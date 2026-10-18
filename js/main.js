/* Harborline site behaviour: header, submenus, drawer, breadcrumbs, back to top, pricing, FAQ, forms */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var body = document.body;
  var route = body.dataset.route || "";
  var root = body.dataset.root || "";
  var header = document.querySelector(".hl-navbar");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header: fixed on inner pages; on Home it drops in once the hero has scrolled away */
  var backdrop = document.getElementById("navBackdrop");
  var spacer = document.createElement("div");
  spacer.className = "hl-navbar-spacer";
  spacer.setAttribute("aria-hidden", "true");
  backdrop.parentNode.insertBefore(spacer, backdrop.nextSibling);
  function sizeSpacer() { spacer.style.height = header.offsetHeight + "px"; }
  sizeSpacer();
  window.addEventListener("resize", sizeSpacer);
  var hero = document.querySelector(".hl-hero");
  function onScroll() {
    var y = window.scrollY;
    if (!route && hero) {
      var gone = hero.getBoundingClientRect().bottom <= 0;
      var was = header.classList.contains("is-fixed");
      if (gone !== was) {
        header.classList.toggle("is-fixed", gone);
        header.classList.toggle("is-drop", gone && !reduce);
        sizeSpacer();
      }
    }
    header.classList.toggle("is-scrolled", header.classList.contains("is-fixed") && y > 4);
    updateTop();
  }

  /* Submenus: click or ArrowDown opens, Escape or outside click closes */
  var subs = Array.prototype.slice.call(document.querySelectorAll("[data-sub]"));
  function closeSubs(except) {
    subs.forEach(function (s) {
      if (s === except) return;
      s.querySelector(".hl-sub__btn").setAttribute("aria-expanded", "false");
      s.querySelector(".hl-sub__panel").hidden = true;
    });
  }
  subs.forEach(function (s) {
    var btn = s.querySelector(".hl-sub__btn");
    var panel = s.querySelector(".hl-sub__panel");
    function open(focusFirst) {
      closeSubs(s);
      btn.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      if (focusFirst) { var a = panel.querySelector("a"); if (a) a.focus(); }
    }
    btn.addEventListener("click", function () {
      if (btn.getAttribute("aria-expanded") === "true") closeSubs(); else open(false);
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); open(true); }
    });
    panel.addEventListener("keydown", function (e) {
      var links = Array.prototype.slice.call(panel.querySelectorAll("a"));
      var i = links.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); if (i <= 0) btn.focus(); else links[i - 1].focus(); }
      if (e.key === "Escape") { e.preventDefault(); closeSubs(); btn.focus(); }
    });
    s.addEventListener("focusout", function (e) {
      if (!s.contains(e.relatedTarget)) closeSubs();
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest("[data-sub]")) closeSubs();
  });

  /* Mobile drawer: opens over the page with a backdrop */
  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("navDrawer");
  function setDrawer(open) {
    drawer.hidden = !open;
    backdrop.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setDrawer(drawer.hidden); });
  backdrop.addEventListener("click", function () { setDrawer(false); });
  drawer.addEventListener("click", function (e) { if (e.target.closest("a")) setDrawer(false); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 880 && !drawer.hidden) setDrawer(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (modal && !modal.hidden) { closeCookies(); return; }
    if (!drawer.hidden) { setDrawer(false); toggle.focus(); }
    closeSubs();
  });

  /* Breadcrumbs: one bar under the header on every page except Home, built from the route */
  var LABELS = {
    platform: "Platform", "load-triage": "Load triage", "carrier-vetting": "Carrier vetting",
    "rate-confirmations": "Rate confirmations", detention: "Detention capture",
    company: "Company", customers: "Customers", careers: "Careers", security: "Security",
    legal: "Legal", terms: "Terms and conditions", privacy: "Privacy policy", dpa: "Data processing agreement",
    accessibility: "Accessibility", "sign-in": "Sign in", settings: "Settings", "404": "Page not found"
  };
  var SECTION_HREF = { platform: "index.html#platform" };
  function buildCrumbs() {
    if (!route) return;
    var parts = route.split("/");
    var items = [{ label: "Home", href: root + "index.html" }];
    parts.forEach(function (p, i) {
      var last = i === parts.length - 1;
      items.push({ label: LABELS[p] || p, href: last ? null : (SECTION_HREF[p] ? root + SECTION_HREF[p] : null), current: last });
    });
    var sep = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 6l6 6-6 6"/></svg>';
    var canBack = !!document.referrer && document.referrer.indexOf(location.origin) === 0 && history.length > 1;
    var bar = document.createElement("div");
    bar.className = "hl-crumbs";
    bar.innerHTML = '<div class="hl-container hl-crumbs__inner">' +
      '<button class="hl-crumbs__back" type="button" aria-label="Go back"' + (canBack ? "" : " disabled") + '><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></svg></button>' +
      '<nav aria-label="Breadcrumb" style="flex:1;min-width:0"><ol class="hl-crumbs__list">' +
      items.map(function (it, i) {
        var inner = it.current ? '<span class="hl-crumbs__current" aria-current="page">' + it.label + "</span>"
          : it.href ? '<a href="' + it.href + '">' + it.label + "</a>" : "<span>" + it.label + "</span>";
        return '<li class="hl-crumbs__item">' + (i ? sep : "") + inner + "</li>";
      }).join("") + "</ol></nav></div>";
    bar.querySelector(".hl-crumbs__back").addEventListener("click", function () { if (canBack) history.back(); });
    spacer.parentNode.insertBefore(bar, spacer.nextSibling);
  }
  buildCrumbs();

  /* Back to top: floats after 600px, then hands off to the docked button on the footer edge */
  var topBtn = document.getElementById("toTop");
  var siteFooter = document.getElementById("site-footer");
  function updateTop() {
    var docked = !!siteFooter && siteFooter.getBoundingClientRect().top < window.innerHeight;
    var show = window.scrollY > 600 && !docked;
    topBtn.classList.toggle("is-visible", show);
    topBtn.setAttribute("aria-hidden", String(!show));
    topBtn.tabIndex = show ? 0 : -1;
  }
  document.querySelectorAll("[data-totop]").forEach(function (b) {
    b.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      var m = document.getElementById("main");
      if (m) m.focus({ preventScroll: true });
    });
  });
  var raf = 0;
  function onScrollRaf() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; onScroll(); }); }
  window.addEventListener("scroll", onScrollRaf, { passive: true });
  window.addEventListener("resize", onScrollRaf);
  onScroll();

  /* Pricing: monthly or yearly */
  var cycleButtons = document.querySelectorAll(".hl-toggle__btn");
  function setCycle(cycle) {
    cycleButtons.forEach(function (b) {
      var on = b.dataset.cycle === cycle;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    document.querySelectorAll(".hl-plan__price strong").forEach(function (el) {
      var next = el.dataset[cycle];
      if (next) el.textContent = next;
    });
    document.querySelectorAll(".hl-plan__note").forEach(function (el) {
      var next = el.dataset[cycle === "yearly" ? "noteYearly" : "noteMonthly"];
      if (next) el.textContent = next;
    });
  }
  cycleButtons.forEach(function (b) { b.addEventListener("click", function () { setCycle(b.dataset.cycle); }); });

  /* FAQ accordion, one open at a time; closed panels are inert so their text is skipped */
  var questions = document.querySelectorAll(".hl-faq__q");
  function setFaq(q, open) {
    q.setAttribute("aria-expanded", String(open));
    q.closest(".hl-faq__item").classList.toggle("is-open", open);
    var panel = document.getElementById(q.getAttribute("aria-controls"));
    if (panel) { if (open) panel.removeAttribute("inert"); else panel.setAttribute("inert", ""); }
  }
  questions.forEach(function (q) {
    q.addEventListener("click", function () {
      var open = q.getAttribute("aria-expanded") === "true";
      questions.forEach(function (o) { if (o !== q) setFaq(o, false); });
      setFaq(q, !open);
    });
  });

  /* Forms: client-side only until the CRM and app endpoints are connected */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  function wire(formId, noteId, check) {
    var form = document.getElementById(formId);
    var note = document.getElementById(noteId);
    if (!form || !note) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = check(form);
      note.classList.toggle("is-ok", r.ok);
      note.classList.toggle("is-error", !r.ok);
      note.textContent = r.msg;
      if (r.field) r.field.focus();
    });
    form.addEventListener("input", function () { note.textContent = ""; note.classList.remove("is-ok", "is-error"); });
  }
  wire("pilotForm", "formNote", function (f) {
    var input = f.querySelector("#email"), v = input.value.trim(), ok = EMAIL.test(v);
    input.setAttribute("aria-invalid", String(!ok));
    if (ok) f.reset();
    return ok ? { ok: true, msg: "Thanks. A pilot brief is on its way to " + v + "." }
      : { ok: false, msg: "Enter a work email so we can route you to the right onboarding lead.", field: input };
  });
  wire("signinForm", "signinNote", function (f) {
    var em = f.querySelector("#si-email"), pw = f.querySelector("#si-pass");
    var okEm = EMAIL.test(em.value.trim()), okPw = pw.value.length > 0;
    em.setAttribute("aria-invalid", String(!okEm));
    pw.setAttribute("aria-invalid", String(!okPw));
    if (!okEm) return { ok: false, msg: "Enter the work email your account was created with.", field: em };
    if (!okPw) return { ok: false, msg: "Enter your password.", field: pw };
    return { ok: false, msg: "Sign-in is not connected on this site yet. Use the sign-in link in your onboarding email." };
  });

  /* Toast */
  var toast = document.getElementById("toast"), toastT;
  function showToast(msg) {
    clearTimeout(toastT);
    toast.textContent = msg;
    toastT = setTimeout(function () { toast.textContent = ""; }, 3200);
  }

  /* Stored choices: hl-storage holds consent, hl-display holds theme and text size */
  function readJSON(k, d) { try { return JSON.parse(localStorage.getItem(k) || "") || d; } catch (e) { return d; } }
  function consent() { return readJSON("hl-storage", {}); }
  function display() { return readJSON("hl-display", {}); }
  function applyDisplay(theme, text) {
    var d = document.documentElement;
    if (theme && theme !== "light") d.dataset.theme = theme; else delete d.dataset.theme;
    if (text && text !== "md") d.dataset.text = text; else delete d.dataset.text;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "contrast" ? "#000000" : theme === "dark" ? "#0B0E11" : "#14181D");
    if (consent().display !== false) { try { localStorage.setItem("hl-display", JSON.stringify({ theme: theme, text: text })); } catch (e) {} }
    sizeSpacer();
  }
  var cur = display();
  applyDisplay(document.documentElement.dataset.theme || cur.theme || "light", document.documentElement.dataset.text || cur.text || "md");

  /* Cookie settings dialog: focus trapped, Escape and backdrop close, focus returns to the opener */
  var modal = document.getElementById("cookieModal");
  var box = modal.querySelector(".hl-modal__box");
  var ckDisplay = document.getElementById("ck-display");
  var opener = null;
  function openCookies() {
    opener = document.activeElement;
    ckDisplay.checked = consent().display !== false;
    modal.hidden = false;
    body.style.overflow = "hidden";
    ckDisplay.focus();
  }
  function closeCookies() {
    modal.hidden = true;
    body.style.overflow = "";
    if (opener && opener.focus && document.contains(opener)) opener.focus();
  }
  document.querySelectorAll("[data-cookie-open]").forEach(function (b) { b.addEventListener("click", openCookies); });
  modal.querySelectorAll("[data-cookie-close]").forEach(function (b) { b.addEventListener("click", closeCookies); });
  modal.addEventListener("click", function (e) { if (e.target === modal) closeCookies(); });
  modal.querySelector("[data-cookie-save]").addEventListener("click", function () {
    var keep = ckDisplay.checked;
    try {
      localStorage.setItem("hl-storage", JSON.stringify({ display: keep }));
      if (keep) localStorage.setItem("hl-display", JSON.stringify({ theme: document.documentElement.dataset.theme || "light", text: document.documentElement.dataset.text || "md" }));
      else localStorage.removeItem("hl-display");
    } catch (e) {}
    closeCookies();
    showToast(keep ? "Cookie settings saved." : "Cookie settings saved. Saved display settings deleted.");
  });
  box.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = Array.prototype.filter.call(box.querySelectorAll("button,a[href],input"), function (x) { return !x.disabled; });
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* Settings page */
  var sf = document.getElementById("settingsForm");
  if (sf) {
    var NAMES = { light: "Light theme on.", dark: "Dark theme on.", contrast: "High contrast theme on.", md: "Default text size.", lg: "Large text on.", xl: "Largest text on." };
    var sync = function () {
      var th = document.documentElement.dataset.theme || "light", tx = document.documentElement.dataset.text || "md";
      sf.querySelector("#theme-" + th).checked = true;
      sf.querySelector("#text-" + tx).checked = true;
    };
    sync();
    sf.addEventListener("change", function (e) {
      var th = sf.querySelector('input[name="theme"]:checked').value, tx = sf.querySelector('input[name="text"]:checked').value;
      applyDisplay(th, tx);
      showToast(NAMES[e.target.value] || "Saved.");
    });
    sf.querySelector("[data-settings-reset]").addEventListener("click", function () {
      applyDisplay("light", "md");
      sync();
      showToast("Display settings reset to defaults.");
    });
  }

  /* Hero floor: pause the grid loop while the hero is off screen */
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { hero.classList.toggle("is-paused", !es[0].isIntersecting); }).observe(hero);
  }

  /* Marker highlight: draw when the heading scrolls into view */
  var markHeads = document.querySelectorAll("[data-mark]");
  if ("IntersectionObserver" in window) {
    var mo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); mo.unobserve(e.target); } });
    }, { threshold: 0.6 });
    markHeads.forEach(function (h) { mo.observe(h); });
  } else markHeads.forEach(function (h) { h.classList.add("is-in"); });

  /* Line reveal: split paragraphs into measured lines, reveal once at 40% visible */
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var linePars = Array.prototype.filter.call(document.querySelectorAll("[data-lines]"), function (p) { return !p.children.length; });
  function splitLines(p) {
    if (!p._text) p._text = p.textContent.trim().replace(/\s+/g, " ");
    var words = p._text.split(" ");
    p.innerHTML = words.map(function (w) { return '<span class="hl-w">' + esc(w) + "</span>"; }).join(" ");
    var lines = [], top = null;
    p.querySelectorAll(".hl-w").forEach(function (w) {
      if (top === null || Math.abs(w.offsetTop - top) > 2) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    p.innerHTML = lines.map(function (l, i) {
      return '<span class="hl-line" style="--i:' + i + '">' + esc(l.join(" ")) + "</span>";
    }).join(" ");
    p.classList.add("is-split");
  }
  if (linePars.length) {
    var runSplit = function () { linePars.forEach(splitLines); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      runSplit();
      if ("IntersectionObserver" in window) {
        var lo = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            var p = e.target, n = p.querySelectorAll(".hl-line").length;
            p.classList.add("is-in"); lo.unobserve(p);
            setTimeout(function () { p.classList.add("is-done"); }, 700 + n * 170 + 50);
          });
        }, { threshold: 0.4 });
        linePars.forEach(function (p) { lo.observe(p); });
      } else linePars.forEach(function (p) { p.classList.add("is-in", "is-done"); });
      var rt, lastW = window.innerWidth;
      window.addEventListener("resize", function () {
        clearTimeout(rt);
        rt = setTimeout(function () { if (window.innerWidth !== lastW) { lastW = window.innerWidth; runSplit(); } }, 150);
      });
    });
  }

  /* List items: same staggered reveal, one item per step */
  var revealLists = document.querySelectorAll("[data-reveal-items]");
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var l = e.target, n = l.children.length;
        l.classList.add("is-in"); ro.unobserve(l);
        setTimeout(function () { l.classList.add("is-done"); }, 700 + n * 170 + 50);
      });
    }, { threshold: 0.4 });
    revealLists.forEach(function (l) {
      Array.prototype.forEach.call(l.children, function (li, i) { li.style.setProperty("--i", i); });
      l.classList.add("is-ready"); ro.observe(l);
    });
  }

  /* Platform bento: class-based fallback where :has() is unsupported */
  var bento = document.querySelector("[data-bento]");
  var hasSupport = window.CSS && CSS.supports && CSS.supports("selector(:has(*))");
  if (bento && !hasSupport) {
    var setActive = function (tile) {
      bento.querySelectorAll(".hl-tile").forEach(function (t) { t.classList.toggle("is-active", t === tile); });
      bento.classList.toggle("is-focusing", !!tile);
    };
    bento.querySelectorAll(".hl-tile").forEach(function (t) {
      t.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") setActive(t); });
      t.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") setActive(null); });
      t.addEventListener("focusin", function () { setActive(t); });
      t.addEventListener("focusout", function () { setActive(null); });
    });
  }

  /* Pricing: lift the featured plan when the grid scrolls into view */
  var plans = document.querySelector("[data-plans]");
  if (plans && "IntersectionObserver" in window && !reduce) {
    plans.classList.add("js-plans");
    var po = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      requestAnimationFrame(function () { plans.classList.add("is-in"); });
      po.disconnect();
    }, { threshold: 0.35 });
    po.observe(plans);
  }
})();
