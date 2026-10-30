/* =========================================================
   DR. OSAMA ESSAM — main.js
   =========================================================

   ✏️  EDIT YOUR DETAILS HERE — every link on the site reads from this file.

   PORTFOLIO_URL
     Paste your Canva link or a public PDF link, e.g.
       "https://www.canva.com/design/XXXX/view"
       "https://your-domain.com/portfolio.pdf"
     Use a VIEW-ONLY link (Canva → Share → "Public view link"), never an edit link.
     If it is left as "ADD_YOUR_PORTFOLIO_URL_HERE", the site uses
     portfolioFallbackUrl below (e.g. a PDF you place in assets/documents/).

     • A direct .pdf link also shows a "Preview Portfolio" button that opens an
       embedded viewer (desktop browsers with a built-in PDF viewer only).
     • A Canva link simply opens in a new tab.

   Social links left as "" are hidden automatically.
   ========================================================= */

const PORTFOLIO_URL = "https://canva.link/l2tl78jlhetsb6o";

const CONFIG = {
  name: "Dr. Osama Essam",
  heroDescription:
    "A dentist by profession, a creative mind by passion. I blend dentistry, photography, videography, design, and AI to turn ideas into extraordinary experiences.",

  portfolioUrl: PORTFOLIO_URL,
  portfolioFallbackUrl: "",      // optional, e.g. "assets/documents/Portfolio.pdf"

  email: "ogabr77@gmail.com",
  whatsapp: "201008137502",      // international format, digits only (Egypt +20)
  phone: "+201152128765",        // international format
  instagram: "",                 // e.g. "https://www.instagram.com/your-handle"
  linkedin: "",                  // e.g. "https://www.linkedin.com/in/your-handle"
  youtube: "",                   // e.g. "https://www.youtube.com/@your-handle"
};

/* ========================================================= */

