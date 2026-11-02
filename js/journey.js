/* =========================================================
   journey.js — "The Journey": scroll-driven night road
   • Builds a winding SVG road through every station pin.
   • A glowing traveler drives along it as you scroll, lighting the road
     behind it while fog hides what's ahead.
   • Each station unlocks (decodes) the first time the traveler reaches it.
   Content lives in index.html (<li class="station">) — nothing to edit here.
   ========================================================= */

(() => {
  "use strict";

  const road = document.getElementById("road");
  if (!road) return;

  const stations = [...road.querySelectorAll(".station")];
  const pins = stations.map((s) => s.querySelector(".station__pin"));
  const startEl = road.querySelector(".road__start span");
  const hudYear = document.getElementById("roadHudYear");
  const hudBar = document.getElementById("roadHudBar");
  const hudCount = document.getElementById("roadHudCount");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SVG = "http://www.w3.org/2000/svg";
  const total = String(stations.length).padStart(2, "0");

  /* ---------- Decode-able text (real text stays for screen readers) ---------- */
  const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$/<>";
  const rand = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  const scramble = (txt) => [...txt].map((c) => (c === " " ? " " : rand())).join("");

  const glyphTargets = [];
  stations.forEach((st) => {
    st.querySelectorAll(".station__year, .station__title").forEach((el) => {
      const text = el.textContent.trim();
      el.innerHTML = "";
      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = text;
      const vis = document.createElement("span");
      vis.className = "glyphs";
      vis.setAttribute("aria-hidden", "true");
      vis.textContent = text;
      el.append(sr, vis);
      glyphTargets.push({ station: st, el: vis, text });
    });
  });

  const decode = (target, duration = 900) => {
    const { el, text } = target;
    target.decoding = true;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const shown = Math.floor(t * text.length);
      el.textContent = [...text].map((c, i) => (i < shown || c === " " ? c : rand())).join("");
      if (t < 1) requestAnimationFrame(step);
      else { el.textContent = text; target.decoding = false; }
    };
    requestAnimationFrame(step);
  };

  /* ---------- Reduced motion: show the whole road, no driving ---------- */
  if (reduced.matches) {
    stations.forEach((s) => s.classList.add("is-reached"));
  }

  /* ---------- SVG road ---------- */
  const svg = document.createElementNS(SVG, "svg");
  svg.classList.add("road__svg");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `
    <defs>
      <linearGradient id="rdFade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
        <stop class="rd-f0" offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop class="rd-f1" offset=".03" stop-color="#fff" stop-opacity="1"/>
        <stop class="rd-f2" offset=".9" stop-color="#fff" stop-opacity="1"/>
        <stop class="rd-f3" offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <mask id="rdEnds" maskUnits="userSpaceOnUse"><rect class="rd-ends" x="-2000" y="0" width="6000" height="1000" fill="url(#rdFade)"/></mask>
      <mask id="rdLit" maskUnits="userSpaceOnUse"><path class="rd-mask" fill="none" stroke="#fff" stroke-linecap="round"/></mask>
      <radialGradient id="rdPool"><stop offset="0" stop-color="#c6ff34" stop-opacity=".42"/><stop offset=".5" stop-color="#c6ff34" stop-opacity=".1"/><stop offset="1" stop-color="#c6ff34" stop-opacity="0"/></radialGradient>
      <linearGradient id="rdBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c6ff34" stop-opacity=".45"/><stop offset="1" stop-color="#c6ff34" stop-opacity="0"/></linearGradient>
      <filter id="rdBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
    </defs>
    <g mask="url(#rdEnds)">
      <path class="rd-p road__edge" fill="none" stroke-linecap="round"/>
      <path class="rd-p road__asphalt" fill="none" stroke-linecap="round"/>
      <path class="rd-p road__dash" fill="none" stroke-width="2" stroke-dasharray="12 18"/>
      <g mask="url(#rdLit)">
        <path class="rd-p road__lit-glow" fill="none" filter="url(#rdBlur)"/>
        <path class="rd-p road__lit-edge" fill="none" stroke-linecap="round"/>
        <path class="rd-p road__lit-asphalt" fill="none" stroke-linecap="round"/>
        <path class="rd-p road__dash-lit" fill="none" stroke-width="2.5" stroke-dasharray="12 18"/>
      </g>
    </g>
    <g class="road__traveler">
      <circle r="110" fill="url(#rdPool)"/>
      <path class="rd-beam" d="M0,0 L170,-56 A178,178 0 0 1 170,56 Z" fill="url(#rdBeam)"/>
      <circle class="road__halo" r="12"/>
      <circle class="road__core" r="8"/>
      <circle class="road__spark" r="3.2"/>
    </g>`;
  road.prepend(svg);

  const ahead = document.createElement("div");
  ahead.className = "road__ahead";
  ahead.setAttribute("aria-hidden", "true");
  svg.after(ahead);
  if (reduced.matches) ahead.hidden = true;

  const paths = [...svg.querySelectorAll(".rd-p")];
  const maskPath = svg.querySelector(".rd-mask");
  const traveler = svg.querySelector(".road__traveler");
  const measure = document.createElementNS(SVG, "path");

  let L = 0;             // total road length
  let pinLen = [];       // distance along the road to each station
  let lookup = [];       // [{ y, len }] samples for y → length
  let current = 0;       // traveler position (length)
  let target = 0;

  // Smooth curve through points (Catmull-Rom → cubic Bézier)
  const curve = (pts) => {
    let d = `M${pts[0].x},${pts[0].y}`;
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
      const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
      const seg = ` C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
      segs.push(seg);
      d += seg;
    }
    return { d, start: `M${pts[0].x},${pts[0].y}`, segs };
  };

  const build = () => {
    const box = road.getBoundingClientRect();
    const W = box.width;
    const H = road.offsetHeight;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const roadW = wide ? 46 : 20;

    const center = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    };
    const s = center(startEl);
    const pinPts = pins.map(center);
    const last = pinPts[pinPts.length - 1];
    const tail = { x: wide ? W / 2 : last.x, y: H };
    const pts = [s, ...pinPts, tail];

    const { d, start, segs } = curve(pts);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    paths.forEach((p) => p.setAttribute("d", d));
    svg.querySelector(".road__edge").setAttribute("stroke-width", roadW + 10);
    svg.querySelector(".road__asphalt").setAttribute("stroke-width", roadW);
    svg.querySelector(".road__lit-edge").setAttribute("stroke-width", roadW + 4);
    svg.querySelector(".road__lit-asphalt").setAttribute("stroke-width", roadW);
    svg.querySelector(".road__lit-glow").setAttribute("stroke-width", roadW * 2.6);
    maskPath.setAttribute("d", d);
    maskPath.setAttribute("stroke-width", roadW * 3 + 40);

    // fade the very start and the tail into the dark
    svg.querySelector("#rdFade").setAttribute("y2", H);
    svg.querySelector(".rd-ends").setAttribute("height", H);
    svg.querySelector(".rd-f1").setAttribute("offset", (Math.min(0.5, (s.y + 10) / H)).toFixed(3));
    svg.querySelector(".rd-f2").setAttribute("offset", (Math.min(0.99, (last.y + 30) / H)).toFixed(3));

    // lengths
    measure.setAttribute("d", d);
    L = measure.getTotalLength();
    pinLen = pinPts.map((_, i) => {
      measure.setAttribute("d", start + segs.slice(0, i + 1).join(""));
      return measure.getTotalLength();
    });
    measure.setAttribute("d", d);
    maskPath.style.strokeDasharray = `${L} ${L}`;

    // y → length lookup (road always heads downward)
    lookup = [];
    let maxY = -Infinity;
    for (let len = 0; len <= L; len += 4) {
      maxY = Math.max(maxY, measure.getPointAtLength(len).y);
      lookup.push({ y: maxY, len });
    }
    computeTarget();
    if (reduced.matches) current = target = L;
    else current = target;
    render();
  };

  const lenForY = (y) => {
    if (!lookup.length) return 0;
    if (y <= lookup[0].y) return 0;
    if (y >= lookup[lookup.length - 1].y) return L;
    let lo = 0, hi = lookup.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (lookup[mid].y < y) lo = mid; else hi = mid;
    }
    const a = lookup[lo], b = lookup[hi];
    return a.len + ((y - a.y) / Math.max(1, b.y - a.y)) * (b.len - a.len);
  };

  // the traveler sits ~58% down the screen, like a car you're following
  const computeTarget = () => {
    const anchor = window.innerHeight * 0.58 - road.getBoundingClientRect().top;
    target = lenForY(anchor);
  };

  /* ---------- Per-frame render ---------- */
  let lastReached = -1;
  const render = () => {
    if (!L) return;
    const pt = measure.getPointAtLength(current);
    const ahd = measure.getPointAtLength(Math.min(L, current + 2));
    const bhd = measure.getPointAtLength(Math.max(0, current - 2));
    const angle = (Math.atan2(ahd.y - bhd.y, ahd.x - bhd.x) * 180) / Math.PI;
    traveler.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
    traveler.style.opacity = reduced.matches || current <= 1 || current >= L - 1 ? "0" : "1";
    maskPath.style.strokeDashoffset = String(L - current);
    ahead.style.transform = `translateY(${(pt.y + 70).toFixed(0)}px)`;

    // unlock stations as they are reached
    let reachedIdx = -1;
    pinLen.forEach((len, i) => {
      if (current >= len - 6) {
        reachedIdx = i;
        const st = stations[i];
        if (!st.classList.contains("is-reached")) unlock(st);
      }
    });

    if (reachedIdx !== lastReached) {
      lastReached = reachedIdx;
      const yearEl = reachedIdx >= 0 ? stations[reachedIdx].querySelector(".station__year .sr-only") : null;
      hudYear.textContent = yearEl ? yearEl.textContent : "Start";
      hudCount.textContent = `${String(reachedIdx + 1).padStart(2, "0")} / ${total}`;
    }
    hudBar.style.transform = `scaleX(${(current / L).toFixed(4)})`;
  };

  const unlock = (st) => {
    st.classList.add("is-reached");
    const lock = st.querySelector(".station__lock");
    if (lock) lock.querySelector("b").textContent = "Reached";
    if (!reduced.matches) glyphTargets.filter((g) => g.station === st).forEach((g, i) => setTimeout(() => decode(g), i * 140));
  };

  /* ---------- Loop: ease the traveler toward its scroll target ---------- */
  let running = false;
  const tick = () => {
    const diff = target - current;
    if (Math.abs(diff) < 0.5) {
      current = target;
      render();
      running = false;
      return;
    }
    current += diff * 0.12;
    render();
    requestAnimationFrame(tick);
  };
  const kick = () => {
    computeTarget();
    if (reduced.matches) return;
    if (!running) { running = true; requestAnimationFrame(tick); }
  };

  /* ---------- Locked signal flicker (only while the road is on screen) ---------- */
  let flicker = null;
  const startFlicker = () => {
    if (flicker || reduced.matches) return;
    flicker = setInterval(() => {
      glyphTargets.forEach((g) => {
        if (g.decoding || g.station.classList.contains("is-reached")) return;
        g.el.textContent = scramble(g.text);
      });
    }, 140);
  };
  const stopFlicker = () => { clearInterval(flicker); flicker = null; };

  /* ---------- Wire up ---------- */
  if (!reduced.matches) {
    road.classList.add("is-live");
    glyphTargets.forEach((g) => { g.el.textContent = scramble(g.text); });
  }

  let inView = false;
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    road.classList.toggle("is-driving", inView && !reduced.matches);
    if (inView) { startFlicker(); kick(); } else stopFlicker();
  }, { rootMargin: "0px 0px -20% 0px" }).observe(road);

  window.addEventListener("scroll", () => { if (inView) kick(); }, { passive: true });

  let resizeTimer;
  const rebuild = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 120); };
  new ResizeObserver(rebuild).observe(road);
  window.addEventListener("resize", rebuild);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  build();
})();
