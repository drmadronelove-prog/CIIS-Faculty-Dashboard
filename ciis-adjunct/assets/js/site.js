/* ============================================================
   Teaching in ICP — shared site chrome + behaviour
   Injects nav, role switcher, sidebar, breadcrumb, footer.
   Handles role filtering (localStorage), homepage search,
   and mobile menu toggling.
   ============================================================ */
(function () {
  "use strict";

  var body = document.body;
  var depth = parseInt(body.getAttribute("data-depth") || "0", 10);
  var pageKey = body.getAttribute("data-page") || "";
  var pageTitle = body.getAttribute("data-title") || "";
  var pageRole = body.getAttribute("data-page-role") || ""; // ta | core | adjunct (always-visible context)
  var prefix = depth > 0 ? "../" : "";

  var ROLE_KEY = "ciis-icp-role";

  // ---- helpers ----
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) { for (var k in attrs) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); } }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function internal(href) { return prefix + href; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  // ---- link data ----
  var topNav = [
    { key: "home",           label: "Home",          href: "index.html" },
    { key: "hr-pay",         label: "HR & Pay",      href: "hr-pay.html" },
    { key: "pedagogy",       label: "Pedagogy",      href: "pedagogy.html" },
    { key: "first-steps",    label: "First Steps",   href: "first-steps.html" },
    { key: "campus-map",     label: "Campus Map",    href: "campus-map.html" },
    { key: "transportation", label: "Getting Here",  href: "transportation.html" },
    { key: "handbook",       label: "Handbook",      href: "handbook.html" },
    { key: "approach",       label: "CIIS Approach", href: "approach.html" }
  ];

  var quicklinks = [
    { key: "home",           label: "Home",         icon: "ti-home",            href: "index.html" },
    { key: "hr-pay",         label: "HR & Pay",     icon: "ti-currency-dollar", href: "hr-pay.html" },
    { key: "pedagogy",       label: "Pedagogy",     icon: "ti-book",            href: "pedagogy.html" },
    { key: "first-steps",    label: "First Steps",  icon: "ti-checklist",       href: "first-steps.html" },
    { key: "campus-map",     label: "Campus Map",   icon: "ti-map-pin",         href: "campus-map.html" },
    { key: "transportation", label: "Getting Here", icon: "ti-bus",             href: "transportation.html" }
  ];

  var byRole = [
    { key: "handbook", label: "Adjuncts",            icon: "ti-user",   href: "handbook.html" },
    { key: "core",     label: "Core Faculty",        icon: "ti-users",  href: "core-faculty/index.html" },
    { key: "ta",       label: "Teaching Assistants", icon: "ti-school", href: "ta/index.html" }
  ];

  var external = [
    { label: "Canvas LMS",            icon: "ti-external-link", href: "https://ciis.instructure.com" },
    { label: "Colleague / Ellucian",  icon: "ti-external-link", href: "https://ciis-ss.colleague.elluciancloud.com" },
    { label: "SharePoint / CIIS Connect", icon: "ti-external-link", href: "https://ciisedu.sharepoint.com/sites/connect-icp" },
    { label: "CIIS Library",          icon: "ti-external-link", href: "https://library.ciis.edu" }
  ];

  var support = [
    { label: "IT support",  icon: "ti-headset",  href: "https://www.vclhub.com", external: true },
    { label: "Facilities",  icon: "ti-building", href: "mailto:FacilitiesandBusinessOps@ciis.edu", external: false }
  ];

  // ============================================================
  // BUILD TOP BAR + ROLE BAR
  // ============================================================
  function buildTopwrap() {
    var navItems = topNav.map(function (n) {
      var active = n.key === pageKey ? ' class="active" aria-current="page"' : "";
      return '<li><a href="' + internal(n.href) + '"' + active + ">" + esc(n.label) + "</a></li>";
    }).join("");

    var topbar =
      '<div class="topbar"><div class="topbar-inner">' +
        '<a class="brand" href="' + internal("index.html") + '">' +
          '<img src="' + internal("assets/images/icp-logo.png") + '" alt="Integral Counseling Psychology at California Institute of Integral Studies">' +
          '<span class="brand-text"><span class="b-main">Teaching in ICP</span>' +
          '<span class="b-sub">Core faculty · adjunct faculty · teaching assistants</span></span>' +
        "</a>" +
        '<button class="menu-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">' +
          '<i class="ti ti-menu-2" aria-hidden="true"></i></button>' +
        '<nav class="mainnav" aria-label="Primary"><ul>' + navItems + "</ul></nav>" +
      "</div></div>";

    var roles = [
      { v: "all", l: "All roles" },
      { v: "adjunct", l: "Adjunct faculty" },
      { v: "core", l: "Core faculty" },
      { v: "ta", l: "Teaching assistants" }
    ];
    var pills = roles.map(function (r) {
      return '<button class="role-pill" type="button" data-role-value="' + r.v +
        '" aria-pressed="false">' + r.l + "</button>";
    }).join("");

    var rolebar =
      '<div class="rolebar"><div class="rolebar-inner">' +
        '<span class="rb-label"><i class="ti ti-users-group" aria-hidden="true"></i> I am viewing as:</span>' +
        '<div class="role-pills" role="group" aria-label="Select your role">' + pills + "</div>" +
      "</div></div>";

    var wrap = el("div", { "class": "topwrap" }, topbar + rolebar);
    var mount = document.getElementById("topwrap");
    if (mount) { mount.parentNode.replaceChild(wrap, mount); }
    else { body.insertBefore(wrap, body.firstChild); }
  }

  // ============================================================
  // BUILD SIDEBAR
  // ============================================================
  function sideLinks(items) {
    return items.map(function (i) {
      var active = i.key && i.key === pageKey ? ' class="active" aria-current="page"' : "";
      return '<li><a href="' + internal(i.href) + '"' + active + '>' +
        '<i class="ti ' + i.icon + '" aria-hidden="true"></i> ' + esc(i.label) + "</a></li>";
    }).join("");
  }
  function extLinks(items) {
    return items.map(function (i) {
      var ext = (i.external === false) ? "" : ' target="_blank" rel="noopener"';
      var mark = (i.href.indexOf("mailto:") === 0) ? "" : '<i class="ti ti-arrow-up-right ext-mark" aria-hidden="true"></i>';
      return '<li><a href="' + i.href + '"' + ext + '>' +
        '<i class="ti ' + i.icon + '" aria-hidden="true"></i> ' + esc(i.label) + mark + "</a></li>";
    }).join("");
  }

  function buildSidebar() {
    var html =
      '<nav aria-label="Section navigation">' +
        "<h2>Quicklinks</h2><ul>" + sideLinks(quicklinks) + "</ul>" +
        "<h2>By role</h2><ul>" + sideLinks(byRole) + "</ul>" +
        "<h2>External</h2><ul>" + extLinks(external) + "</ul>" +
        "<h2>Support</h2><ul>" + extLinks(support) + "</ul>" +
      "</nav>";
    var aside = el("aside", { "class": "sidebar" }, html);
    var mount = document.getElementById("sidebar");
    if (mount) { mount.parentNode.replaceChild(aside, mount); }
  }

  // ============================================================
  // BREADCRUMB
  // ============================================================
  function buildBreadcrumb() {
    var mount = document.getElementById("breadcrumb");
    if (!mount) return;
    if (pageKey === "home" || !pageTitle) { mount.remove(); return; }
    mount.setAttribute("aria-label", "Breadcrumb");
    mount.innerHTML =
      '<a href="' + internal("index.html") + '">Home</a>' +
      '<span class="sep" aria-hidden="true">›</span>' +
      '<span aria-current="page">' + esc(pageTitle) + "</span>";
  }

  // ============================================================
  // FOOTER
  // ============================================================
  function buildFooter() {
    var html =
      '<div class="footer-inner">' +
        "<div>" +
          '<img src="' + internal("assets/images/ciis-logo.png") + '" alt="California Institute of Integral Studies logo">' +
          "<p>1453 Mission Street, San Francisco, CA 94103 · 415.575.6100</p>" +
          '<p class="footer-land">CIIS is located on unceded Ramaytush Ohlone land.</p>' +
        "</div>" +
        "<div><h3>Links</h3><ul class=\"footer-links\">" +
          '<li><a href="https://www.ciis.edu" target="_blank" rel="noopener">ciis.edu</a></li>' +
          '<li><a href="https://www.ciis.edu/academics/graduate-programs/integral-counseling-psychology" target="_blank" rel="noopener">ICP program page</a></li>' +
          '<li><a href="https://ciis.instructure.com" target="_blank" rel="noopener">Canvas LMS</a></li>' +
          '<li><a href="https://library.ciis.edu" target="_blank" rel="noopener">CIIS Library</a></li>' +
          '<li><a href="https://www.ciis.edu/student-services/disability-services" target="_blank" rel="noopener">Disability Services</a></li>' +
        "</ul></div>" +
        "<div><h3>Support</h3><ul class=\"footer-links\">" +
          '<li><a href="https://www.vclhub.com" target="_blank" rel="noopener">IT support — vclhub.com</a></li>' +
          '<li><a href="mailto:FacilitiesandBusinessOps@ciis.edu">Facilities — FacilitiesandBusinessOps@ciis.edu</a></li>' +
        "</ul></div>" +
      "</div>" +
      '<div class="footer-bottom">© 2026 California Institute of Integral Studies</div>';
    var footer = el("footer", { "class": "sitefooter" }, html);
    var mount = document.getElementById("sitefooter");
    if (mount) { mount.parentNode.replaceChild(footer, mount); }
    else { body.appendChild(footer); }
  }

  // ============================================================
  // ROLE FILTERING
  // ============================================================
  function getRole() {
    try { return localStorage.getItem(ROLE_KEY) || "all"; } catch (e) { return "all"; }
  }
  function setRole(r) {
    try { localStorage.setItem(ROLE_KEY, r); } catch (e) {}
  }
  function applyRole(role) {
    var nodes = document.querySelectorAll("[data-role]");
    for (var i = 0; i < nodes.length; i++) {
      var r = nodes[i].getAttribute("data-role");
      var show = (role === "all") || (r === "all") || (r === role) || (pageRole && r === pageRole);
      nodes[i].classList.toggle("role-hidden", !show);
    }
    // reflect on pills
    var pills = document.querySelectorAll(".role-pill");
    for (var j = 0; j < pills.length; j++) {
      pills[j].setAttribute("aria-pressed", pills[j].getAttribute("data-role-value") === role ? "true" : "false");
    }
  }
  function wireRoles() {
    var pills = document.querySelectorAll(".role-pill");
    for (var i = 0; i < pills.length; i++) {
      pills[i].addEventListener("click", function () {
        var r = this.getAttribute("data-role-value");
        setRole(r);
        applyRole(r);
      });
    }
    applyRole(getRole());
  }

  // ============================================================
  // HOMEPAGE SEARCH
  // ============================================================
  function wireSearch() {
    var input = document.getElementById("qf-search");
    if (!input) return;
    var cards = document.querySelectorAll(".qf-card");
    input.addEventListener("input", function () {
      var q = this.value.trim().toLowerCase();
      for (var i = 0; i < cards.length; i++) {
        var match = !q || cards[i].textContent.toLowerCase().indexOf(q) !== -1;
        cards[i].classList.toggle("search-hidden", !match);
      }
    });
  }

  // ============================================================
  // MOBILE MENU
  // ============================================================
  function wireMenu() {
    var btn = document.querySelector(".menu-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      body.classList.toggle("sidebar-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // ---- init ----
  buildTopwrap();
  buildSidebar();
  buildBreadcrumb();
  buildFooter();
  wireRoles();
  wireSearch();
  wireMenu();
})();
