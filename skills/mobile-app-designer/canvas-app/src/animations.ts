import { animate, scroll, inView } from "motion";

const GLASS_SELECTORS = [
  ".ios-glass",
  ".ios-glass-sm",
  ".ios-glass-md",
  ".ios-glass-lg",
  ".ios-tab-bar",
  ".ios-btn-glass",
  ".ios-btn-glass-primary",
  ".ios-card",
  ".ios-action-sheet",
  ".ios-alert",
].join(", ");

const GLASS_ENTRANCE_SELECTORS = [
  ".ios-glass",
  ".ios-glass-sm",
  ".ios-glass-md",
  ".ios-glass-lg",
  ".ios-tab-bar",
  ".ios-btn-glass",
  ".ios-btn-glass-primary",
  ".ios-card",
  ".ios-action-sheet",
  ".ios-alert",
].join(", ");

const SQUISH_SELECTORS = [
  ".ios-btn-glass",
  ".ios-btn-glass-primary",
  ".ios-tab-bar-item",
  ".ios-btn-filled",
  ".ios-btn-gray",
  ".ios-btn-tinted",
  ".ios-btn-plain",
].join(", ");

const SPRING_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)" as const;
const EXPO_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

function isDark(screen: HTMLElement): boolean {
  return screen.getAttribute("data-theme") === "dark";
}

function getHoverShadow(dark: boolean): string {
  return dark
    ? "inset 1px 1px 0 rgba(255,255,255,0.16), inset 0 0 14px rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.5)"
    : "inset 1px 1px 0 rgba(255,255,255,0.5), inset 0 0 14px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.15)";
}

function getRestShadow(el: HTMLElement): string {
  return getComputedStyle(el).boxShadow || "none";
}

function initEntrance(screen: HTMLElement): void {
  const elements = screen.querySelectorAll<HTMLElement>(GLASS_ENTRANCE_SELECTORS);
  if (elements.length === 0) return;

  // Set initial state
  elements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "scale(0.94) translateZ(0)";
  });

  inView(
    elements,
    (entry) => {
      const el = entry.target as HTMLElement;
      const index = Array.from(elements).indexOf(el);

      animate(
        el,
        { opacity: [0, 1], transform: ["scale(0.94) translateZ(0)", "scale(1) translateZ(0)"] },
        { duration: 0.45, ease: EXPO_OUT, delay: index * 0.06 },
      );
    },
    { root: screen },
  );
}

function initScrollParallax(screen: HTMLElement): void {
  // Tab bar: subtle -8px Y drift
  const tabBars = screen.querySelectorAll<HTMLElement>(".ios-tab-bar");
  tabBars.forEach((el) => {
    scroll(
      animate(el, {
        transform: ["translateY(0) translateZ(0)", "translateY(-8px) translateZ(0)"],
      }),
      { container: screen },
    );
  });

  // Large/medium glass: -12px Y drift + opacity fade
  const glassCards = screen.querySelectorAll<HTMLElement>(".ios-glass-lg, .ios-glass-md");
  glassCards.forEach((el) => {
    scroll(
      animate(el, {
        transform: ["translateY(0) translateZ(0)", "translateY(-12px) translateZ(0)"],
        opacity: [1, 0.85],
      }),
      { container: screen },
    );
  });
}

function initHoverGlow(screen: HTMLElement): void {
  const elements = screen.querySelectorAll<HTMLElement>(GLASS_SELECTORS);

  elements.forEach((el) => {
    let restShadow: string | null = null;

    el.addEventListener("mouseenter", () => {
      if (!restShadow) restShadow = getRestShadow(el);
      const dark = isDark(screen);
      animate(el, { boxShadow: getHoverShadow(dark) }, { duration: 0.2 });
    });

    el.addEventListener("mouseleave", () => {
      animate(
        el,
        { boxShadow: restShadow || "none" },
        { duration: 0.4 },
      );
    });
  });
}

function initClickSquish(screen: HTMLElement): void {
  const elements = screen.querySelectorAll<HTMLElement>(SQUISH_SELECTORS);

  elements.forEach((el) => {
    el.style.willChange = "transform";

    el.addEventListener("pointerdown", () => {
      animate(
        el,
        {
          transform: [
            "scale(1, 1) translateZ(0)",
            "scale(0.92, 0.88) translateZ(0)",
            "scale(1.04, 0.96) translateZ(0)",
            "scale(1, 1) translateZ(0)",
          ],
        },
        { duration: 0.8, ease: SPRING_EASE },
      );
    });
  });
}

export function initGlassAnimations(screen: HTMLElement): void {
  initEntrance(screen);
  initScrollParallax(screen);
  initHoverGlow(screen);
  initClickSquish(screen);
}
