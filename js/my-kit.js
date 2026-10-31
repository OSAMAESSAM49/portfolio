/* =========================================================
   my-kit.js — "My Kit": the creative backpack experience
   =========================================================

   ✏️  EDIT YOUR EQUIPMENT HERE — each entry becomes a card.

   • name / category / description  — shown on the card
   • details                        — longer text for the detail view (falls back to description)
   • brand / model                  — optional; leave "" to hide
   • image                          — main photo (assets/images/kit/…)
   • images                         — optional extra photos for the detail view gallery

   Photos on a white background look best: the card "plate" blends the
   white into a soft studio backdrop. Missing images show a placeholder.
   On desktop the first 9 items form the floating composition; any extra
   items flow in below.
   ========================================================= */

const kitItems = [
  {
    id: "loupes",
    name: "Dental Loupes",
    category: "Dentistry",
    brand: "Univet",
    model: "3.5× magnification",
    description: "My essential magnification tool for precision dentistry.",
    details: "My dental magnification loupes. Magnification turns detail into decisions — they are with me for restorations, endodontics and surgery, because you cannot treat what you cannot see.",
    image: "assets/images/kit/loupes.jpg",
  },
  {
    id: "camera",
    name: "Camera",
    category: "Photography",
    brand: "Sony",
    model: "A7III · Full-frame",
    description: "My main photography and videography camera.",
    details: "My main photography and videography camera — behind my dental photography, portraits and the reels I produce for my clinic and for other dental centers.",
    image: "assets/images/kit/camera.jpg",
    images: ["assets/images/kit/camera-zoom.jpg"],
  },
  {
    id: "twin-flash",
    name: "Twin Flash",
    category: "Photography",
    brand: "Godox",
    model: "",
    description: "My macro photography twin flash system.",
    details: "My macro photography twin flash system with diffusers — soft, controllable light for intraoral and close-up photography that reveals texture and detail.",
    image: "assets/images/kit/twin-flash.jpg",
    images: ["assets/images/kit/twin-flash-head.jpg"],
  },
  {
    id: "ring-flash",
    name: "Ring Flash",
    category: "Photography",
    brand: "Godox",
    model: "",
    description: "My macro ring flash.",
    details: "My macro ring flash — even, shadowless light for fast and consistent clinical documentation.",
    image: "assets/images/kit/ring-flash.jpg",
  },
  {
    id: "scanner",
    name: "Intraoral Scanner",
    category: "Digital Dentistry",
    brand: "Allied Star",
    model: "",
    description: "My digital dentistry scanning device.",
    details: "My digital dentistry scanning device — digital impressions captured in 3D for a faster, more comfortable workflow from scan to design.",
    image: "assets/images/kit/scanner.jpg",
  },
  {
    id: "lens",
    name: "Camera Lens",
    category: "Photography",
    brand: "Sony",
    model: "90mm Macro",
    description: "My photography lens collection.",
    details: "My photography lens collection, led by a 90mm macro lens for true close-up dental photography.",
    image: "assets/images/kit/lens-macro.jpg",
  },
  {
    id: "lighting",
    name: "Lighting Equipment",
    category: "Videography",
    brand: "Nanlite · Godox",
    model: "",
    description: "My studio lighting setup.",
    details: "My studio lighting setup — a continuous LED light, a parabolic softbox and a tripod for portraits, interviews and video content.",
    image: "assets/images/kit/light-led.jpg",
    images: ["assets/images/kit/light-softbox.jpg", "assets/images/kit/tripod.jpg"],
  },
  {
    id: "creative-tools",
    name: "Creative Tools",
    category: "Creative Technology",
    brand: "ASUS ROG",
    model: "Zephyrus",
    description: "My essential creative production tools.",
    details: "My essential creative production tools — my ASUS ROG Zephyrus laptop is where design, video editing and AI-powered production come together.",
    image: "assets/images/kit/laptop.jpg",
    images: ["assets/images/kit/laptop-2.jpg"],
  },
  {
    id: "digital-tools",
    name: "Digital Tools",
    category: "Creative Technology",
    brand: "Lexar",
    model: "Professional",
    description: "Fast, portable storage for my photo and video work.",
    details: "Professional storage and card reading to offload, back up and carry projects between the clinic, the studio and the edit.",
    image: "assets/images/kit/storage.jpg",
  },
];

