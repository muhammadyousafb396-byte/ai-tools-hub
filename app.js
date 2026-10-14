/* AI Tools Hub — vanilla JS: search, filter, sort, render. No backend. */
(function () {
  "use strict";

  var state = { query: "", category: "All", sort: "popular" };

  var pillsEl = document.getElementById("pills");
  var gridEl = document.getElementById("toolsGrid");
  var trendingEl = document.getElementById("trendingGrid");
  var searchEl = document.getElementById("searchInput");
  var sortEl = document.getElementById("sortSelect");
  var countEl = document.getElementById("resultCount");
  var emptyEl = document.getElementById("emptyState");

  var TIER_ORDER = { free: 0, freemium: 1, paid: 2 };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function priceBadge(tool) {
    var cls = tool.tier === "free" ? "badge badge-price badge-free" : "badge badge-price";
    return '<span class="' + cls + '">' + esc(tool.price) + "</span>";
  }

  function cardHTML(tool) {
    return (
      '<article class="tool-card">' +
        '<div class="card-top"><h3>' + esc(tool.name) + "</h3>" +
        '<span class="rating">★ ' + tool.rating.toFixed(1) + "</span></div>" +
        '<div class="badges"><span class="badge badge-cat">' + esc(tool.category) + "</span>" +
        priceBadge(tool) + "</div>" +
        '<p class="desc">' + esc(tool.desc) + "</p>" +
        '<p class="earning">💰 <strong>Earning angle:</strong> ' + esc(tool.earning) + "</p>" +
        '<a class="visit-btn" href="' + esc(tool.url) + '" target="_blank" rel="noopener">Visit Tool →</a>' +
        '<a class="review-link" href="/tools/' + esc(tool.id) + '/">Read full review →</a>' +
      "</article>"
    );
  }

  function adHTML() {
    // In-feed ad slot — when AdSense is active, replace the placeholder below with:
    // <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3045520642994409" data-ad-slot="INFEED_SLOT_ID" data-ad-format="fluid" data-ad-layout-key="-6t+ed+2i-1n-4w"></ins>
    // plus: (adsbygoogle = window.adsbygoogle || []).push({});
    return (
      '<div class="ad-slot ad-infeed" aria-hidden="true"><span>Advertisement</span></div>'
    );
  }

  function matches(tool) {
    var q = state.query.trim().toLowerCase();
    var okCat = state.category === "All" || tool.category === state.category;
    if (!okCat) return false;
    if (!q) return true;
    return (
      tool.name.toLowerCase().indexOf(q) !== -1 ||
      tool.desc.toLowerCase().indexOf(q) !== -1 ||
      tool.category.toLowerCase().indexOf(q) !== -1 ||
      tool.price.toLowerCase().indexOf(q) !== -1
    );
  }

  function sortTools(list) {
    var arr = list.slice();
    if (state.sort === "rating") arr.sort(function (a, b) { return b.rating - a.rating; });
    else if (state.sort === "free") arr.sort(function (a, b) {
      return (TIER_ORDER[a.tier] - TIER_ORDER[b.tier]) || (b.popularity - a.popularity);
    });
    else arr.sort(function (a, b) { return b.popularity - a.popularity; });
    return arr;
  }

  function render() {
    // Trending (always the 6 flagged tools, unaffected by filters)
    var trending = TOOLS.filter(function (t) { return t.trending; })
      .sort(function (a, b) { return b.popularity - a.popularity; });
    trendingEl.innerHTML = trending.map(cardHTML).join("");

    // All tools grid with filters + in-feed ad after every 8th card
    var list = sortTools(TOOLS.filter(matches));
    var html = "";
    list.forEach(function (tool, i) {
      html += cardHTML(tool);
      if ((i + 1) % 8 === 0 && i !== list.length - 1) html += adHTML();
    });
    gridEl.innerHTML = html;
    emptyEl.hidden = list.length !== 0;
    countEl.textContent = list.length === TOOLS.length
      ? "Showing all " + TOOLS.length + " tools"
      : "Showing " + list.length + " of " + TOOLS.length + " tools";
  }

  function renderPills() {
    pillsEl.innerHTML = CATEGORIES.map(function (c) {
      var active = c === state.category ? " active" : "";
      return '<button class="pill' + active + '" data-cat="' + esc(c) + '" role="tab">' + esc(c) + "</button>";
    }).join("");
    pillsEl.querySelectorAll(".pill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.category = btn.getAttribute("data-cat");
        renderPills();
        render();
      });
    });
  }

  searchEl.addEventListener("input", function () {
    state.query = searchEl.value;
    render();
  });
  sortEl.addEventListener("change", function () {
    state.sort = sortEl.value;
    render();
  });
  document.getElementById("navSearchBtn").addEventListener("click", function () {
    searchEl.focus();
    searchEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  renderPills();
  render();
})();
