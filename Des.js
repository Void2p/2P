/* 2P — catálogo, filtros, encomendas e lightbox */
"use strict";

/*
 * Edite somente este endereço quando definir seu Instagram.
 * Exemplo: instagramUrl: "https://www.instagram.com/seuusuario/"
 */
const SITE_CONFIG = {
  instagramUrl: "https://www.instagram.com/_2pvoid/"
};

const artworks = [
  { name: "Elie (2025)", file: "Draw/Elie.PNG", category: "realismo", date: "1 de setembro de 2025", description: "Estudo de realismo facial, buscando expressar a dor da perda, do ódio e da revolta." },
  { name: "Griffrh", file: "Draw/Griffrh.PNG", category: "realismo", date: "21 de abril de 2025", description: "Releitura semi-realista do personagem Griffith, de Berserk." },
  { name: "Freir", file: "Draw/Freira.PNG", category: "realismo", date: "27 de abril de 2025", description: "Estudo de realismo." },
  { name: "Ken Eat", file: "Draw/KenEat.PNG", category: "realismo", date: "2 de fevereiro de 2025", description: "Expressão e contraste da dor do personagem Kaneki em abordagem semi-realista." },
  { name: "Elie (2022)", file: "Draw/Elie2022.PNG", category: "realismo", date: "19 de dezembro de 2022", description: "Primeira versão da Elie." },

  { name: "Trunks", file: "Draw/Trunks.PNG", category: "anime", date: "3 de dezembro de 2024", description: "Trunks do Futuro." },
  { name: "Akasa", file: "Draw/Akasa.PNG", category: "anime", date: "18 de dezembro de 2025", description: "Akaza, de Kimetsu no Yaiba." },
  { name: "Gohan", file: "Draw/Gohan.PNG", category: "anime", date: "17 de janeiro de 2024", description: "Gohan." },
  { name: "Luffy", file: "Draw/Luffy.PNG", category: "anime", date: "2 de janeiro de 2024", description: "Luffy Gear 5." },
  { name: "GokuSSj", file: "Draw/GokuSSj..PNG", category: "anime", date: "25 de julho de 2024", description: "Teste de lápis no cabelo do Goku SSJ2." },
  { name: "Balck", file: "Draw/BalckG.PNG", category: "anime", date: "13 de janeiro de 2024", description: "Goku Black." },
  { name: "Doflamingo", file: "Draw/Doflamingo.PNG", category: "anime", date: "16 de janeiro de 2024", description: "Donquixote Doflamingo." },
  { name: "KanekiKen", file: "Draw/KanekiKen.PNG", category: "anime", date: "13 de janeiro de 2024", description: "Ken Kaneki — Tokyo Ghoul." },
  { name: "Ken", file: "Draw/Ken.PNG", category: "anime", date: "20 de outubro de 2024", description: "Ken Kaneki." },

  { name: "femto", file: "Draw/femto.PNG", category: "pontilhismo", date: "26 de maio de 2025", description: "Femto em pontilhismo." },
  { name: "Nosferatu", file: "Draw/Nosferatu.PNG", category: "pontilhismo", date: "2 de abril de 2025", description: "Nosferatu." },
  { name: "It", file: "Draw/It.PNG", category: "pontilhismo", date: "26 de março de 2025", description: "Pennywise, It." },

  { name: "Guts", file: "Draw/Guts.PNG", category: "hachura", date: "31 de janeiro de 2025", description: "Guts." },
  { name: "ImAghoul", file: "Draw/ImAghoul.PNG", category: "hachura", date: "18 de janeiro de 2025", description: "Kaneki mask." },
  { name: "solo", file: "Draw/Aura.PNG", category: "hachura", date: "10 de fevereiro de 2024", description: "Solo Leveling." }
];

const categoryNames = {
  realismo: "Realismo",
  anime: "Anime",
  pontilhismo: "Pontilhismo",
  hachura: "Hachura"
};