/* ========================================================= */

(() => {
  "use strict";

  const stage = document.getElementById("kitStage");
  if (!stage) return;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const bag = $("#kitBag");
  const floatEl = $(".kit-bag__float", bag);
  const list = $("#kitCards");
  const closeBtn = $("#kitClose");
  const zipPath = $("#kbZipPath");
  const zipGlows = [...stage.querySelectorAll(".kb-zipglow")];
  const slider = $("#kbSlider");

  const HATCH_OPEN_MS = 1100;   // matches --hatch-open in css/my-kit.css
  const HATCH_CLOSE_MS = 750;   // matches --hatch-close
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const T = (ms) => (reduced.matches ? 0 : ms);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const items = kitItems.map((item, i) => ({
    ...item,
    num: String(i + 1).padStart(2, "0"),
    gallery: [item.image, ...(item.images || [])].filter(Boolean),
  }));

  const categoryIcon = (cat = "") => {
    const c = cat.toLowerCase();
    if (c.includes("dent") && c.includes("digital")) return "i-ai";
    if (c.includes("dent")) return "i-tooth";
    if (c.includes("video")) return "i-video";
    if (c.includes("photo")) return "i-camera";
    if (c.includes("creative") || c.includes("tech")) return "i-pen";
    return "i-eye";
  };
  const placeholder = (cat) =>
    `<svg class="icon kit-ph" aria-hidden="true"><use href="#${categoryIcon(cat)}"/></svg>`;

  /* ---------- Screen-reader announcements ---------- */
  const status = document.createElement("p");
  status.className = "sr-only";
  status.setAttribute("aria-live", "polite");
  stage.append(status);

  /* ---------- Build the cards from data ---------- */
  const esc = (s = "") => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  list.innerHTML = items.map((item, i) => {
    const brand = [item.brand, item.model].filter(Boolean).join(" — ");
    return `
      <li class="kit-card" style="--fd:${(5 + (i % 4) * 0.7).toFixed(1)}s; --fdl:${(-i * 0.6).toFixed(1)}s">
        <button class="kit-card__btn" type="button" data-index="${i}" aria-haspopup="dialog">
          <span class="kit-card__top"><span class="kit-card__num">No.${item.num}</span><span class="kit-card__cat">${esc(item.category)}</span></span>
          <span class="kit-card__plate">${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy" decoding="async">` : ""}${placeholder(item.category)}</span>
          <span class="kit-card__name">${esc(item.name)}</span>
          ${brand ? `<span class="kit-card__brand">${esc(brand)}</span>` : ""}
          <span class="kit-card__desc">${esc(item.description)}</span>
          <span class="kit-card__foot"><span>Specs<svg class="icon" aria-hidden="true"><use href="#i-arrow-up-right"/></svg></span><span class="kit-card__code" aria-hidden="true"></span></span>
        </button>
      </li>`;
  }).join("");

  const cards = [...list.children];

  // Placeholder for missing images (never a broken image icon)
  list.querySelectorAll(".kit-card__plate").forEach((plate) => {
    const img = plate.querySelector("img");
    if (!img) { plate.classList.add("is-empty"); return; }
    img.addEventListener("error", () => plate.classList.add("is-empty"), { once: true });
  });

  // Warm the image cache before the kit is opened
  const preload = () => items.forEach((item) => item.gallery.forEach((src) => { const im = new Image(); im.src = src; }));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { preload(); io.disconnect(); }
    }, { rootMargin: "800px 0px" });
    io.observe(stage);
  } else {
    preload();
  }

  /* ---------- Spring easing (CSS linear() when supported) ---------- */
  const spring = (() => {
    const fallback = { easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", duration: 1100 };
    if (!window.CSS || !CSS.supports("animation-timing-function", "linear(0, 1)")) return fallback;
    const stiffness = 120, damping = 13, dt = 1 / 120;
    let x = 0, v = 0, t = 0;
    const samples = [0];
    while (t < 3) {
      const a = stiffness * (1 - x) - damping * v;
      v += a * dt;
      x += v * dt;
      t += dt;
      samples.push(x);
      if (t > 0.4 && Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.01) break;
    }
    samples[samples.length - 1] = 1;
    const step = Math.max(1, Math.floor(samples.length / 60));
    const points = samples.filter((_, i) => i % step === 0 || i === samples.length - 1).map((n) => +n.toFixed(4));
    return { easing: `linear(${points.join(", ")})`, duration: Math.round(t * 1000) };
  })();

  /* ---------- Zipper ---------- */
  const zipLength = zipPath.getTotalLength();
  zipGlows.forEach((p) => { p.style.strokeDasharray = `${zipLength} ${zipLength}`; });

  const setZip = (p) => {
    const at = zipLength * p;
    const pt = zipPath.getPointAtLength(at);
    const ahead = zipPath.getPointAtLength(Math.min(zipLength, at + 1));
    const behind = zipPath.getPointAtLength(Math.max(0, at - 1));
    const [a, b] = at + 1 <= zipLength ? [pt, ahead] : [behind, pt];
    const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    slider.setAttribute("transform", `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)}) rotate(${angle.toFixed(1)})`);
    zipGlows.forEach((g) => { g.style.strokeDashoffset = String(zipLength * (1 - p)); });
  };
  setZip(0);

  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tweenZip = (from, to, duration) => new Promise((resolve) => {
    if (!duration) { setZip(to); resolve(); return; }
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setZip(from + (to - from) * easeInOut(t));
      if (t < 1) requestAnimationFrame(frame); else resolve();
    };
    requestAnimationFrame(frame);
  });

  /* ---------- Cards emerging from / returning to the bag ---------- */
  const mouth = () => {
    const r = floatEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.58 };
  };

  const offsets = (card, origin) => {
    const r = card.getBoundingClientRect();
    return { dx: origin.x - (r.left + r.width / 2), dy: origin.y - (r.top + r.height / 2) };
  };

  const restOf = (card) => {
    const tf = getComputedStyle(card).transform;
    return tf && tf !== "none" ? tf : "translate(0px, 0px)";
  };

  const revealCards = () => {
    list.hidden = false;
    if (reduced.matches) return Promise.resolve();
    const origin = mouth();
    const anims = cards.map((card, i) => {
      const { dx, dy } = offsets(card, origin);
      const spin = (i % 2 ? 1 : -1) * (8 + (i % 3) * 4);
      return card.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(0.16) rotate(${spin}deg)`, opacity: 0 },
          { opacity: 1, offset: 0.18 },
          { transform: restOf(card), opacity: 1 },
        ],
        { duration: spring.duration, delay: 90 + i * 85, easing: spring.easing, fill: "backwards" }
      );
    });
    return Promise.all(anims.map((a) => a.finished.catch(() => {})));
  };

  const hideCards = async () => {
    if (reduced.matches) { list.hidden = true; return; }
    const origin = mouth();
    const n = cards.length;
    const anims = cards.map((card, i) => {
      const { dx, dy } = offsets(card, origin);
      return card.animate(
        [
          { transform: restOf(card), opacity: 1 },
          { opacity: 1, offset: 0.7 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.14) rotate(${(i % 2 ? 1 : -1) * 10}deg)`, opacity: 0 },
        ],
        { duration: 620, delay: (n - 1 - i) * 45, easing: "cubic-bezier(0.55, 0, 0.8, 0.25)", fill: "forwards" }
      );
    });
    await Promise.all(anims.map((a) => a.finished.catch(() => {})));
    list.hidden = true;
    anims.forEach((a) => a.cancel());
  };

  /* ---------- State machine ---------- */
  let state = "closed";
  const setState = (s) => { state = s; stage.dataset.state = s; };

  const open = async () => {
    if (state !== "closed") return;
    setState("unzipping");
    bag.setAttribute("aria-expanded", "true");
    bag.setAttribute("aria-label", "Close my kit");
    await tweenZip(0, 1, T(1050));

    setState("opening");
    stage.classList.add("is-hatch-open");
    await wait(T(520));

    const revealed = revealCards();
    await wait(T(700));
    list.classList.add("is-floating");
    setState("open");
    closeBtn.tabIndex = 0;
    status.textContent = `My kit is open: ${items.length} items.`;
    await revealed;
  };

  const close = async () => {
    if (state !== "open") return;
    const refocus = document.activeElement === closeBtn || list.contains(document.activeElement);
    setState("closing");
    closeBtn.tabIndex = -1;
    list.classList.remove("is-floating");
    await hideCards();

    stage.classList.remove("is-hatch-open");
    await wait(T(HATCH_CLOSE_MS - 100));
    await tweenZip(1, 0, T(900));

    setState("closed");
    bag.setAttribute("aria-expanded", "false");
    bag.setAttribute("aria-label", "Open my kit and explore the tools I work with");
    status.textContent = "My kit is closed.";
    if (refocus) bag.focus({ preventScroll: true });
  };

  const toggle = () => (state === "closed" ? open() : close());
  bag.addEventListener("click", toggle);
  bag.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  });
  closeBtn.addEventListener("click", close);

  /* ---------- Hover tilt on cards (fine pointers only) ---------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced.matches) {
    list.addEventListener("pointermove", (e) => {
      const btn = e.target.closest(".kit-card__btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      btn.style.transform = `perspective(700px) rotateX(${((0.5 - py) * 12).toFixed(2)}deg) rotateY(${((px - 0.5) * 14).toFixed(2)}deg) translateZ(0)`;
      btn.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      btn.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    });
    list.addEventListener("pointerout", (e) => {
      const btn = e.target.closest(".kit-card__btn");
      if (btn && !btn.contains(e.relatedTarget)) btn.style.transform = "";
    });
  }

  /* ---------- Detail view ---------- */
  const modal = $("#kitModal");
  const mImg = $("#kitModalImg");
  const mPlate = $(".kit-modal__plate", modal);
  const mThumbs = $("#kitModalThumbs");
  let current = 0;
  let opener = null;

  mPlate.insertAdjacentHTML("beforeend", placeholder(""));
  mImg.addEventListener("error", () => mPlate.classList.add("is-empty"));
  mImg.addEventListener("load", () => mPlate.classList.remove("is-empty"));

  const showImage = (src, alt) => {
    mPlate.classList.toggle("is-empty", !src);
    mPlate.querySelector(".kit-ph use").setAttribute("href", `#${categoryIcon(items[current].category)}`);
    if (!src) return;
    mImg.classList.remove("is-swapping");
    void mImg.offsetWidth;
    mImg.src = src;
    mImg.alt = alt;
    mImg.classList.add("is-swapping");
  };

  const render = (i) => {
    current = (i + items.length) % items.length;
    const item = items[current];
    $("#kitModalNum").textContent = `No.${item.num}`;
    $("#kitModalCat").textContent = item.category || "";
    $("#kitModalName").textContent = item.name;
    $("#kitModalDesc").textContent = item.details || item.description || "";
    $("#kitModalCount").textContent = `${item.num} / ${String(items.length).padStart(2, "0")}`;

    const specs = [["Brand", item.brand], ["Model", item.model], ["Category", item.category]].filter(([, v]) => v);
    $("#kitModalSpecs").innerHTML = specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");

    showImage(item.gallery[0], item.name);
    mThumbs.innerHTML = item.gallery.length > 1
      ? item.gallery.map((src, g) => `<button type="button" data-g="${g}" aria-label="Photo ${g + 1} of ${item.gallery.length}" aria-current="${g === 0}"><img src="${esc(src)}" alt=""></button>`).join("")
      : "";
  };

  mThumbs.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-g]");
    if (!b) return;
    mThumbs.querySelectorAll("button").forEach((t) => t.setAttribute("aria-current", String(t === b)));
    showImage(items[current].gallery[+b.dataset.g], items[current].name);
  });

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".kit-card__btn");
    if (!btn || state !== "open") return;
    opener = btn;
    render(+btn.dataset.index);
    modal.showModal();
    document.documentElement.style.overflow = "hidden";
  });

  $("#kitModalClose").addEventListener("click", () => modal.close());
  $("#kitPrev").addEventListener("click", () => render(current - 1));
  $("#kitNext").addEventListener("click", () => render(current + 1));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  modal.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") render(current - 1);
    if (e.key === "ArrowRight") render(current + 1);
  });
  modal.addEventListener("close", () => {
    document.documentElement.style.overflow = "";
    const target = cards[current] && cards[current].querySelector(".kit-card__btn");
    (target || opener)?.focus({ preventScroll: true });
  });
})();
