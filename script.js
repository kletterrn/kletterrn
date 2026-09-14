// Progressive enhancement: without JavaScript the navigation remains visible.
document.body.classList.add("js-ready");
const menu = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
menu.hidden = false;
function closeMenu(returnFocus = false) {
  navigation.classList.remove("is-open");
  menu.setAttribute("aria-expanded", "false");
  if (returnFocus) menu.focus();
}
menu.addEventListener("click", () => {
  const opened = navigation.classList.toggle("is-open");
  menu.setAttribute("aria-expanded", String(opened));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open"))
    closeMenu(true);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

const copyButton = document.querySelector(".copy-email");
const copyStatus = document.querySelector(".copy-status");
if (copyButton && navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("davidkhaliqi05@gmail.com");
      copyStatus.textContent = "E-Mail-Adresse kopiert.";
    } catch {
      copyStatus.textContent =
        "Kopieren nicht möglich. Bitte die sichtbare E-Mail-Adresse markieren.";
    }
  });
}

// Content is visible without JavaScript, and every entrance plays only once.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const motionEase = "cubic-bezier(0.22, 1, 0.36, 1)";
const activeAnimations = new Set();

function animateElement(element, frames, options = {}) {
  if (reducedMotion.matches || !element.animate) return;
  const animation = element.animate(frames, {
    duration: 850,
    easing: motionEase,
    fill: "backwards",
    ...options,
  });
  activeAnimations.add(animation);
  animation.finished.then(
    () => activeAnimations.delete(animation),
    () => activeAnimations.delete(animation),
  );
}

function reveal(element, delay = 0) {
  animateElement(
    element,
    [
      { opacity: 0, translate: "0 24px" },
      { opacity: 1, translate: "0 0" },
    ],
    { delay },
  );
}

const heroVisual = document.querySelector(".hero-art");
let revealObserver;
let pointerFrame = 0;

if (!reducedMotion.matches) {
  // A deep link opens at its destination without replaying the offscreen intro.
  if (
    !location.hash ||
    location.hash === "#hero" ||
    location.hash === "#main"
  ) {
    document.querySelectorAll(".hero-line > span").forEach((line, index) => {
      animateElement(
        line,
        [
          { translate: "0 108%", opacity: 0 },
          { translate: "0 0", opacity: 1 },
        ],
        { duration: 1100, delay: index * 100 },
      );
    });
    reveal(document.querySelector(".hero-copy > p"), 320);
    reveal(document.querySelector(".hero-actions"), 440);
    reveal(document.querySelector(".hero-bottom"), 540);
  }
}

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const groupedTargets = new Map();
  document
    .querySelectorAll(
      ".skill-grid, .motivation-grid, .progression, .timeline-list",
    )
    .forEach((group) => {
      [...group.children].forEach((child, index) =>
        groupedTargets.set(child, (index % 4) * 90),
      );
    });
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target, groupedTargets.get(entry.target) || 0);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(
      ".section-heading, .about-grid, .featured-project, .learning-strip, .contact-grid",
    )
    .forEach((element) => revealObserver.observe(element));
  groupedTargets.forEach((delay, element) => revealObserver.observe(element));

  // The visual gently separates and settles; it does not loop indefinitely.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || reducedMotion.matches) return;
        heroVisual
          .querySelectorAll(".design-plane, .code-plane")
          .forEach((plane, index) => {
            animateElement(
              plane,
              [
                {
                  opacity: 0,
                  translate: `0 ${index ? 45 : -30}px`,
                  scale: 0.96,
                  offset: 0,
                },
                {
                  opacity: 1,
                  translate: `0 ${index ? -8 : 6}px`,
                  scale: 1,
                  offset: 0.45,
                },
                { opacity: 1, translate: "0 0", scale: 1, offset: 1 },
              ],
              { duration: 2400, delay: index * 160 },
            );
          });
        observer.disconnect();
      });
    },
    { threshold: 0.25 },
  );
  observer.observe(heroVisual);
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) observer.disconnect();
  });
}

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
heroVisual.addEventListener("pointermove", (event) => {
  if (reducedMotion.matches || !finePointer.matches) return;
  cancelAnimationFrame(pointerFrame);
  const bounds = heroVisual.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  pointerFrame = requestAnimationFrame(() => {
    heroVisual.style.setProperty("--tilt-x", `${x * 10}deg`);
    heroVisual.style.setProperty("--tilt-y", `${y * -8}deg`);
    heroVisual.style.setProperty("--depth-x", `${x * 10}px`);
  });
});

function resetVisual() {
  cancelAnimationFrame(pointerFrame);
  heroVisual.style.removeProperty("--tilt-x");
  heroVisual.style.removeProperty("--tilt-y");
  heroVisual.style.removeProperty("--depth-x");
}
heroVisual.addEventListener("pointerleave", resetVisual);

document.querySelectorAll(".project-details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (details.open) reveal(details.querySelector(".details-grid"));
  });
});

reducedMotion.addEventListener("change", (event) => {
  if (!event.matches) return;
  revealObserver?.disconnect();
  activeAnimations.forEach((animation) => animation.cancel());
  resetVisual();
});
