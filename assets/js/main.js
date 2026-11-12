/* Dr. Gustavo Freitas · Odontologia Estética — interações e animações
   Mesmo padrão da LP Personal Lentes Dentais: o conteúdo é visível sem JS;
   animações só entram com GSAP carregado e sem preferência por movimento reduzido. */
(() => {
  "use strict";

  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const animate = hasGsap && !reduce;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!animate) root.classList.remove("anim");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Rolagem suave (desktop com mouse) + âncoras ---------- */
  let lenis = null;
  if (animate && finePointer && window.Lenis) {
    lenis = new Lenis({ lerp: .09, wheelMultiplier: .95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const header = document.querySelector(".header");
  const headerOffset = () => -(header?.offsetHeight || 70);
  const scrollToEl = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: headerOffset(), duration: 1.3 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    scrollToEl(target);
    history.replaceState(null, "", id);
  });

  /* ---------- Header e menu mobile ---------- */
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector(".menu-toggle");
  function setMenu(open) {
    if (!toggle) return;
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  toggle?.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  document.querySelectorAll("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 1101px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  // Item do menu da seção atual
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((a) => { const s = document.querySelector(a.getAttribute("href")); if (s) navObserver.observe(s); });

  /* ---------- WhatsApp flutuante (aparece depois da primeira dobra) ---------- */
  const wa = document.querySelector(".wa-float");
  const hero = document.querySelector(".hero");
  if (wa && hero) {
    new IntersectionObserver(([e]) => wa.classList.toggle("is-visible", !e.isIntersecting), { threshold: .2 }).observe(hero);
  }

  /* ---------- FAQ: um aberto por vez ---------- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => item.addEventListener("toggle", () => {
    if (item.open) faqItems.forEach((o) => { if (o !== item) o.open = false; });
    if (hasGsap) ScrollTrigger.refresh();
  }));

  /* ---------- Comparador antes/depois ---------- */
  const compare = document.querySelector("[data-compare]");
  const frame = compare?.querySelector(".compare-frame");
  const range = compare?.querySelector(".compare-range");
  const setPos = (v) => { frame.style.setProperty("--pos", v + "%"); range.value = v; };
  if (frame && range) {
    range.addEventListener("input", () => setPos(range.value));
    const before = frame.querySelector(".compare-before");
    const after = frame.querySelector(".compare-after img");
    const hint = () => {
      if (!animate) return;
      const o = { v: 50 };
      gsap.timeline({ onUpdate: () => setPos(o.v.toFixed(1)) })
        .to(o, { v: 22, duration: .9, ease: "power2.inOut" })
        .to(o, { v: 78, duration: 1.1, ease: "power2.inOut" })
        .to(o, { v: 50, duration: .8, ease: "power2.inOut" });
    };
    document.querySelectorAll(".case").forEach((btn) => btn.addEventListener("click", () => {
      const n = btn.dataset.case;
      document.querySelectorAll(".case").forEach((b) => { const on = b === btn; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on)); });
      frame.style.setProperty("--ar", btn.dataset.ar);
      before.src = `assets/img/comparar-${n}-antes.webp`;
      after.src = `assets/img/comparar-${n}-depois.webp`;
      const idx = btn.querySelector("span")?.textContent || "";
      before.alt = `Antes do tratamento — ${idx.toLowerCase()}`;
      after.alt = `Depois do tratamento com lentes de contato dental — ${idx.toLowerCase()}`;
      setPos(50);
      hint();
    }));
    let hinted = false;
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !hinted) { hinted = true; setTimeout(hint, 400); } }, { threshold: .5 }).observe(frame);
  }

  /* ---------- Lightbox da galeria ---------- */
  const lb = document.querySelector(".lightbox");
  const shots = [...document.querySelectorAll(".shot")];
  let lbIndex = 0;
  const lbImg = lb?.querySelector("img");
  const lbCap = lb?.querySelector("figcaption");
  const showShot = (i) => {
    lbIndex = (i + shots.length) % shots.length;
    const img = shots[lbIndex].querySelector("img");
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    lbCap.textContent = `Antes · Depois — ${lbIndex + 1} de ${shots.length}`;
  };
  shots.forEach((s, i) => s.addEventListener("click", () => {
    if (!lb?.showModal) { window.open(s.querySelector("img").src, "_blank"); return; }
    showShot(i); lb.showModal(); if (lenis) lenis.stop();
  }));
  lb?.querySelector(".lb-close").addEventListener("click", () => lb.close());
  lb?.querySelector(".lb-prev").addEventListener("click", () => showShot(lbIndex - 1));
  lb?.querySelector(".lb-next").addEventListener("click", () => showShot(lbIndex + 1));
  lb?.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  lb?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") showShot(lbIndex + 1);
    if (e.key === "ArrowLeft") showShot(lbIndex - 1);
  });
  lb?.addEventListener("close", () => { if (lenis) lenis.start(); });

  /* ---------- Depoimentos em vídeo (carrossel) ---------- */
  const tTrack = document.querySelector("[data-t-track]");
  if (tTrack) {
    const cards = [...tTrack.querySelectorAll(".t-video")];
    const bar = document.querySelector("[data-t-bar]")?.parentElement;
    const prev = document.querySelector("[data-t-prev]");
    const next = document.querySelector("[data-t-next]");
    const ensureVideo = (box) => {
      let v = box.querySelector("video");
      if (v) return v;
      v = document.createElement("video");
      v.playsInline = true; v.muted = true; v.preload = "metadata";
      v.src = box.dataset.src + "#t=0.8";
      v.setAttribute("aria-label", "Depoimento de paciente em vídeo");
      v.addEventListener("error", () => box.classList.add("is-error"));
      v.addEventListener("ended", () => { box.classList.remove("is-playing"); v.controls = false; });
      box.prepend(v);
      return v;
    };
    // Carrega só o primeiro quadro quando o card chega perto da tela
    const lazy = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { ensureVideo(e.target); lazy.unobserve(e.target); }
    }), { root: tTrack, rootMargin: "0px 300px" });
    cards.forEach((c) => lazy.observe(c));

    cards.forEach((box) => box.querySelector(".t-play").addEventListener("click", () => {
      const v = ensureVideo(box);
      document.querySelectorAll("video").forEach((o) => { if (o !== v) o.pause(); });
      cards.forEach((b) => { if (b !== box) b.classList.remove("is-playing"); });
      v.src = box.dataset.src;
      v.muted = false; v.controls = true;
      box.classList.add("is-playing");
      v.play().catch(() => {});
    }));

    const update = () => {
      const max = tTrack.scrollWidth - tTrack.clientWidth;
      const p = max > 0 ? (tTrack.scrollLeft + tTrack.clientWidth) / tTrack.scrollWidth : 1;
      bar?.style.setProperty("--tp", p.toFixed(3));
      if (prev) prev.disabled = tTrack.scrollLeft < 4;
      if (next) next.disabled = tTrack.scrollLeft > max - 4;
    };
    tTrack.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    window.addEventListener("resize", update);
    update();
    const step = () => (tTrack.querySelector(".t-card")?.offsetWidth || 280) * 2;
    prev?.addEventListener("click", () => tTrack.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }));
    next?.addEventListener("click", () => tTrack.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }));
    tTrack.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next?.click(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev?.click(); }
    });
    // Pausa o vídeo que sai da tela
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) tTrack.querySelectorAll("video").forEach((v) => v.pause()); }, { threshold: 0 }).observe(tTrack);
  }

  /* ---------- Ano do rodapé ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ================================================================== */
  /* Animações                                                          */
  /* ================================================================== */
  if (!animate) return;

  function splitWords(el) {
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "w";
            const wi = document.createElement("span"); wi.className = "wi"; wi.textContent = part;
            w.appendChild(wi); frag.appendChild(w); words.push(wi);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === Node.ELEMENT_NODE && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    return words;
  }

  // Primeira dobra
  const heroWords = splitWords(document.querySelector('[data-split="hero"]'));
  gsap.set(heroWords, { yPercent: 115 });
  gsap.timeline({ delay: .15 })
    .fromTo(".hero-media img", { scale: 1.1 }, { scale: 1, duration: 2.2, ease: "expo.out" }, 0)
    .to(".hero .eyebrow", { opacity: 1, y: 0, duration: .8, ease: "power3.out" }, .2)
    .to(heroWords, { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: .05 }, .3)
    .to(".hero-in:not(.eyebrow)", { opacity: 1, y: 0, duration: .9, ease: "power3.out", stagger: .1 }, .8);

  // Títulos palavra por palavra
  document.querySelectorAll("[data-split]:not([data-split='hero'])").forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 115 });
    ScrollTrigger.create({ trigger: el, start: "top 86%", once: true, onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.05, ease: "power4.out", stagger: .04 }) });
  });

  // Reveal com fade + blur + movimento
  ScrollTrigger.batch(".reveal", {
    start: "top 88%", once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1, y: 0, filter: "blur(0px)", duration: 1.05, ease: "power3.out", stagger: .08,
      onComplete() { this.targets().forEach((t) => t.classList.add("is-in")); gsap.set(this.targets(), { clearProps: "opacity,filter,transform" }); },
    }),
  });

  // Contador +2.000
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count), prefix = el.dataset.prefix || "", br = el.dataset.format === "br";
    const fmt = (v) => prefix + (br ? Math.round(v).toLocaleString("pt-BR") : Math.round(v));
    const o = { v: 0 }; el.textContent = fmt(0);
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(o, { v: end, duration: 2, ease: "power2.out", onUpdate: () => { el.textContent = fmt(o.v); } }) });
  });

  // Profundidade na saída da primeira dobra
  gsap.to(".hero-copy", { y: -60, opacity: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
  gsap.to(".hero-media img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });

  // Fotos com zoom suave ao rolar
  gsap.utils.toArray(".img-grow img").forEach((img) => {
    gsap.fromTo(img, { scale: 1.14 }, { scale: 1, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 1 } });
  });
  gsap.from(".doctor-badge", { y: 40, opacity: 0, duration: 1, ease: "back.out(1.4)", scrollTrigger: { trigger: ".doctor-photo", start: "top 70%", once: true } });

  // Resultados: painel escuro abre como cortina e o comparador sobe em perspectiva
  gsap.fromTo(".results", { clipPath: "inset(5% 3% 0% 3% round 36px)" }, {
    clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
    scrollTrigger: { trigger: ".results", start: "top bottom", end: "top 20%", scrub: 1 },
  });
  gsap.fromTo(".compare-frame", { rotationX: 14, y: 50, scale: .95, transformPerspective: 1400, transformOrigin: "50% 100%" }, {
    rotationX: 0, y: 0, scale: 1, ease: "none",
    scrollTrigger: { trigger: ".compare-wrap", start: "top bottom", end: "top 40%", scrub: 1 },
  });
  gsap.fromTo(".cta", { clipPath: "inset(5% 3% 0% 3% round 36px)" }, {
    clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
    scrollTrigger: { trigger: ".cta", start: "top bottom", end: "top 25%", scrub: 1 },
  });
  gsap.fromTo(".cta-word", { xPercent: -42, yPercent: -50 }, { xPercent: -58, yPercent: -50, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: 1 } });

  // Barra de progresso de leitura
  gsap.to(".scroll-progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

  // Botões magnéticos
  if (finePointer) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * .14, y: (e.clientY - r.top - r.height / 2) * .22, duration: .35 });
      });
      btn.addEventListener("pointerleave", () => gsap.to(btn, { x: 0, y: 0, duration: .6, ease: "elastic.out(1, .4)" }));
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
