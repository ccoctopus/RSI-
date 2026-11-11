/* =========================================================================
   RSI 研究工作台 — 交互与渲染
   约束：原生 JavaScript（ES6），无框架、无构建步骤。
   数据来源：js/content.js（静态内容）、data/evidence.json、data/papers.json。
   ========================================================================= */
(function () {
  "use strict";

  const CONTENT = window.RSI_CONTENT;
  const CHART_CDN = "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";
  const CRED_RANK = { "事实": 4, "学界共识": 3, "存在争议": 2, "推测": 1 };
  const SIM_DEFAULTS = { gain: 15, time: 6, bottleneck: 0.45 };

  const state = {
    timelineDecade: "all",
    timelineAllOpen: false,
    evidence: [],
    evidenceLoaded: false,
    evidenceLoading: false,
    papersLoaded: false,
    papersLoading: false,
    checklistAnswers: {},
    simFrame: null,
    chart: null,
    chartTried: false
  };

  /* -----------------------------------------------------------------------
     基础工具
     ----------------------------------------------------------------------- */
  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function tagClass(credibility) {
    if (credibility === "事实") return "tag--fact";
    if (credibility === "学界共识") return "tag--consensus";
    if (credibility === "存在争议") return "tag--debate";
    return "tag--speculation";
  }

  function tagHtml(credibility) {
    const label = credibility || "存在争议";
    return '<span class="tag ' + tagClass(label) + '">【' + escapeHtml(label) + '】</span>';
  }

  function statusTagClass(status) {
    if (status && status.indexOf("事实") === 0) return "tag--fact";
    if (status && status.indexOf("推测") !== -1 && status.indexOf("事实") === -1) return "tag--speculation";
    return "tag--debate";
  }

  function humanRoleLabel(value) {
    if (value === "none") return "无需逐轮介入";
    if (value === "step") return "人类逐轮介入";
    return "人类监督 / 设定";
  }

  function formatMultiple(value) {
    if (!isFinite(value) || value <= 0) return "—";
    if (value >= 1e9) return (value / 1e9).toFixed(value >= 1e10 ? 0 : 1).replace(/\.0$/, "") + "B×";
    if (value >= 1e6) return (value / 1e6).toFixed(value >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M×";
    if (value >= 1e4) return (value / 1e3).toFixed(value >= 1e5 ? 0 : 1).replace(/\.0$/, "") + "k×";
    if (value >= 100) return Math.round(value) + "×";
    if (value >= 10) return value.toFixed(1).replace(/\.0$/, "") + "×";
    if (value >= 2) return value.toFixed(2).replace(/0$/, "").replace(/\.0$/, "") + "×";
    return value.toFixed(2) + "×";
  }

  function formatYears(years) {
    if (!isFinite(years)) return "—";
    if (years < 1) return (years * 12).toFixed(1).replace(/\.0$/, "") + " 个月";
    if (years >= 100) return Math.round(years) + " 年";
    return years.toFixed(1).replace(/\.0$/, "") + " 年";
  }

  function hexToRgba(hex, alpha) {
    const clean = String(hex || "").trim().replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return "rgba(11, 97, 89, " + alpha + ")";
    const num = parseInt(clean, 16);
    return "rgba(" + ((num >> 16) & 255) + ", " + ((num >> 8) & 255) + ", " + (num & 255) + ", " + alpha + ")";
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function setStat(name, value) {
    const node = document.querySelector('[data-stat="' + name + '"]');
    if (node) node.textContent = String(value);
  }

  function fetchJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    });
  }

  /* -----------------------------------------------------------------------
     主题
     ----------------------------------------------------------------------- */
  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("rsi-theme", next);
    } catch (error) {
      /* 隐私模式下可能不允许写入；主题仍对当前页面生效。 */
    }

    const actionLabel = next === "dark" ? "浅色模式" : "深色模式";
    const actionAria = next === "dark" ? "切换到浅色模式" : "切换到深色模式";
    document.querySelectorAll(".theme-toggle").forEach(function (button) {
      button.setAttribute("aria-label", actionAria);
      button.setAttribute("title", actionAria);
    });
    document.querySelectorAll(".theme-toggle--wide .theme-label").forEach(function (label) {
      label.textContent = actionLabel;
    });

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", next === "dark" ? "#0d1210" : "#f4f1ea");

    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
      renderChart();
    }
  }

  function initTheme() {
    document.querySelectorAll(".theme-toggle").forEach(function (button) {
      button.addEventListener("click", function () {
        applyTheme(getTheme() === "dark" ? "light" : "dark");
      });
    });
    applyTheme(getTheme());
  }

  /* -----------------------------------------------------------------------
     移动端菜单
     ----------------------------------------------------------------------- */
  function initMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const sidebar = $("sidebar");
    const overlay = $("sidebar-overlay");
    if (!toggle || !sidebar) return;

    let lastFocus = null;

    function openMenu() {
      lastFocus = document.activeElement;
      sidebar.classList.add("is-open");
      document.body.classList.add("nav-open");
      if (overlay) overlay.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "关闭目录");
      const firstLink = sidebar.querySelector(".toc-link");
      if (firstLink) firstLink.focus({ preventScroll: true });
    }

    function closeMenu(restoreFocus) {
      sidebar.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      if (overlay) overlay.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "打开目录");
      if (restoreFocus && lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") closeMenu(true);
      else openMenu();
    });

    if (overlay) overlay.addEventListener("click", function () { closeMenu(true); });

    sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { closeMenu(true); });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
        closeMenu(true);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980 && sidebar.classList.contains("is-open")) closeMenu(false);
    });
  }

  /* -----------------------------------------------------------------------
     滚动高亮与阅读进度
     ----------------------------------------------------------------------- */
  function initScrollUi() {
    const progressBar = $("reading-progress-bar");
    const tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc-link"));
    const sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
    if (!sections.length) return;

    let ticking = false;

    function paint() {
      ticking = false;
      const scrollY = window.scrollY || window.pageYOffset;
      const doc = document.documentElement;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;

      if (progressBar) {
        progressBar.style.width = (ratio * 100).toFixed(2) + "%";
        progressBar.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
      }

      const marker = scrollY + (window.innerWidth <= 980 ? 150 : 80);
      let currentId = sections[0].id;
      sections.forEach(function (section) {
        const top = section.getBoundingClientRect().top + scrollY;
        if (top <= marker) currentId = section.id;
      });
      if (window.innerHeight + scrollY >= doc.scrollHeight - 4) {
        currentId = sections[sections.length - 1].id;
      }

      tocLinks.forEach(function (link) {
        const active = link.getAttribute("data-nav") === currentId;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    paint();
  }

  /* -----------------------------------------------------------------------
     静态内容渲染
     ----------------------------------------------------------------------- */
  function renderTimeline() {
    const list = $("timeline-list");
    const filters = $("decade-filters");
    if (!list || !filters || !CONTENT) return;

    const items = CONTENT.timeline || [];
    const decades = [];
    items.forEach(function (item) {
      if (decades.indexOf(item.decade) === -1) decades.push(item.decade);
    });

    const buttons = [];
    buttons.push({ value: "all", label: "全部年代" });
    decades.forEach(function (decade) {
      buttons.push({ value: decade, label: decade.replace(/s$/, " 年代") });
    });

    filters.innerHTML = buttons.map(function (button) {
      return '<button class="filter-chip" type="button" data-decade="' + escapeHtml(button.value) +
        '" aria-pressed="' + (button.value === "all" ? "true" : "false") + '">' +
        escapeHtml(button.label) + "</button>";
    }).join("");

    list.innerHTML = items.map(function (item) {
      const link = item.link || {};
      const verified = link.status === "verified";
      const datetime = String(item.year);
      return '<details class="timeline-entry" data-decade="' + escapeHtml(item.decade) + '">' +
        '<summary>' +
          '<time class="timeline-year" datetime="' + escapeHtml(datetime) + '">' + escapeHtml(item.year) + '</time>' +
          '<span class="timeline-summary-main">' +
            '<strong>' + escapeHtml(item.title) + '</strong>' +
            '<span>' + escapeHtml(item.who) + " · " + escapeHtml(item.role) + '</span>' +
          '</span>' +
          '<span class="timeline-summary-side">' +
            tagHtml(item.credibility) +
            '<span class="chevron" aria-hidden="true"></span>' +
          '</span>' +
        '</summary>' +
        '<div class="timeline-detail">' +
          '<p class="claim">' + escapeHtml(item.claim) + '</p>' +
          '<p>' + escapeHtml(item.detail) + '</p>' +
          '<p><strong>为什么重要：</strong>' + escapeHtml(item.relevance) + '</p>' +
          '<div class="timeline-meta">' +
            '<span><strong>判定说明：</strong>' + escapeHtml(item.credibilityNote) + '</span>' +
            '<span><strong>主张者：</strong>' + escapeHtml(item.who) + '（' + escapeHtml(item.role) + '）</span>' +
          '</div>' +
          (link.url ?
            '<a class="source-link" href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener noreferrer">' +
              escapeHtml(link.label || "查看来源") + "</a>" +
            '<span class="status-line' + (verified ? "" : " status-line--pending") + '">' +
              (verified ? "链接已核查" : "链接待核实") + "</span>" : "") +
        '</div>' +
      '</details>';
    }).join("");

    const count = $("timeline-count");
    const expandButton = $("timeline-expand-all");

    function visibleEntries() {
      return Array.prototype.slice.call(list.querySelectorAll(".timeline-entry")).filter(function (entry) {
        return !entry.hidden;
      });
    }

    function updateExpandLabel() {
      if (!expandButton) return;
      const visible = visibleEntries();
      const allOpen = visible.length > 0 && visible.every(function (entry) { return entry.open; });
      state.timelineAllOpen = allOpen;
      expandButton.textContent = allOpen ? "收起全部" : "展开全部";
      expandButton.setAttribute("aria-pressed", allOpen ? "true" : "false");
    }

    function applyFilter(decade) {
      state.timelineDecade = decade;
      let visible = 0;
      Array.prototype.slice.call(list.querySelectorAll(".timeline-entry")).forEach(function (entry) {
        const show = decade === "all" || entry.getAttribute("data-decade") === decade;
        entry.hidden = !show;
        if (show) visible += 1;
      });
      filters.querySelectorAll(".filter-chip").forEach(function (chip) {
        const active = chip.getAttribute("data-decade") === decade;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", active ? "true" : "false");
      });
      if (count) count.textContent = "显示 " + visible + " / " + items.length + " 条";
      updateExpandLabel();
    }

    filters.addEventListener("click", function (event) {
      const chip = event.target.closest(".filter-chip");
      if (!chip) return;
      applyFilter(chip.getAttribute("data-decade"));
    });

    if (expandButton) {
      expandButton.addEventListener("click", function () {
        const visible = visibleEntries();
        const shouldOpen = !state.timelineAllOpen;
        visible.forEach(function (entry) {
          entry.open = shouldOpen;
          if (!shouldOpen) entry.removeAttribute("data-print-opened");
        });
        updateExpandLabel();
      });
    }

    list.addEventListener("toggle", updateExpandLabel, true);
    applyFilter("all");
  }

  function renderAttacks() {
    const grid = $("attack-grid");
    if (!grid || !CONTENT) return;
    grid.innerHTML = (CONTENT.argument.attacks || []).map(function (attack) {
      return '<article class="attack-card">' +
        tagHtml(attack.credibility) +
        "<h4>" + escapeHtml(attack.title) + "</h4>" +
        "<p>" + escapeHtml(attack.body) + "</p>" +
        '<p class="attribution">主张 / 来源：' + escapeHtml(attack.attribution) + "</p>" +
      "</article>";
    }).join("");
  }

  function renderMechanisms() {
    const stack = $("mechanism-stack");
    if (!stack || !CONTENT) return;
    stack.innerHTML = (CONTENT.mechanisms || []).map(function (layer) {
      const strength = Math.max(1, Math.min(5, Number(layer.strength) || 1));
      return '<article class="mechanism-card">' +
        '<div class="mechanism-side">' +
          '<span class="mechanism-code">' + escapeHtml(layer.code) + '</span>' +
          "<h3>" + escapeHtml(layer.layer) + "</h3>" +
          "<p>" + escapeHtml(layer.summary) + "</p>" +
          '<div class="mechanism-strength">' +
            "<span>本页证据评估 " + strength + " / 5</span>" +
            '<div class="layer-bar' + (strength <= 2 ? " layer-bar--weak" : "") + '">' +
              '<i style="width:' + (strength * 20) + '%"></i>' +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="mechanism-body">' +
          "<h4>代表工作</h4>" +
          '<div class="example-chips">' +
            (layer.examples || []).map(function (example) {
              return '<span class="example-chip"><strong>' + escapeHtml(example.name) + "</strong> <em>" +
                escapeHtml(example.note) + "</em></span>";
            }).join("") +
          "</div>" +
          '<p class="mechanism-gap"><strong>离真 RSI 还差什么：</strong>' + escapeHtml(layer.gap) + "</p>" +
        "</div>" +
      "</article>";
    }).join("");
  }

  function renderPositions() {
    const grid = $("position-cards");
    if (!grid || !CONTENT) return;
    grid.innerHTML = (CONTENT.positions || []).map(function (position) {
      return '<article class="position-card position-card--' + escapeHtml(position.tone) + '">' +
        tagHtml(position.credibility) +
        "<h3>" + escapeHtml(position.stance) + "</h3>" +
        '<p class="who">主张者：' + escapeHtml(position.who) + "</p>" +
        "<p>" + escapeHtml(position.claim) + "</p>" +
        '<p class="caveat">限定：' + escapeHtml(position.caveat) + "</p>" +
      "</article>";
    }).join("");
  }

  function renderViewpoints() {
    const body = $("viewpoint-body");
    if (!body || !CONTENT) return;
    body.innerHTML = (CONTENT.viewpoints || []).map(function (row) {
      return "<tr>" +
        '<th scope="row"><strong>' + escapeHtml(row.who) + '</strong><span class="en">' + escapeHtml(row.year) + "</span></th>" +
        "<td>" + escapeHtml(row.possible) + "</td>" +
        "<td>" + escapeHtml(row.timescale) + "</td>" +
        "<td>" + escapeHtml(row.bottleneck) + "</td>" +
        "<td>" + escapeHtml(row.policy) + "</td>" +
        "<td>" + tagHtml(row.credibility) + "</td>" +
      "</tr>";
    }).join("");
  }

  function renderRiskChain() {
    const chain = $("risk-chain");
    if (!chain || !CONTENT) return;
    chain.innerHTML = (CONTENT.riskChain || []).map(function (step) {
      return '<article class="risk-step">' +
        "<h3>" + escapeHtml(step.title) + "</h3>" +
        "<p>" + escapeHtml(step.body) + "</p>" +
        '<span class="tag ' + statusTagClass(step.status) + ' mini-tag">' + escapeHtml(step.status) + "</span>" +
        '<p class="attribution">' + escapeHtml(step.note) + "</p>" +
      "</article>";
    }).join("");
  }

  function renderSafetyConcepts() {
    const grid = $("safety-concepts");
    if (!grid || !CONTENT) return;
    grid.innerHTML = (CONTENT.safetyConcepts || []).map(function (concept) {
      return '<article class="concept-card">' +
        tagHtml(concept.credibility) +
        "<h3>" + escapeHtml(concept.term) + ' <span class="en">' + escapeHtml(concept.en) + "</span></h3>" +
        "<p>" + escapeHtml(concept.body) + "</p>" +
      "</article>";
    }).join("");
  }

  function renderGovernance() {
    const body = $("governance-body");
    if (!body || !CONTENT) return;
    body.innerHTML = (CONTENT.governance || []).map(function (row) {
      return "<tr>" +
        '<th scope="row">' + escapeHtml(row.tool) + "</th>" +
        "<td>" + escapeHtml(row.mechanism) + "</td>" +
        "<td>" + escapeHtml(row.status) + "</td>" +
        "<td>" + escapeHtml(row.example) + "</td>" +
        "<td>" + escapeHtml(row.limit) + "</td>" +
      "</tr>";
    }).join("");
  }

  function renderCriticisms() {
    const grid = $("criticism-grid");
    if (!grid || !CONTENT) return;
    grid.innerHTML = (CONTENT.criticisms || []).map(function (item) {
      return '<article class="criticism-card">' +
        tagHtml(item.credibility) +
        "<h3>" + escapeHtml(item.title) + "</h3>" +
        "<p>" + escapeHtml(item.body) + "</p>" +
        '<span class="source">来源方向：' + escapeHtml(item.source) + "</span>" +
      "</article>";
    }).join("");
  }

  /* -----------------------------------------------------------------------
     术语表与 tooltip
     ----------------------------------------------------------------------- */
  function renderGlossary() {
    const grid = $("glossary-grid");
    if (!grid || !CONTENT) return;
    grid.innerHTML = (CONTENT.glossary || []).map(function (item) {
      return '<article class="glossary-card" id="glossary-card-' + escapeHtml(item.id) +
        '" data-glossary="' + escapeHtml(item.id) + '" tabindex="-1">' +
        "<h3>" + escapeHtml(item.zh) + "</h3>" +
        '<span class="glossary-en">' + escapeHtml(item.en) + "</span>" +
        "<p>" + escapeHtml(item.def) + "</p>" +
      "</article>";
    }).join("");

    const search = $("glossary-search");
    const count = $("glossary-count");
    const empty = $("glossary-empty");
    const cards = Array.prototype.slice.call(grid.querySelectorAll(".glossary-card"));

    function filterGlossary() {
      const query = search ? search.value.trim().toLowerCase() : "";
      let shown = 0;
      cards.forEach(function (card) {
        const item = (CONTENT.glossary || []).filter(function (entry) {
          return "glossary-card-" + entry.id === card.id;
        })[0];
        const haystack = item ? [item.zh, item.en, item.def, item.id].join(" ").toLowerCase() : "";
        const match = !query || haystack.indexOf(query) !== -1;
        card.hidden = !match;
        if (match) shown += 1;
      });
      if (count) count.textContent = query ? "匹配 " + shown + " / " + cards.length + " 条" : "共 " + cards.length + " 条术语";
      if (empty) empty.hidden = shown !== 0;
    }

    if (search) search.addEventListener("input", filterGlossary);
    filterGlossary();
  }

  function initTooltips() {
    const tooltip = $("term-tooltip");
    if (!tooltip || !CONTENT) return;
    const title = tooltip.querySelector(".tooltip-title");
    const en = tooltip.querySelector(".tooltip-en");
    const body = tooltip.querySelector(".tooltip-body");
    const terms = Array.prototype.slice.call(document.querySelectorAll(".term[data-term]"));
    let currentTerm = null;

    function glossaryFor(id) {
      return (CONTENT.glossary || []).filter(function (item) { return item.id === id; })[0] || null;
    }

    function positionTooltip(term) {
      tooltip.hidden = false;
      const rect = term.getBoundingClientRect();
      const width = tooltip.offsetWidth;
      const height = tooltip.offsetHeight;
      let left = rect.left + rect.width / 2 - width / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      let top = rect.top - height - 9;
      if (top < 8) top = rect.bottom + 9;
      tooltip.style.left = left + "px";
      tooltip.style.top = top + "px";
    }

    function show(term) {
      const id = term.getAttribute("data-term");
      const item = glossaryFor(id);
      if (!item) return;
      currentTerm = term;
      title.textContent = item.zh;
      en.textContent = item.en;
      body.textContent = item.def;
      positionTooltip(term);
      window.requestAnimationFrame(function () { tooltip.classList.add("is-visible"); });
    }

    function hide() {
      tooltip.classList.remove("is-visible");
      tooltip.hidden = true;
      currentTerm = null;
    }

    terms.forEach(function (term) {
      term.addEventListener("mouseenter", function () { show(term); });
      term.addEventListener("mouseleave", hide);
      term.addEventListener("focus", function () { show(term); });
      term.addEventListener("blur", hide);
      term.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goToTerm(term);
        }
        if (event.key === "Escape") hide();
      });
      term.addEventListener("click", function () { goToTerm(term); });
    });

    function goToTerm(term) {
      const id = term.getAttribute("data-term");
      const card = $("glossary-card-" + id);
      hide();
      if (!card) return;

      const search = $("glossary-search");
      if (search && search.value.trim()) {
        search.value = "";
        search.dispatchEvent(new Event("input", { bubbles: true }));
      }

      card.classList.remove("is-highlighted");
      window.requestAnimationFrame(function () {
        card.classList.add("is-highlighted");
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.focus({ preventScroll: true });
        window.setTimeout(function () { card.classList.remove("is-highlighted"); }, 2600);
      });
    }

    window.addEventListener("scroll", function () {
      if (currentTerm) hide();
    }, { passive: true });
    window.addEventListener("resize", hide);
  }

  /* -----------------------------------------------------------------------
     证据库
     ----------------------------------------------------------------------- */
  function evidenceSearchText(item) {
    return [
      item.name, item.institution, item.layer, item.target, item.loop, item.loopLength,
      item.evaluator, item.injection, item.result, item.limits, item.verdict,
      item.sourceTitle, item.year, item.credibility
    ].join(" ").toLowerCase();
  }

  function compareEvidence(a, b, sortKey) {
    const depthA = (a.scores && a.scores.depth) || 0;
    const depthB = (b.scores && b.scores.depth) || 0;

    if (sortKey === "depth") {
      if (depthB !== depthA) return depthB - depthA;
      return (CRED_RANK[b.credibility] || 0) - (CRED_RANK[a.credibility] || 0);
    }
    if (sortKey === "year") {
      if (b.year !== a.year) return b.year - a.year;
      return depthB - depthA;
    }
    if (sortKey === "reproducibility" || sortKey === "evaluation") {
      const scoreA = (a.scores && a.scores[sortKey]) || 0;
      const scoreB = (b.scores && b.scores[sortKey]) || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return depthB - depthA;
    }

    const rankDiff = (CRED_RANK[b.credibility] || 0) - (CRED_RANK[a.credibility] || 0);
    if (rankDiff !== 0) return rankDiff;
    if (depthB !== depthA) return depthB - depthA;
    return b.year - a.year;
  }

  function evidenceCard(item) {
    const scores = item.scores || {};
    const scoreRows = [
      { key: "depth", label: "闭环深度" },
      { key: "evaluation", label: "评估独立性" },
      { key: "reproducibility", label: "可复现性" },
      { key: "generalization", label: "泛化性" }
    ].map(function (row) {
      const value = Math.max(0, Math.min(5, Number(scores[row.key]) || 0));
      return '<div class="score-row">' +
        "<strong>" + escapeHtml(row.label) + "</strong>" +
        '<div class="score-bar" aria-hidden="true"><i style="width:' + (value * 20) + '%"></i></div>' +
        "<span>" + value + " / 5</span>" +
      "</div>";
    }).join("");

    return '<article class="evidence-card" data-evidence-id="' + escapeHtml(item.id) + '">' +
      '<div class="card-badges">' +
        tagHtml(item.credibility) +
        '<span class="mini-tag">' + escapeHtml(item.layer) + "</span>" +
        '<span class="card-verdict">闭环 ' + Number(item.loopDepth || 0) + " / 5</span>" +
      "</div>" +
      "<h3>" + escapeHtml(item.name) + "</h3>" +
      '<p class="card-meta"><span>' + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.institution) + "</span></p>" +
      '<p class="card-summary"><strong>改进对象：</strong>' + escapeHtml(item.target) + "</p>" +
      '<div class="score-grid" aria-label="本页编辑评分">' + scoreRows + "</div>" +
      "<details>" +
        "<summary>拆解证据与局限</summary>" +
        '<div class="evidence-detail">' +
          '<dl class="detail-list">' +
            "<div><dt>闭环路径</dt><dd>" + escapeHtml(item.loop) + "</dd></div>" +
            "<div><dt>闭环长度</dt><dd>" + escapeHtml(item.loopLength) + "</dd></div>" +
            "<div><dt>评估者</dt><dd>" + escapeHtml(item.evaluator) + "</dd></div>" +
            "<div><dt>人类角色</dt><dd>" + escapeHtml(humanRoleLabel(item.humanInLoop)) + "</dd></div>" +
            "<div><dt>外部注入</dt><dd>" + escapeHtml(item.injection) + "</dd></div>" +
            "<div><dt>报告结果</dt><dd>" + escapeHtml(item.result) + "</dd></div>" +
            "<div><dt>主要局限</dt><dd>" + escapeHtml(item.limits) + "</dd></div>" +
            "<div><dt>本页判断</dt><dd>" + escapeHtml(item.verdict) + "</dd></div>" +
            "<div><dt>来源题名</dt><dd>" + escapeHtml(item.sourceTitle) + "</dd></div>" +
          "</dl>" +
          '<a class="source-link" href="' + escapeHtml(item.link) + '" target="_blank" rel="noopener noreferrer">打开来源</a>' +
        "</div>" +
      "</details>" +
    "</article>";
  }

  function renderEvidence() {
    const grid = $("evidence-grid");
    const count = $("evidence-count");
    const empty = $("evidence-empty");
    if (!grid || !state.evidenceLoaded) return;

    const depthFilter = $("filter-depth");
    const humanFilter = $("filter-human");
    const layerFilter = $("filter-layer");
    const sortSelect = $("sort-evidence");
    const searchInput = $("filter-search");

    const depth = depthFilter ? Number(depthFilter.value) : 0;
    const human = humanFilter ? humanFilter.value : "all";
    const layer = layerFilter ? layerFilter.value : "all";
    const sortKey = sortSelect ? sortSelect.value : "credibility";
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    const filtered = state.evidence.filter(function (item) {
      if (depthFilter && depthFilter.value !== "all" && Number(item.loopDepth) < depth) return false;
      if (human !== "all" && item.humanInLoop !== human) return false;
      if (layer !== "all" && String(item.layer).indexOf(layer) === -1) return false;
      if (query && evidenceSearchText(item).indexOf(query) === -1) return false;
      return true;
    });

    const sorted = state.evidence.slice().sort(function (a, b) {
      return compareEvidence(a, b, sortKey);
    });
    const visibleIds = {};
    filtered.forEach(function (item) { visibleIds[item.id] = true; });

    grid.innerHTML = sorted.map(evidenceCard).join("");
    grid.querySelectorAll(".evidence-card").forEach(function (card) {
      card.hidden = !visibleIds[card.getAttribute("data-evidence-id")];
    });
    grid.setAttribute("aria-busy", "false");

    if (count) {
      count.textContent = "显示 " + filtered.length + " / " + state.evidence.length + " 项" +
        (query ? " · 搜索：" + query : "") +
        (sortKey === "credibility" ? " · 默认按可信度与闭环深度排序" : "");
    }
    if (empty) empty.hidden = filtered.length !== 0;
  }

  function evidenceError(message) {
    const grid = $("evidence-grid");
    const count = $("evidence-count");
    if (count) count.textContent = "证据数据加载失败";
    if (!grid) return;
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML = '<div class="load-error" role="status">' +
      "<h3>无法加载证据数据</h3>" +
      "<p>" + escapeHtml(message) + "</p>" +
      "<p>请确认页面通过本地 HTTP 服务打开，例如在项目目录运行 <code>python -m http.server 8000</code>，而不是直接双击 HTML 文件。</p>" +
      '<button class="button button--small" type="button" data-retry-evidence>重新加载</button>' +
    "</div>";
  }

  function loadEvidence() {
    if (state.evidenceLoading) return;
    state.evidenceLoading = true;
    const grid = $("evidence-grid");
    const count = $("evidence-count");
    if (grid) grid.setAttribute("aria-busy", "true");
    if (count) count.textContent = "正在加载证据…";

    fetchJson("data/evidence.json").then(function (data) {
      state.evidence = Array.isArray(data.evidence) ? data.evidence : [];
      state.evidenceLoaded = true;
      state.evidenceLoading = false;
      setStat("evidence", state.evidence.length);
      renderEvidence();
    }).catch(function (error) {
      state.evidenceLoading = false;
      evidenceError(error && error.message ? error.message : "网络或文件读取错误。");
    });
  }

  function resetEvidenceFilters() {
    ["filter-depth", "filter-human", "filter-layer"].forEach(function (id) {
      const node = $(id);
      if (node) node.value = "all";
    });
    const sort = $("sort-evidence");
    if (sort) sort.value = "credibility";
    const search = $("filter-search");
    if (search) search.value = "";
    renderEvidence();
  }

  function initEvidence() {
    ["filter-depth", "filter-human", "filter-layer", "sort-evidence"].forEach(function (id) {
      const node = $(id);
      if (node) node.addEventListener("change", renderEvidence);
    });
    const search = $("filter-search");
    if (search) search.addEventListener("input", renderEvidence);

    ["reset-evidence", "reset-evidence-empty"].forEach(function (id) {
      const node = $(id);
      if (node) node.addEventListener("click", resetEvidenceFilters);
    });

    const grid = $("evidence-grid");
    if (grid) {
      grid.addEventListener("click", function (event) {
        if (event.target.closest("[data-retry-evidence]")) loadEvidence();
      });
    }

    loadEvidence();
  }

  /* -----------------------------------------------------------------------
     六问自评
     ----------------------------------------------------------------------- */
  function initChecklist() {
    const form = $("checklist-form");
    const result = $("checklist-result");
    const reset = $("checklist-reset");
    if (!form || !result || !CONTENT) return;

    const questions = CONTENT.checklistQuestions || [];
    const options = [
      { value: "yes", label: "是", score: 2 },
      { value: "partial", label: "部分", score: 1 },
      { value: "no", label: "否", score: 0 },
      { value: "unsure", label: "不确定", score: 0 }
    ];
    const scoreMap = { yes: 2, partial: 1, no: 0, unsure: 0 };

    form.innerHTML = '<ol class="checklist-list">' + questions.map(function (question, index) {
      return '<li class="checklist-item" data-question="' + escapeHtml(question.id) + '">' +
        '<div class="checklist-question">' +
          '<span class="checklist-index">' + (index + 1 < 10 ? "0" : "") + (index + 1) + "</span>" +
          "<div>" +
            "<h4>" + escapeHtml(question.text) + "</h4>" +
            '<p class="checklist-why">' + escapeHtml(question.why) + "</p>" +
          "</div>" +
        "</div>" +
        '<div class="checklist-options" role="radiogroup" aria-label="第 ' + (index + 1) + " 问：" + escapeHtml(question.text) + '">' +
          options.map(function (option) {
            const inputId = "check-" + question.id + "-" + option.value;
            return '<label class="checklist-option" for="' + inputId + '">' +
              '<input type="radio" id="' + inputId + '" name="' + escapeHtml(question.id) +
                '" value="' + option.value + '">' +
              "<span>" + option.label + "</span>" +
            "</label>";
          }).join("") +
        "</div>" +
      "</li>";
    }).join("") + "</ol>";

    function collect() {
      const answers = {};
      questions.forEach(function (question) {
        const checked = form.querySelector('input[name="' + question.id + '"]:checked');
        if (checked) answers[question.id] = checked.value;
      });
      return answers;
    }

    function renderResult() {
      const answers = collect();
      state.checklistAnswers = answers;
      const answered = Object.keys(answers).length;
      let score = 0;
      let yes = 0;
      let partial = 0;
      let no = 0;
      let unsure = 0;

      questions.forEach(function (question) {
        const value = answers[question.id];
        if (!value) return;
        score += scoreMap[value] || 0;
        if (value === "yes") yes += 1;
        if (value === "partial") partial += 1;
        if (value === "no") no += 1;
        if (value === "unsure") unsure += 1;
      });

      form.querySelectorAll(".checklist-item").forEach(function (item) {
        item.classList.toggle("is-answered", Boolean(answers[item.getAttribute("data-question")]));
      });

      if (answered === 0) {
        result.innerHTML = '<p class="checklist-empty">选择六项答案后，这里会给出条件性判断。它只是一组必要条件的检查，不是同行评议结论。</p>';
        return;
      }

      let verdict = "不符合严格 RSI 判据";
      let tone = "tag--debate";
      let summary = "当前回答显示关键条件未满足；更接近相邻范式（如自我精炼、自我训练或脚手架优化）。";
      if (score >= 10) {
        verdict = "较强 RSI 候选";
        tone = "tag--fact";
        summary = "六项结构性条件大多满足；仍需外部复现、独立审计与长期观察，不能仅凭本清单确认。";
      } else if (score >= 7) {
        verdict = "部分符合，存在关键缺口";
        tone = "tag--debate";
        summary = "具备若干递归特征，但至少一个核心条件（改进对象、评估独立性或闭环持续性）仍不牢固。";
      } else if (score >= 4) {
        verdict = "弱候选";
        tone = "tag--speculation";
        summary = "更像短程自我改进、自我训练或评估器内的优化；离“改进改进器”仍有距离。";
      }

      if (answered < questions.length) {
        verdict = "初步判断：" + verdict;
        summary += " 目前只回答了 " + answered + " / " + questions.length + " 项，结论会随剩余问题改变。";
      }

      const gaps = questions.filter(function (question) {
        return answers[question.id] === "no" || answers[question.id] === "unsure";
      }).slice(0, 3);

      result.innerHTML = '<div class="checklist-score">' +
          "<div><strong>" + score + "</strong><span>/ 12 分</span></div>" +
          '<span class="tag ' + tone + '">' + escapeHtml(verdict) + "</span>" +
        "</div>" +
        "<h4>回答分布</h4>" +
        '<p class="checklist-distribution">是 ' + yes + " · 部分 " + partial + " · 否 " + no +
          " · 不确定 " + unsure + "（不确定按 0 分计，不构成证据）</p>" +
        "<p>" + escapeHtml(summary) + "</p>" +
        (gaps.length ? '<div class="checklist-gaps"><strong>需要优先核查：</strong><ul>' +
          gaps.map(function (question) {
            return "<li>" + escapeHtml(question.text) + " " + escapeHtml(question.why) + "</li>";
          }).join("") + "</ul></div>" : "") +
        '<p class="checklist-caveat">本结果不是学界统一标准，也不评价论文质量；它只检查六项条件是否被公开证据支持。</p>';
    }

    form.addEventListener("change", renderResult);
    if (reset) {
      reset.addEventListener("click", function () {
        form.reset();
        renderResult();
      });
    }
    renderResult();
  }

  /* -----------------------------------------------------------------------
     起飞模拟器（示意模型，不是预测）
     ----------------------------------------------------------------------- */
  function simulate(gain, bottleneck, generations) {
    const g = Math.max(0.001, Number(gain) || 0.01);
    const k = Math.max(0, Math.min(0.99, Number(bottleneck) || 0));
    const cap = Math.pow(10, 9 * (1 - k));
    const values = [1];
    for (let i = 0; i < generations; i += 1) {
      const current = values[i];
      const next = current * (1 + g * (1 - current / cap));
      values.push(Math.max(current, next));
    }
    return { values: values, cap: cap };
  }

  function valueAtYears(values, timeMonths, years) {
    if (!values.length) return 1;
    const generation = (years * 12) / Math.max(0.5, timeMonths);
    const index = Math.max(0, Math.min(values.length - 1, Math.floor(generation)));
    return values[index];
  }

  function currentSimInput() {
    const gainNode = $("sim-gain");
    const timeNode = $("sim-time");
    const bottleneckNode = $("sim-bottleneck");
    return {
      gain: (Number(gainNode && gainNode.value) || SIM_DEFAULTS.gain) / 100,
      time: Number(timeNode && timeNode.value) || SIM_DEFAULTS.time,
      bottleneck: Number(bottleneckNode && bottleneckNode.value) || 0
    };
  }

  function renderChart() {
    const canvas = $("sim-chart");
    if (!canvas || typeof window.Chart === "undefined") return;
    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }

    const input = currentSimInput();
    const series = simulate(input.gain, input.bottleneck, 100);
    const labels = series.values.map(function (_, index) { return String(index); });
    const accent = cssVar("--accent");
    const warm = cssVar("--warm");
    const line = cssVar("--line");
    const muted = cssVar("--muted");
    const ink = cssVar("--ink");
    const surface = cssVar("--surface");
    const reference = series.values.map(function () { return 10; });

    const fallback = $("chart-fallback");
    if (fallback) fallback.hidden = true;
    canvas.hidden = false;

    state.chart = new window.Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "模型能力倍数",
            data: series.values,
            borderColor: accent,
            backgroundColor: hexToRgba(accent, 0.12),
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: true,
            tension: 0.22
          },
          {
            label: "10× 参考线",
            data: reference,
            borderColor: warm,
            borderWidth: 1.2,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
            tension: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: { color: muted, boxWidth: 12, boxHeight: 2, font: { size: 10 } }
          },
          tooltip: {
            backgroundColor: surface,
            titleColor: ink,
            bodyColor: ink,
            borderColor: line,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              title: function (items) {
                if (!items.length) return "";
                const index = items[0].dataIndex;
                return "第 " + index + " 代 · 约 " + formatYears((index * input.time) / 12);
              },
              label: function (item) {
                return item.datasetIndex === 0
                  ? "能力倍数：" + formatMultiple(item.parsed.y)
                  : "参考线：10×";
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: hexToRgba(line, 0.42) },
            ticks: { color: muted, maxTicksLimit: 11, font: { size: 10 } },
            title: { display: true, text: "代际", color: muted, font: { size: 10 } }
          },
          y: {
            type: "logarithmic",
            min: 1,
            grid: { color: hexToRgba(line, 0.42) },
            ticks: {
              color: muted,
              font: { size: 10 },
              callback: function (value) { return formatMultiple(value); }
            },
            title: { display: true, text: "能力倍数（对数轴）", color: muted, font: { size: 10 } }
          }
        }
      }
    });

    canvas.setAttribute("aria-label",
      "示意模型曲线：每代增益 " + Math.round(input.gain * 100) + "%，每代耗时 " +
      input.time + " 个月，瓶颈强度 " + input.bottleneck.toFixed(2) + "，共 100 代。");
  }

  function showChartFallback() {
    const fallback = $("chart-fallback");
    const canvas = $("sim-chart");
    const status = $("chart-loading-status");
    if (canvas) canvas.hidden = true;
    if (fallback) fallback.hidden = false;
    if (status) status.textContent = "Chart.js 未能加载，已切换到数据表。";
    renderSimulatorTable();
  }

  function chartLoaded() {
    return typeof window.Chart !== "undefined" && typeof window.Chart === "function";
  }

  function waitForChart(timeout) {
    return new Promise(function (resolve) {
      const started = Date.now();
      if (chartLoaded()) {
        resolve(true);
        return;
      }
      const timer = window.setInterval(function () {
        if (chartLoaded()) {
          window.clearInterval(timer);
          resolve(true);
        } else if (window.__chartLoadFailed || Date.now() - started >= timeout) {
          window.clearInterval(timer);
          resolve(false);
        }
      }, 200);
    });
  }

  function prepareChart() {
    if (state.chartTried) return;
    state.chartTried = true;
    if (chartLoaded()) {
      renderSimulatorTable();
      renderChart();
      return;
    }
    const status = $("chart-loading-status");
    if (status) status.textContent = "正在加载 Chart.js。";
    waitForChart(window.__chartLoadFailed ? 700 : 8000).then(function (ok) {
      if (ok) {
        renderSimulatorTable();
        renderChart();
        if (status) status.textContent = "Chart.js 已加载。";
      } else {
        showChartFallback();
      }
    });
  }

  function retryChart() {
    const button = $("chart-retry");
    const status = $("chart-loading-status");
    if (button) {
      button.disabled = true;
      button.textContent = "正在重试…";
    }
    if (status) status.textContent = "正在重新加载 Chart.js。";
    window.__chartLoadFailed = false;

    const script = document.createElement("script");
    script.src = CHART_CDN + "?retry=" + Date.now();
    script.async = true;
    script.onload = function () {
      waitForChart(8000).then(function (ok) {
        if (button) {
          button.disabled = false;
          button.textContent = "重试加载 Chart.js";
        }
        if (ok) {
          renderSimulatorTable();
          renderChart();
          if (status) status.textContent = "Chart.js 重试成功。";
        } else {
          showChartFallback();
        }
      });
    };
    script.onerror = function () {
      window.__chartLoadFailed = true;
      if (button) {
        button.disabled = false;
        button.textContent = "重试加载 Chart.js";
      }
      showChartFallback();
    };
    document.head.appendChild(script);
  }

  function renderSimulatorTable() {
    const body = $("sim-table-body");
    if (!body) return;
    const input = currentSimInput();
    const series = simulate(input.gain, input.bottleneck, 100);
    const rows = [0, 1, 5, 10, 25, 50, 75, 100];
    body.innerHTML = rows.map(function (index) {
      const years = (index * input.time) / 12;
      return "<tr><td>" + index + "</td><td>" + escapeHtml(formatYears(years)) + "</td><td>" +
        escapeHtml(formatMultiple(series.values[index])) + "</td></tr>";
    }).join("");
  }

  function renderSimulator() {
    const input = currentSimInput();
    const outGain = $("out-gain");
    const outTime = $("out-time");
    const outBottleneck = $("out-bottleneck");
    if (outGain) outGain.textContent = Math.round(input.gain * 100) + "%";
    if (outTime) outTime.textContent = input.time + " 个月";
    if (outBottleneck) outBottleneck.textContent = input.bottleneck.toFixed(2);

    const extended = simulate(input.gain, input.bottleneck, 100);
    const finalValue = extended.values[100];
    const series100 = extended.values;

    const finalNode = $("out-final");
    const yearsNode = $("out-years");
    const tenNode = $("out-10y");
    const thirtyNode = $("out-30y");
    const inflectionNode = $("out-inflection");
    const inflectionNote = $("out-inflection-note");
    const verdictNode = $("sim-verdict");

    if (finalNode) finalNode.textContent = formatMultiple(finalValue);
    if (yearsNode) yearsNode.textContent = "100 代 ≈ " + formatYears((100 * input.time) / 12);

    const needed30 = Math.max(100, Math.ceil((30 * 12) / Math.max(0.5, input.time)));
    const extended30 = simulate(input.gain, input.bottleneck, needed30).values;
    if (tenNode) tenNode.textContent = formatMultiple(valueAtYears(extended30, input.time, 10));
    if (thirtyNode) thirtyNode.textContent = formatMultiple(valueAtYears(extended30, input.time, 30));

    const halfCap = extended.cap / 2;
    let inflectionIndex = -1;
    for (let i = 0; i < series100.length; i += 1) {
      if (series100[i] >= halfCap) {
        inflectionIndex = i;
        break;
      }
    }
    if (inflectionNode) {
      inflectionNode.textContent = inflectionIndex >= 0 ? "第 " + inflectionIndex + " 代" : "100 代内未出现";
    }
    if (inflectionNote) {
      inflectionNote.textContent = inflectionIndex >= 0
        ? "≈ " + formatYears((inflectionIndex * input.time) / 12) + " 达到 K/2；之后每代增速递减"
        : "曲线尚未到达上限一半；上限 K = " + formatMultiple(extended.cap).replace("×", "");
    }

    if (verdictNode) {
      let verdict = "在这组参数下，模型在 100 代内给出 " + formatMultiple(finalValue) + "。";
      if (inflectionIndex >= 0) {
        verdict += " S 曲线中段出现在第 " + inflectionIndex + " 代；之后增益相对上限变小。";
      } else {
        verdict += " 100 代内尚未到达 K/2，曲线仍处早段。";
      }
      verdict += " 该曲线只由三个滑杆与一个公式决定，不是经验预测。";
      verdictNode.textContent = verdict;
    }

    renderSimulatorTable();

    if (state.chart) {
      const series = simulate(input.gain, input.bottleneck, 100);
      const labels = series.values.map(function (_, index) { return String(index); });
      state.chart.data.labels = labels;
      state.chart.data.datasets[0].data = series.values;
      state.chart.data.datasets[1].data = series.values.map(function () { return 10; });
      state.chart.update("none");
      const canvas = $("sim-chart");
      if (canvas) {
        canvas.setAttribute("aria-label",
          "示意模型曲线：每代增益 " + Math.round(input.gain * 100) + "%，每代耗时 " +
          input.time + " 个月，瓶颈强度 " + input.bottleneck.toFixed(2) + "，共 100 代。");
      }
    }
  }

  function scheduleSimulator() {
    if (state.simFrame) return;
    state.simFrame = window.requestAnimationFrame(function () {
      state.simFrame = null;
      renderSimulator();
    });
  }

  function initSimulator() {
    const gain = $("sim-gain");
    const time = $("sim-time");
    const bottleneck = $("sim-bottleneck");
    if (!gain || !time || !bottleneck) return;

    [gain, time, bottleneck].forEach(function (input) {
      input.addEventListener("input", scheduleSimulator);
    });

    const reset = $("sim-reset");
    if (reset) {
      reset.addEventListener("click", function () {
        gain.value = String(SIM_DEFAULTS.gain);
        time.value = String(SIM_DEFAULTS.time);
        bottleneck.value = String(SIM_DEFAULTS.bottleneck);
        renderSimulator();
      });
    }

    const retry = $("chart-retry");
    if (retry) retry.addEventListener("click", retryChart);

    renderSimulator();
    prepareChart();
  }

  /* -----------------------------------------------------------------------
     阅读清单
     ----------------------------------------------------------------------- */
  function readingError(message) {
    const groups = $("reading-groups");
    if (!groups) return;
    groups.innerHTML = '<div class="load-error" role="status">' +
      "<h3>无法加载阅读清单</h3>" +
      "<p>" + escapeHtml(message) + "</p>" +
      "<p>请确认页面通过本地 HTTP 服务打开，例如在项目目录运行 <code>python -m http.server 8000</code>。</p>" +
      '<button class="button button--small" type="button" data-retry-papers>重新加载</button>' +
    "</div>";
  }

  function renderPapers(data) {
    const groups = $("reading-groups");
    if (!groups) return;
    const list = Array.isArray(data.groups) ? data.groups : [];

    groups.innerHTML = list.map(function (group) {
      const items = group.items || [];
      return '<section class="reading-group" aria-labelledby="reading-group-' + escapeHtml(group.id) + '">' +
        '<div class="reading-group-head">' +
          "<div>" +
            '<h3 id="reading-group-' + escapeHtml(group.id) + '">' + escapeHtml(group.name) + "</h3>" +
            "<p>" + escapeHtml(group.description) + "</p>" +
          "</div>" +
          '<span class="group-count">' + items.length + " 条</span>" +
        "</div>" +
        '<div class="reading-list">' +
          items.map(function (item) {
            const verified = item.status === "verified";
            return '<article class="reading-item">' +
              '<div class="reading-meta"><span>' + escapeHtml(item.year) + "</span><span>" +
                escapeHtml(item.type) + "</span><span>" + escapeHtml(item.authors) + "</span></div>" +
              "<h4>" + escapeHtml(item.title) + "</h4>" +
              '<p class="reading-intro">' + escapeHtml(item.intro) + "</p>" +
              '<a href="' + escapeHtml(item.link) + '" target="_blank" rel="noopener noreferrer">打开入口</a> ' +
              '<span class="status-line' + (verified ? "" : " status-line--pending") + '">' +
                (verified ? "链接已核查" : "链接待核实") + "</span>" +
            "</article>";
          }).join("") +
        "</div>" +
      "</section>";
    }).join("");

    const total = list.reduce(function (sum, group) {
      return sum + (group.items ? group.items.length : 0);
    }, 0);
    setStat("papers", total);
  }

  function loadPapers() {
    if (state.papersLoading) return;
    state.papersLoading = true;
    const groups = $("reading-groups");
    if (groups) {
      groups.setAttribute("aria-busy", "true");
      groups.innerHTML = '<p class="inline-note">正在加载阅读清单…</p>';
    }

    fetchJson("data/papers.json").then(function (data) {
      state.papersLoaded = true;
      state.papersLoading = false;
      if (groups) groups.setAttribute("aria-busy", "false");
      renderPapers(data);
    }).catch(function (error) {
      state.papersLoading = false;
      if (groups) groups.setAttribute("aria-busy", "false");
      readingError(error && error.message ? error.message : "网络或文件读取错误。");
    });
  }

  function initReading() {
    const groups = $("reading-groups");
    if (groups) {
      groups.addEventListener("click", function (event) {
        if (event.target.closest("[data-retry-papers]")) loadPapers();
      });
    }
    loadPapers();
  }

  /* -----------------------------------------------------------------------
     打印
     ----------------------------------------------------------------------- */
  function initPrint() {
    window.addEventListener("beforeprint", function () {
      document.querySelectorAll("details").forEach(function (details) {
        if (!details.open) {
          details.open = true;
          details.setAttribute("data-print-opened", "true");
        }
      });
    });

    window.addEventListener("afterprint", function () {
      document.querySelectorAll("details[data-print-opened]").forEach(function (details) {
        details.open = false;
        details.removeAttribute("data-print-opened");
      });
    });
  }

  /* -----------------------------------------------------------------------
     初始化
     ----------------------------------------------------------------------- */
  function init() {
    if (!CONTENT) {
      const grid = $("evidence-grid");
      if (grid) {
        grid.setAttribute("aria-busy", "false");
        grid.innerHTML = '<div class="load-error" role="status"><h3>内容脚本未加载</h3>' +
          "<p>请确认 js/content.js 与 js/app.js 均可访问，并通过本地 HTTP 服务打开页面。</p></div>";
      }
      return;
    }

    initTheme();
    initMobileMenu();
    initScrollUi();

    setStat("sections", 10);
    setStat("timeline", (CONTENT.timeline || []).length);
    renderTimeline();
    renderAttacks();
    renderMechanisms();
    renderPositions();
    renderViewpoints();
    renderRiskChain();
    renderSafetyConcepts();
    renderGovernance();
    renderCriticisms();
    renderGlossary();
    initTooltips();
    initChecklist();
    initSimulator();
    initPrint();
    initEvidence();
    initReading();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
