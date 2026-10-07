/* Динамика мини-wiki: диаграммы Mermaid и SVG с анимацией и полноэкранным просмотром,
   интерактивная BPMN-модель (bpmn-js), появление блоков при прокрутке, счётчики, подбор нотации. */
(() => {
  "use strict";
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BPMN_JS = "https://cdn.jsdelivr.net/npm/bpmn-js@17.11.1/dist/bpmn-navigated-viewer.production.min.js";
  const BPMN_CSS = ["https://cdn.jsdelivr.net/npm/bpmn-js@17.11.1/dist/assets/diagram-js.css",
                    "https://cdn.jsdelivr.net/npm/bpmn-js@17.11.1/dist/assets/bpmn-js.css"];
  let uid = 0;

  const dark = () => document.body.getAttribute("data-md-color-scheme") === "slate";
  const loadScript = (src) => new Promise((ok, fail) => {
    if ([...document.scripts].some((s) => s.src === src)) return ok();
    const s = Object.assign(document.createElement("script"), { src, onload: ok, onerror: fail });
    document.head.appendChild(s);
  });
  const loadCss = (href) => {
    if (![...document.styleSheets].some((s) => s.href === href)) {
      document.head.appendChild(Object.assign(document.createElement("link"), { rel: "stylesheet", href }));
    }
  };

  /* ---------- Mermaid ---------- */
  function mermaidConfig() {
    const d = dark();
    return {
      startOnLoad: false, securityLevel: "loose", theme: "base",
      fontFamily: "Inter, 'Segoe UI', Arial, sans-serif",
      themeVariables: {
        fontSize: "15px",
        primaryColor: d ? "#16244a" : "#eef2fb", primaryBorderColor: d ? "#7aa2ff" : "#0b1b3f",
        primaryTextColor: d ? "#e8edf8" : "#0f172a", lineColor: d ? "#9fb4e8" : "#0b1b3f",
        secondaryColor: d ? "#2a2140" : "#fff4ea", tertiaryColor: d ? "#121b30" : "#ffffff",
        noteBkgColor: "#fff4ea", noteBorderColor: "#ff8a3d", actorBkg: d ? "#16244a" : "#eef2fb",
        actorBorder: d ? "#7aa2ff" : "#0b1b3f", signalColor: d ? "#cdd8f3" : "#0b1b3f",
        edgeLabelBackground: d ? "#0d1424" : "#ffffff", clusterBkg: d ? "#121b30" : "#f6f8fc",
      },
      flowchart: { curve: "basis", padding: 14, nodeSpacing: 45, rankSpacing: 50, htmlLabels: true },
      er: { fontSize: 14, layoutDirection: "TB" },
      sequence: { mirrorActors: false, messageAlign: "center", actorMargin: 60 },
    };
  }

  async function renderMermaid(root) {
    const blocks = root.querySelectorAll("pre.lh-mermaid, div.lh-mermaid");
    if (!blocks.length) return;
    if (!window.mermaid) return;
    mermaid.initialize(mermaidConfig());
    for (const pre of blocks) {
      const src = pre.textContent;
      const fig = figure(pre.dataset.title || captionFor(pre));
      fig.dataset.src = src;
      fig.dataset.kind = "mermaid";
      pre.replaceWith(fig);
      await drawMermaid(fig);
    }
  }

  async function drawMermaid(fig) {
    const body = fig.querySelector(".lh-fig__body");
    try {
      const { svg, bindFunctions } = await mermaid.render(`lhm${++uid}`, fig.dataset.src);
      body.innerHTML = svg;
      bindFunctions?.(body);
      const el = body.querySelector("svg");
      el.removeAttribute("height");
      el.style.maxWidth = el.style.maxWidth || "100%";
      prepare(fig);
    } catch (e) {
      body.innerHTML = `<p class="lh-fig__err">Не удалось построить диаграмму: ${e.message}</p>`;
    }
  }

  async function rerenderMermaid() {
    if (!window.mermaid) return;
    mermaid.initialize(mermaidConfig());
    for (const fig of document.querySelectorAll('.lh-fig[data-kind="mermaid"]')) await drawMermaid(fig);
  }

  /* ---------- SVG-картинки → встроенный SVG ---------- */
  async function inlineSvgs(root) {
    const imgs = [...root.querySelectorAll('article img[src$=".svg"]')].filter((i) => !i.closest(".lh-fig, .lh-hero, .lh-bpmn"));
    await Promise.all(imgs.map(async (img) => {
      try {
        const text = await (await fetch(img.src)).text();
        const fig = figure(img.alt);
        fig.dataset.kind = "svg";
        fig.querySelector(".lh-fig__body").innerHTML = text.slice(text.indexOf("<svg"));
        const p = img.closest("p");
        (p && p.childElementCount === 1 ? p : img).replaceWith(fig);
        prepare(fig);
      } catch (e) { /* оставить картинку как есть */ }
    }));
  }

  function captionFor(el) {
    const tab = el.closest(".tabbed-block");
    if (tab) {
      const set = tab.closest(".tabbed-set");
      const i = [...tab.parentElement.children].indexOf(tab);
      const lab = set?.querySelectorAll(".tabbed-labels > label")[i];
      if (lab) return lab.textContent.trim();
    }
    const heads = [...document.querySelectorAll(".md-content h2")]
      .filter((h) => h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    const h1 = document.querySelector(".md-content h1");
    const h = heads.pop();
    const clean = (t) => t.replace(/¶/g, "").trim();
    const page = h1 ? clean(h1.textContent).split("–")[0].trim() : "";
    const sect = h ? clean(h.textContent).replace(/^Пример:\s*/i, "") : "";
    return [page, sect].filter(Boolean).join(" · ");
  }

  /* ---------- Обёртка диаграммы ---------- */
  function figure(caption) {
    const fig = document.createElement("figure");
    fig.className = "lh-fig lh-reveal";
    fig.innerHTML = `<div class="lh-fig__bar">
        <span class="lh-fig__cap"></span>
        <button type="button" class="lh-fig__btn" data-act="play" title="Повторить анимацию">▶ Анимация</button>
        <button type="button" class="lh-fig__btn" data-act="zoom" title="Открыть во весь экран">⤢ Увеличить</button>
      </div><div class="lh-fig__body"></div>`;
    fig.querySelector(".lh-fig__cap").textContent = caption;
    fig.querySelector('[data-act="zoom"]').onclick = () => lightbox(fig);
    fig.querySelector('[data-act="play"]').onclick = () => animate(fig, true);
    fig.querySelector(".lh-fig__body").addEventListener("dblclick", () => lightbox(fig));
    return fig;
  }

  function parts(svg) {
    const edges = svg.querySelectorAll(
      ".e, path.flowchart-link, .relationshipLine, .messageLine0, .messageLine1, .transition, path.relation, line.e");
    const nodes = svg.querySelectorAll(
      ".n, g.node, g.entityBox, .er.entityBox, g.actor, rect.actor, g.statediagram-state, g.classGroup, " +
      ".label-container, .lt, .lbg, text.actor, g.cluster");
    return { edges: [...edges].filter((e) => typeof e.getTotalLength === "function"), nodes: [...nodes] };
  }

  function prepare(fig) {
    fig.classList.add("lh-ready");
    if (fig.classList.contains("lh-in")) animate(fig);
  }

  function animate(fig, force = false) {
    if (REDUCED || (!force && fig.dataset.played)) return;
    fig.dataset.played = "1";
    const svg = fig.querySelector(".lh-fig__body svg");
    if (!svg) return;
    const { edges, nodes } = parts(svg);
    nodes.forEach((n, i) => n.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
      { duration: 380, delay: Math.min(i * 22, 900), easing: "ease-out", fill: "backwards" }));
    edges.forEach((p, i) => {
      let len = 0;
      try { len = p.getTotalLength(); } catch (e) { return; }
      if (!len) return;
      const keep = p.getAttribute("stroke-dasharray");
      p.style.strokeDasharray = `${len} ${len}`;
      const a = p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: 700, delay: 250 + Math.min(i * 45, 1400), easing: "ease-in-out", fill: "backwards" });
      a.onfinish = () => { p.style.strokeDasharray = keep ? "" : ""; };
    });
  }

  /* ---------- Полноэкранный просмотр с масштабом и перемещением ---------- */
  function lightbox(fig) {
    const svg = fig.querySelector(".lh-fig__body svg, .lh-fig__body .djs-container svg");
    if (!svg && !fig.querySelector(".lh-bpmn__canvas")) return;
    const box = document.createElement("div");
    box.className = "lh-lightbox";
    box.innerHTML = `<div class="lh-lightbox__bar"><b></b>
        <button data-z="1.25">＋</button><button data-z="0.8">−</button><button data-z="fit">По размеру</button>
        <button data-z="close" title="Esc">✕</button></div><div class="lh-lightbox__stage"></div>
        <div class="lh-lightbox__hint">колесо – масштаб · перетаскивание – перемещение · Esc – закрыть</div>`;
    box.querySelector("b").textContent = fig.querySelector(".lh-fig__cap").textContent;
    const stage = box.querySelector(".lh-lightbox__stage");
    const clone = svg.cloneNode(true);
    clone.removeAttribute("width"); clone.removeAttribute("height");
    clone.style.maxWidth = "none";
    const vb = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width)
      ? svg.viewBox.baseVal : svg.getBBox();
    clone.setAttribute("width", vb.width); clone.setAttribute("height", vb.height);
    const wrap = document.createElement("div");
    wrap.className = "lh-lightbox__wrap";
    wrap.appendChild(clone);
    stage.appendChild(wrap);
    document.body.appendChild(box);
    document.documentElement.classList.add("lh-noscroll");
    let k = 1, x = 0, y = 0;
    const apply = () => { wrap.style.transform = `translate(${x}px, ${y}px) scale(${k})`; };
    const fit = () => {
      const r = stage.getBoundingClientRect();
      k = Math.min((r.width - 40) / vb.width, (r.height - 40) / vb.height);
      x = (r.width - vb.width * k) / 2; y = (r.height - vb.height * k) / 2; apply();
    };
    const zoom = (f, cx, cy) => {
      const r = stage.getBoundingClientRect();
      cx = cx ?? r.width / 2; cy = cy ?? r.height / 2;
      x = cx - (cx - x) * f; y = cy - (cy - y) * f; k *= f; apply();
    };
    const close = () => { box.remove(); document.documentElement.classList.remove("lh-noscroll"); removeEventListener("keydown", key); };
    const key = (e) => { if (e.key === "Escape") close(); };
    addEventListener("keydown", key);
    box.querySelector(".lh-lightbox__bar").addEventListener("click", (e) => {
      const z = e.target.dataset.z;
      if (z === "close") close(); else if (z === "fit") fit(); else if (z) zoom(+z);
    });
    stage.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    let drag = null;
    stage.addEventListener("pointerdown", (e) => { drag = [e.clientX - x, e.clientY - y]; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener("pointermove", (e) => { if (drag) { x = e.clientX - drag[0]; y = e.clientY - drag[1]; apply(); } });
    stage.addEventListener("pointerup", () => { drag = null; });
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    requestAnimationFrame(fit);
  }

  /* ---------- BPMN: интерактивная модель ---------- */
  async function initBpmn(root) {
    for (const host of root.querySelectorAll(".lh-bpmn:not(.lh-ready)")) {
      host.classList.add("lh-ready");
      const fallback = host.innerHTML;
      host.classList.add("lh-fig", "lh-reveal");
      host.innerHTML = `<div class="lh-fig__bar"><span class="lh-fig__cap">${host.dataset.title || "BPMN-модель"}</span>
          <button type="button" class="lh-fig__btn" data-b="run">▶ Пройти процесс</button>
          <button type="button" class="lh-fig__btn" data-b="in">＋</button>
          <button type="button" class="lh-fig__btn" data-b="out">−</button>
          <button type="button" class="lh-fig__btn" data-b="fit">По размеру</button>
          <button type="button" class="lh-fig__btn" data-b="full">⤢ Во весь экран</button></div>
        <div class="lh-bpmn__canvas"></div><div class="lh-bpmn__step" aria-live="polite"></div>`;
      try {
        BPMN_CSS.forEach(loadCss);
        await loadScript(BPMN_JS);
        const xml = await (await fetch(host.dataset.src)).text();
        const viewer = new BpmnJS({ container: host.querySelector(".lh-bpmn__canvas") });
        await viewer.importXML(xml);
        const canvas = viewer.get("canvas");
        canvas.zoom("fit-viewport", "auto");
        bpmnControls(host, viewer);
      } catch (e) {  // нет доступа к CDN – показать статичную картинку модели
        const tmp = document.createElement("div");
        tmp.innerHTML = fallback;
        const parent = host.parentElement;
        host.replaceWith(...tmp.childNodes);
        inlineSvgs(parent);
      }
    }
  }

  function bpmnControls(host, viewer) {
    const canvas = viewer.get("canvas");
    const reg = viewer.get("elementRegistry");
    const step = host.querySelector(".lh-bpmn__step");
    let timer = null;
    const stop = () => { clearTimeout(timer); timer = null; reg.getAll().forEach((e) => canvas.removeMarker(e.id, "lh-hl")); };
    host.querySelector(".lh-fig__bar").addEventListener("click", (e) => {
      const b = e.target.dataset.b;
      if (b === "in") canvas.zoom(canvas.zoom() * 1.2);
      if (b === "out") canvas.zoom(canvas.zoom() / 1.2);
      if (b === "fit") canvas.zoom("fit-viewport", "auto");
      if (b === "full") {
        host.classList.toggle("lh-bpmn--full");
        document.documentElement.classList.toggle("lh-noscroll", host.classList.contains("lh-bpmn--full"));
        setTimeout(() => { canvas.resized(); canvas.zoom("fit-viewport", "auto"); }, 60);
      }
      if (b === "run") {
        if (timer) { stop(); step.textContent = ""; e.target.textContent = "▶ Пройти процесс"; return; }
        e.target.textContent = "■ Остановить";
        canvas.zoom(0.62);
        const start = reg.filter((el) => el.type === "bpmn:StartEvent")[0];
        let cur = start, n = 0;
        const seen = new Set();
        const tick = () => {
          if (!cur || seen.has(cur.id)) { step.textContent = "Процесс пройден по основному пути ✓"; timer = null;
            e.target.textContent = "▶ Пройти процесс";
            setTimeout(() => { stop(); canvas.zoom("fit-viewport", "auto"); }, 1600); return; }
          seen.add(cur.id);
          canvas.addMarker(cur.id, "lh-hl");
          try { canvas.scrollToElement(cur, { top: 140, bottom: 140, left: 260, right: 260 }); } catch (err) { /* старые версии */ }
          const name = cur.businessObject.name;
          if (name && !/Flow$/.test(cur.type)) step.textContent = `${++n}. ${name.replace(/\s+/g, " ")}`;
          const outs = (cur.outgoing || []).filter((c) => c.type === "bpmn:SequenceFlow");
          // на шлюзах выбирается «положительная» ветвь (Да / корректна / нет замечаний)
          const pick = outs.find((c) => /^(да|нет замечаний|да,|корректна)/i.test(c.businessObject.name || "")) ||
                       outs.find((c) => !/^нет/i.test(c.businessObject.name || "")) || outs[0];
          if (pick) { canvas.addMarker(pick.id, "lh-hl"); cur = pick.target; } else cur = null;
          timer = setTimeout(tick, cur && /Event$/.test(cur.type) ? 500 : 750);
        };
        tick();
      }
    });
  }

  /* ---------- Появление при прокрутке ---------- */
  let io;
  function reveal(root) {
    const els = root.querySelectorAll(
      ".md-typeset h2, .md-typeset .md-typeset__table, .md-typeset .admonition, .md-typeset .grid.cards > ul > li, " +
      ".md-typeset .tabbed-set, .lh-fig, .lh-pick, .md-typeset ol > li, .lh-stat");
    if (REDUCED || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("lh-in")); return; }
    io = io || new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("lh-in");
      if (en.target.classList.contains("lh-fig")) animate(en.target);
      io.unobserve(en.target);
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((e, i) => { e.classList.add("lh-reveal"); e.style.setProperty("--d", `${(i % 6) * 60}ms`); io.observe(e); });
  }

  /* ---------- Счётчики, бегущая строка, наклон карточек ---------- */
  function counters(root) {
    root.querySelectorAll("[data-count]").forEach((el) => {
      const to = +el.dataset.count;
      if (REDUCED) { el.textContent = to; return; }
      const t0 = performance.now(), dur = 1300;
      const f = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - (1 - p) ** 3));
        if (p < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
    root.querySelectorAll(".lh-rotator").forEach((el) => {
      const words = el.dataset.words.split("|");
      let i = 0;
      if (REDUCED || el.dataset.on) return;
      el.dataset.on = "1";
      setInterval(() => { el.classList.add("lh-out");
        setTimeout(() => { i = (i + 1) % words.length; el.textContent = words[i]; el.classList.remove("lh-out"); }, 280); }, 2400);
    });
    root.querySelectorAll(".md-typeset .grid.cards > ul > li").forEach((card) => {
      if (REDUCED) return;
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -5, ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
        card.style.setProperty("--mx", `${e.clientX - r.left}px`); card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Матрица сравнения и подбор нотации ---------- */
  function matrix(root) {
    root.querySelectorAll(".md-typeset table").forEach((t) => {
      const head = [...t.querySelectorAll("thead th")].map((th) => th.textContent.trim());
      if (!head.includes("Порядок шагов")) return;
      t.dataset.matrix = "1";
      t.querySelectorAll("td").forEach((td) => {
        const v = td.textContent.trim();
        if (v === "●") td.dataset.v = "full"; else if (v === "◐") td.dataset.v = "half"; else if (v === "–") td.dataset.v = "none";
      });
      t.addEventListener("pointerover", (e) => {
        const cell = e.target.closest("td, th");
        if (!cell) return;
        const col = cell.cellIndex;
        t.querySelectorAll(".lh-col").forEach((c) => c.classList.remove("lh-col"));
        if (col > 0) t.querySelectorAll("tr").forEach((tr) => tr.children[col]?.classList.add("lh-col"));
      });
      t.addEventListener("pointerleave", () => t.querySelectorAll(".lh-col").forEach((c) => c.classList.remove("lh-col")));
    });
    root.querySelectorAll(".lh-pick").forEach((w) => {
      const out = w.querySelector(".lh-pick__out");
      w.querySelectorAll("button[data-n]").forEach((b) => b.addEventListener("click", () => {
        w.querySelectorAll("button").forEach((x) => x.classList.toggle("lh-on", x === b));
        const card = w.querySelector(`template[data-n="${b.dataset.n}"]`);
        out.classList.remove("lh-show");
        requestAnimationFrame(() => { out.innerHTML = card.innerHTML; out.classList.add("lh-show"); });
      }));
    });
  }

  /* ---------- Полоса прогресса чтения ---------- */
  function progress() {
    let bar = document.querySelector(".lh-progress");
    if (!bar) { bar = document.createElement("div"); bar.className = "lh-progress"; document.body.appendChild(bar);
      addEventListener("scroll", () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      }, { passive: true }); }
  }

  async function init() {
    const root = document.querySelector(".md-container") || document;
    progress();
    counters(document);
    matrix(root);
    await inlineSvgs(root);
    await renderMermaid(root);
    await initBpmn(root);
    reveal(root);
  }

  // вкладки: диаграмма в только что открытой вкладке сразу показывается и анимируется
  document.addEventListener("change", (e) => {
    const set = e.target.closest?.(".tabbed-set");
    if (!set) return;
    requestAnimationFrame(() => set.querySelectorAll(".lh-fig, .lh-reveal").forEach((el) => {
      if (el.offsetParent === null) return;
      el.classList.add("lh-in");
      if (el.classList.contains("lh-fig")) animate(el);
    }));
  });

  new MutationObserver(() => rerenderMermaid())
    .observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] });
  if (window.document$) window.document$.subscribe(() => init());
  else document.addEventListener("DOMContentLoaded", init);
})();