const paperFormats = {
  a5: { name: "A5", subtitle: "PEQUENO", dimensions: "14,8 × 21 cm", price: "R$ 35" },
  a4: { name: "A4", subtitle: "MÉDIO", dimensions: "21 × 29,7 cm", price: "R$ 55" },
  a3: { name: "A3", subtitle: "GRANDE", dimensions: "29,7 × 42 cm", price: "R$ 85" }
};

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("art-grid");
  const visibleCount = document.getElementById("visible-count");
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxCategory = document.getElementById("lightbox-category");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.getElementById("main-nav");
  const heroImage = document.querySelector(".hero-art img");
  const heroCount = document.getElementById("hero-art-count");

  if (!grid || !lightbox || !lightboxImage || !menuToggle || !mainNav) return;

  let activeFilter = "todos";
  let currentArtworkIndex = 0;
  let currentArtwork = null;
  let previousFocus = null;
  let backgroundInertState = [];

  // Só entram no catálogo as obras com dados mínimos e categoria reconhecida.
  const availableArtworks = artworks.filter(artwork =>
    artwork && typeof artwork.name === "string" && artwork.name.trim() &&
    typeof artwork.file === "string" && artwork.file.trim() &&
    Object.prototype.hasOwnProperty.call(categoryNames, artwork.category)
  );
  const cardByArtwork = new Map();

  function updateArtworkNumbers() {
    availableArtworks.forEach((artwork, index) => {
      const card = cardByArtwork.get(artwork);
      const number = card?.querySelector(".art-index");
      if (number) number.textContent = String(index + 1).padStart(2, "0");
    });
    if (heroCount) heroCount.textContent = `01 / ${String(availableArtworks.length).padStart(2, "0")}`;
    filterButtons.forEach(button => {
      const counter = button.querySelector("[data-filter-count]");
      if (!counter) return;
      const filter = button.dataset.filter;
      const total = filter === "todos"
        ? availableArtworks.length
        : availableArtworks.filter(artwork => artwork.category === filter).length;
      counter.textContent = total;
    });
  }

  function applyFilter(filter = activeFilter) {
    activeFilter = filter;
    let count = 0;
    [...grid.children].forEach(card => {
      const visible = filter === "todos" || card.dataset.category === filter;
      card.hidden = !visible;
      if (visible) count++;
    });
    if (visibleCount) visibleCount.textContent = count;
    filterButtons.forEach(button => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function removeArtwork(artwork) {
    const index = availableArtworks.indexOf(artwork);
    if (index === -1) return;

    const wasCurrent = currentArtwork === artwork;
    availableArtworks.splice(index, 1);
    cardByArtwork.get(artwork)?.remove();
    cardByArtwork.delete(artwork);

    if (index < currentArtworkIndex) currentArtworkIndex--;
    updateArtworkNumbers();
    applyFilter();

    if (lightbox.classList.contains("open")) {
      if (!availableArtworks.length) {
        closeLightbox();
      } else if (wasCurrent) {
        currentArtworkIndex = Math.min(index, availableArtworks.length - 1);
        currentArtwork = availableArtworks[currentArtworkIndex];
        updateLightbox();
      } else {
        lightboxCounter.textContent = `${String(currentArtworkIndex + 1).padStart(2, "0")} / ${availableArtworks.length}`;
      }
    }
  }

  // Constrói cartões a partir do catálogo. Imagens inválidas são removidas por completo.
  availableArtworks.slice().forEach(artwork => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "art-card";
    card.dataset.category = artwork.category;
    card.setAttribute("aria-label", `Ampliar ${artwork.name}, categoria ${categoryNames[artwork.category]}`);

    const imageWrap = document.createElement("span");
    imageWrap.className = "art-image-wrap";
    const image = document.createElement("img");
    image.src = artwork.file;
    image.alt = `Desenho ${artwork.name}`;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => removeArtwork(artwork), { once: true });
    imageWrap.appendChild(image);

    const meta = document.createElement("span");
    meta.className = "art-meta";
    const titleGroup = document.createElement("span");
    const title = document.createElement("span");
    title.className = "art-title";
    title.textContent = artwork.name;
    const category = document.createElement("span");
    category.className = "art-category";
    category.textContent = categoryNames[artwork.category];
    titleGroup.append(title, category);

    const number = document.createElement("span");
    number.className = "art-index";
    meta.append(titleGroup, number);
    card.append(imageWrap, meta);
    card.addEventListener("click", () => openLightbox(artwork));
    grid.appendChild(card);
    cardByArtwork.set(artwork, card);
  });

  updateArtworkNumbers();
  applyFilter();
  filterButtons.forEach(button => button.addEventListener("click", () => applyFilter(button.dataset.filter)));

  function updateLightbox() {
    const artwork = availableArtworks[currentArtworkIndex];
    if (!artwork) return closeLightbox();
    currentArtwork = artwork;
    lightboxImage.onerror = () => removeArtwork(artwork);
    lightboxImage.src = artwork.file;
    lightboxImage.alt = `Desenho ${artwork.name}`;
    lightboxTitle.textContent = artwork.name;
    lightboxCategory.textContent = categoryNames[artwork.category].toUpperCase();
    lightboxCounter.textContent = `${String(currentArtworkIndex + 1).padStart(2, "0")} / ${availableArtworks.length}`;
  }

  function setBackgroundInert(inert) {
    if (inert) {
      backgroundInertState = [...document.body.children]
        .filter(element => element !== lightbox)
        .map(element => ({ element, wasInert: element.inert }));
      backgroundInertState.forEach(({ element }) => { element.inert = true; });
    } else {
      backgroundInertState.forEach(({ element, wasInert }) => { element.inert = wasInert; });
      backgroundInertState = [];
    }
  }

  function openLightbox(artwork) {
    const index = availableArtworks.indexOf(artwork);
    if (index < 0) return;
    currentArtworkIndex = index;
    currentArtwork = artwork;
    previousFocus = document.activeElement;
    updateLightbox();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    setBackgroundInert(true);
    lightbox.querySelector(".lightbox-close")?.focus();
  }

  function closeLightbox() {
    if (!lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
    setBackgroundInert(false);
    lightboxImage.onerror = null;
    lightboxImage.removeAttribute("src");
    currentArtwork = null;
    if (previousFocus && typeof previousFocus.focus === "function" && previousFocus.isConnected) {
      previousFocus.focus();
    }
    previousFocus = null;
  }

  function moveLightbox(direction) {
    if (!availableArtworks.length) return closeLightbox();
    currentArtworkIndex = (currentArtworkIndex + direction + availableArtworks.length) % availableArtworks.length;
    updateLightbox();
  }

  lightbox.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev")?.addEventListener("click", () => moveLightbox(-1));
  lightbox.querySelector(".lightbox-next")?.addEventListener("click", () => moveLightbox(1));
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  // Menu mobile: estado ARIA, fechamento externo e navegação por teclado.
  const mobileMenuQuery = window.matchMedia("(max-width: 720px)");
  function setMenuOpen(open) {
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    mainNav.classList.toggle("open", open);
    mainNav.inert = mobileMenuQuery.matches && !open;
  }
  setMenuOpen(false);
  mobileMenuQuery.addEventListener?.("change", () => setMenuOpen(false));
  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenuOpen(false)));
  document.addEventListener("click", event => {
    if (menuToggle.getAttribute("aria-expanded") === "true" &&
        !mainNav.contains(event.target) && !menuToggle.contains(event.target)) setMenuOpen(false);
  });

  // Seleção do formato de papel.
  const paperButtons = [...document.querySelectorAll(".paper-option")];
  const paperName = document.getElementById("selected-paper-name");
  const paperDimensions = document.getElementById("selected-paper-dimensions");
  const paperPrice = document.getElementById("selected-paper-price");

  function selectPaper(key) {
    const paper = paperFormats[key];
    if (!paper || !paperName || !paperDimensions || !paperPrice) return;
    paperName.replaceChildren(document.createTextNode(paper.name));
    if (paper.subtitle) {
      const subtitle = document.createElement("span");
      subtitle.textContent = ` — ${paper.subtitle}`;
      paperName.appendChild(subtitle);
    }
    paperDimensions.textContent = paper.dimensions;
    paperPrice.textContent = paper.price;
    paperButtons.forEach(button => {
      const selected = button.dataset.paper === key;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }
  paperButtons.forEach(button => button.addEventListener("click", () => selectPaper(button.dataset.paper)));

  // O endereço fica centralizado no SITE_CONFIG, sem inventar um usuário.
  const instagramLink = document.getElementById("instagram-link");
  const instagramHint = document.getElementById("instagram-hint");
  const configuredInstagram = SITE_CONFIG.instagramUrl.trim();
  if (instagramLink && instagramHint && configuredInstagram) {
    try {
      const parsed = new URL(configuredInstagram);
      if (parsed.protocol === "https:" && parsed.hostname === "www.instagram.com") {
        instagramLink.href = parsed.href;
        instagramLink.removeAttribute("aria-disabled");
        instagramLink.removeAttribute("tabindex");
        instagramHint.textContent = "Envie sua ideia e referências diretamente pelo Instagram.";
      }
    } catch (_) {
      // O link permanece desativado quando o endereço não é válido.
    }
  }
  if (instagramLink?.getAttribute("aria-disabled") === "true") instagramLink.setAttribute("tabindex", "-1");

  // Fecha o menu e controla o lightbox sem permitir foco fora da janela modal.
  document.addEventListener("keydown", event => {
    if (lightbox.classList.contains("open")) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveLightbox(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveLightbox(-1);
        return;
      }
      if (event.key === "Tab") {
        const focusable = [...lightbox.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
          .filter(element => !element.hidden && element.getClientRects().length);
        if (!focusable.length) {
          event.preventDefault();
          lightbox.querySelector(".lightbox-close")?.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !lightbox.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !lightbox.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }

    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  // Navegação ativa conforme a seção visível; seções ausentes são ignoradas com segurança.
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = ["inicio", "galeria", "encomendas", "sobre", "contato"]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", active);
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => observer.observe(section));
  }

  if (heroImage) heroImage.addEventListener("error", () => { heroImage.hidden = true; }, { once: true });
});