(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Resolve config into links ---------- */
  const isPlaceholder = (url) => !url || /^ADD_/i.test(url.trim());
  const portfolioUrl = isPlaceholder(CONFIG.portfolioUrl) ? CONFIG.portfolioFallbackUrl : CONFIG.portfolioUrl.trim();
  const isPdf = /\.pdf($|[?#])/i.test(portfolioUrl);

  const prettyPhone = (num) => {
    const digits = String(num).replace(/\D/g, "");
    // Egyptian mobile: +20 10 0813 7502
    return digits.startsWith("20") && digits.length === 12
      ? `+20 ${digits.slice(2, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`
      : `+${digits}`;
  };

  const links = {
    portfolio: portfolioUrl,
    email: CONFIG.email ? `mailto:${CONFIG.email}` : "",
    whatsapp: CONFIG.whatsapp ? `https://wa.me/${String(CONFIG.whatsapp).replace(/\D/g, "")}` : "",
    phone: CONFIG.phone ? `tel:${String(CONFIG.phone).replace(/[^\d+]/g, "")}` : "",
    instagram: CONFIG.instagram,
    linkedin: CONFIG.linkedin,
    youtube: CONFIG.youtube,
  };

  const texts = {
    name: CONFIG.name,
    heroDescription: CONFIG.heroDescription,
    email: CONFIG.email,
    whatsappDisplay: CONFIG.whatsapp ? prettyPhone(CONFIG.whatsapp) : "",
    phoneDisplay: CONFIG.phone ? prettyPhone(CONFIG.phone) : "",
  };

  const opensInNewTab = (key) => !["email", "phone"].includes(key);

  $$("[data-link]").forEach((el) => {
    const key = el.dataset.link;
    const url = links[key];
    if (!url) {
      // Hide unset links (and their list item wrapper)
      (el.closest("[data-link-item]") || el).hidden = true;
      return;
    }
    el.href = url;
    if (opensInNewTab(key)) {
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
  });

  $$("[data-text]").forEach((el) => {
    const value = texts[el.dataset.text];
    if (value) el.textContent = value;
  });

  /* ---------- Hero entrance ---------- */
  const heroAnims = $$(".hero [data-anim]");
  heroAnims.forEach((el, i) => el.style.setProperty("--d", `${0.15 + i * 0.12}s`));

  const heroImg = $(".hero__img");
  const startHero = () => {
    void document.body.offsetWidth; // commit initial styles so the transition runs
    document.body.classList.add("is-loaded");
  };
  if (heroImg && !heroImg.complete) {
    heroImg.addEventListener("load", startHero, { once: true });
    heroImg.addEventListener("error", startHero, { once: true });
    setTimeout(startHero, 1200); // never hold the hero back on slow networks
  } else {
    startHero();
  }

  /* ---------- Header state + back-to-top ---------- */
  const header = $("#header");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("is-visible", y > window.innerHeight * 0.9);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    history.replaceState(null, "", "#home");
  };
  toTop.addEventListener("click", scrollToTop);
  $(".footer__top").addEventListener("click", scrollToTop);

  /* ---------- Mobile navigation ---------- */
  const menuToggle = $("#menuToggle");
  const nav = $("#nav");
  const setMenu = (open) => {
    document.documentElement.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.documentElement.classList.contains("menu-open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---------- Active nav link ---------- */
  const navLinks = $$(".nav__link");
  const sectionIds = navLinks.map((a) => a.getAttribute("href").slice(1));
  // The portfolio section sits between Skills and Journey; keep "Skills" lit there.
  const sectionFor = { work: "skills" };
  const setActive = (id) => {
    const target = sectionFor[id] || id;
    navLinks.forEach((a) => {
      const active = a.getAttribute("href") === `#${target}`;
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  };
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  [...sectionIds, "work"].forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$(".reveal");
  // Stagger siblings that reveal together
  revealEls.forEach((el) => {
    const group = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    const idx = group.indexOf(el);
    if (idx > 0) el.style.setProperty("--d", `${Math.min(idx, 4) * 0.08}s`);
  });

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealer = new IntersectionObserver(
      (entries, obs) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealEls.forEach((el) => revealer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Timeline progress line ---------- */
  const timeline = $(".timeline");
  if (timeline) {
    let ticking = false;
    const update = () => {
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      timeline.style.setProperty("--progress", progress.toFixed(3));
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Subtle magnetic pull on primary buttons (desktop only) ---------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion.matches) {
    $$(".btn--primary").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Portfolio PDF preview ---------- */
  const previewBtn = $("#previewBtn");
  const modal = $("#pdfModal");
  const frame = $("#pdfFrame");
  // Mobile browsers (and some embedded ones) can't show PDFs inline — skip the preview there.
  const canEmbedPdf = navigator.pdfViewerEnabled !== false && window.matchMedia("(min-width: 768px)").matches;

  if (isPdf && canEmbedPdf && typeof modal.showModal === "function") {
    previewBtn.hidden = false;

    previewBtn.addEventListener("click", () => {
      // Load the document only when asked — portfolios can be large
      if (!frame.src) frame.src = `${portfolioUrl}#view=FitH`;
      modal.showModal();
      document.documentElement.style.overflow = "hidden";
    });

    const close = () => modal.close();
    $("#pdfClose").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    modal.addEventListener("close", () => {
      document.documentElement.style.overflow = "";
      previewBtn.focus();
    });
    frame.addEventListener("load", () => { $(".pdf-modal__loading").hidden = true; });
  }

  /* ---------- Contact form (validates, then opens the visitor's email app) ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const messages = {
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    message: "Please write a message (at least 10 characters).",
  };

  const validateField = (input) => {
    const field = input.closest(".field");
    const error = $(".field__error", field);
    const value = input.value.trim();
    let ok = true;
    if (input.name === "name") ok = value.length >= 2;
    if (input.name === "email") ok = emailRe.test(value);
    if (input.name === "message") ok = value.length >= 10;
    field.classList.toggle("has-error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    if (error) error.textContent = ok ? "" : messages[input.name];
    return ok;
  };

  const required = $$("input[required], textarea[required]", form);
  required.forEach((input) => {
    input.addEventListener("blur", () => { if (input.value) validateField(input); });
    input.addEventListener("input", () => { if (input.closest(".field").classList.contains("has-error")) validateField(input); });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";
    const results = required.map(validateField);
    if (results.includes(false)) {
      required[results.indexOf(false)].focus();
      return;
    }
    if (!CONFIG.email) {
      status.textContent = "Email is not configured yet.";
      return;
    }
    const data = new FormData(form);
    const subject = data.get("subject").trim() || `New message from ${data.get("name").trim()}`;
    const body = `${data.get("message").trim()}\n\n— ${data.get("name").trim()} (${data.get("email").trim()})`;
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Thank you! Your email app should open with your message ready to send.";
    form.reset();
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
