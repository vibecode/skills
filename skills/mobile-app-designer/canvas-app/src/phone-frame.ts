const FRAME_WIDTH = 393;
const FRAME_HEIGHT = 852;
const BORDER_RADIUS = 47.33;
const BEZEL_WIDTH = 4;
const DYNAMIC_ISLAND_WIDTH = 126;
const DYNAMIC_ISLAND_HEIGHT = 37;
const STATUS_BAR_HEIGHT = 54;
const SVG_NS = "http://www.w3.org/2000/svg";

function createActionButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.exportIgnore = "true";
  button.dataset.frameAction = "true";
  button.textContent = label;
  button.style.cssText = `
    height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(0,0,0,0.1);
    background: rgba(255,255,255,0.9);
    color: #171717;
    font: 600 12px/1 -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  `;
  return button;
}

function createStatusSvg(viewBox: string, width: number, height: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = `
    display: block;
    overflow: visible;
    color: currentColor;
    flex: none;
  `;
  return svg;
}

function createSvgElement<T extends keyof SVGElementTagNameMap>(
  tag: T,
  attrs: Record<string, string>,
): SVGElementTagNameMap[T] {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
  return el;
}

function createSignalGlyph(): SVGSVGElement {
  const svg = createStatusSvg("0 0 18 12", 17, 11);
  svg.append(
    createSvgElement("circle", {
      cx: "1.9",
      cy: "9.2",
      r: "1.5",
      fill: "currentColor",
      opacity: "0.28",
    }),
    createSvgElement("rect", {
      x: "5.3",
      y: "5.9",
      width: "2.7",
      height: "5.8",
      rx: "1.35",
      fill: "currentColor",
      opacity: "0.42",
    }),
    createSvgElement("rect", {
      x: "9.4",
      y: "3.3",
      width: "2.7",
      height: "8.4",
      rx: "1.35",
      fill: "currentColor",
      opacity: "0.7",
    }),
    createSvgElement("rect", {
      x: "13.5",
      y: "0.9",
      width: "2.7",
      height: "10.8",
      rx: "1.35",
      fill: "currentColor",
    }),
  );

  return svg;
}

function createWifiGlyph(): SVGSVGElement {
  const svg = createStatusSvg("0 0 16 12", 15, 11);
  svg.append(
    createSvgElement("path", {
      d: "M1.7 4.1C4.8 1.45 11.2 1.45 14.3 4.1",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.55",
      "stroke-linecap": "round",
    }),
    createSvgElement("path", {
      d: "M4.35 6.95C6.15 5.45 9.85 5.45 11.65 6.95",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.55",
      "stroke-linecap": "round",
    }),
    createSvgElement("path", {
      d: "M6.85 9.35C7.45 8.85 8.55 8.85 9.15 9.35",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.55",
      "stroke-linecap": "round",
    }),
    createSvgElement("circle", {
      cx: "8",
      cy: "10.15",
      r: "1.15",
      fill: "currentColor",
    }),
  );
  return svg;
}

function createBatteryGlyph(): SVGSVGElement {
  const svg = createStatusSvg("0 0 26 14", 24, 12);
  svg.append(
    createSvgElement("rect", {
      x: "1",
      y: "2.1",
      width: "21",
      height: "9.8",
      rx: "3.4",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.55",
    }),
    createSvgElement("rect", {
      x: "3.25",
      y: "4.25",
      width: "12.4",
      height: "5.5",
      rx: "1.9",
      fill: "currentColor",
    }),
    createSvgElement("rect", {
      x: "23.2",
      y: "5.1",
      width: "1.9",
      height: "3.8",
      rx: "0.95",
      fill: "currentColor",
    }),
  );
  return svg;
}

function createPromptInput(placeholder: string): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  input.dataset.exportIgnore = "true";
  input.dataset.frameAction = "true";
  input.style.cssText = `
    width: 100%;
    min-width: 0;
    height: 36px;
    padding: 0 12px;
    border-radius: 14px;
    border: 1px solid rgba(0,0,0,0.1);
    background: rgba(255,255,255,0.94);
    color: #171717;
    font: 500 12px/1 -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    outline: none;
  `;
  return input;
}

export interface PhoneFrameMenuHandlers {
  onExportHtml?: () => string | void | Promise<string | void>;
  onExportPng?: () => string | void | Promise<string | void>;
  onTitleChange?: (title: string) => void;
}

export class PhoneFrame {
  private readonly el: HTMLDivElement;
  private readonly menuEl: HTMLDivElement;
  private readonly shellEl: HTMLDivElement;
  private readonly contentEl: HTMLDivElement;
  private readonly titleButtonEl: HTMLButtonElement;
  private readonly titleInputEl: HTMLInputElement;
  private readonly statusTextEl: HTMLDivElement;
  private readonly statusBarEl: HTMLDivElement;
  private readonly homeIndicatorEl: HTMLDivElement;
  private readonly screenId: string;
  private isDragging = false;
  private isSelected = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private elStartX = 0;
  private elStartY = 0;
  private getZoom: () => number = () => 1;
  private onDragStateChange: (dragging: boolean) => void = () => {};
  private onSelect: (frame: PhoneFrame) => void = () => {};
  private menuHandlers: PhoneFrameMenuHandlers = {};
  private statusTimer?: number;
  private menuPlacement: "above" | "below" = "above";

  constructor(screenId: string, title: string) {
    this.screenId = screenId;

    this.el = document.createElement("div");
    this.el.dataset.frameRoot = "true";
    this.el.style.cssText = `
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      user-select: none;
      overflow: visible;
    `;

    this.menuEl = document.createElement("div");
    this.menuEl.dataset.exportIgnore = "true";
    this.menuEl.dataset.frameAction = "true";
    this.menuEl.style.cssText = `
      position: absolute;
      left: 50%;
      top: -16px;
      transform: translate(-50%, -100%);
      width: 364px;
      display: none;
      flex-direction: column;
      gap: 10px;
      padding: 12px;
      border-radius: 24px;
      background: rgba(255, 249, 242, 0.96);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.14);
      border: 1px solid rgba(0,0,0,0.08);
      z-index: 40;
    `;
    this.menuEl.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });
    this.menuEl.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    this.updateMenuPlacement();

    this.titleInputEl = createPromptInput("Screen title");
    this.titleInputEl.value = title;
    this.titleInputEl.style.fontWeight = "600";
    this.titleInputEl.addEventListener("input", () => {
      this.updateTitle(this.titleInputEl.value);
    });
    this.titleInputEl.addEventListener("focus", () => {
      this.onSelect(this);
    });

    const menuActionRow = document.createElement("div");
    menuActionRow.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    `;

    const exportHtmlButton = createActionButton("Export HTML");
    exportHtmlButton.addEventListener("click", () => {
      void this.runMenuAction(() => this.menuHandlers.onExportHtml?.(), "Saved HTML");
    });

    const exportPngButton = createActionButton("Export PNG");
    exportPngButton.addEventListener("click", () => {
      void this.runMenuAction(() => this.menuHandlers.onExportPng?.(), "Saved PNG");
    });

    menuActionRow.append(exportHtmlButton, exportPngButton);

    this.statusTextEl = document.createElement("div");
    this.statusTextEl.dataset.exportIgnore = "true";
    this.statusTextEl.style.cssText = `
      min-height: 14px;
      color: rgba(32,32,32,0.7);
      font: 500 11px/1.2 -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
      letter-spacing: -0.01em;
    `;

    this.menuEl.append(this.titleInputEl, menuActionRow, this.statusTextEl);
    this.el.appendChild(this.menuEl);

    this.shellEl = document.createElement("div");
    this.shellEl.style.cssText = `
      width: ${FRAME_WIDTH + BEZEL_WIDTH * 2}px;
      height: ${FRAME_HEIGHT + BEZEL_WIDTH * 2}px;
      border-radius: ${BORDER_RADIUS + BEZEL_WIDTH}px;
      background: #1a1a1a;
      padding: ${BEZEL_WIDTH}px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset;
      position: relative;
      outline: 3px solid transparent;
      outline-offset: 4px;
      transition: outline-color 0.15s ease, transform 0.15s ease;
    `;

    this.el.addEventListener("mouseenter", () => {
      this.updateOutline();
    });
    this.el.addEventListener("mouseleave", () => {
      if (!this.isDragging) {
        this.updateOutline();
      }
    });

    this.el.addEventListener("mousedown", (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest(".ios-screen") ||
        target.closest("[data-frame-action='true']") ||
        target.closest("input, button, textarea, select")
      ) {
        return;
      }
      this.onSelect(this);
      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.elStartX = parseFloat(this.el.style.left) || 0;
      this.elStartY = parseFloat(this.el.style.top) || 0;
      this.onDragStateChange(true);
      this.updateOutline();
      event.preventDefault();
      event.stopPropagation();
    });

    const onMouseMove = (event: MouseEvent) => {
      if (!this.isDragging) return;
      const zoom = this.getZoom();
      const dx = (event.clientX - this.dragStartX) / zoom;
      const dy = (event.clientY - this.dragStartY) / zoom;
      this.setPosition(this.elStartX + dx, this.elStartY + dy);
    };

    const onMouseUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.onDragStateChange(false);
      this.updateOutline();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const screen = document.createElement("div");
    screen.style.cssText = `
      width: ${FRAME_WIDTH}px;
      height: ${FRAME_HEIGHT}px;
      border-radius: ${BORDER_RADIUS}px;
      background: #fff;
      overflow: hidden;
      position: relative;
    `;

    this.statusBarEl = document.createElement("div");
    this.statusBarEl.dataset.exportIgnore = "true";
    this.statusBarEl.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: ${STATUS_BAR_HEIGHT}px;
      z-index: 16;
      pointer-events: none;
      color: #050505;
      font: 700 16px/1 -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      letter-spacing: -0.03em;
    `;

    const timeEl = document.createElement("span");
    timeEl.textContent = "9:41";
    timeEl.style.cssText = `
      position: absolute;
      left: 34px;
      top: 19px;
      min-width: 54px;
      text-align: left;
    `;

    const indicatorCluster = document.createElement("div");
    indicatorCluster.style.cssText = `
      position: absolute;
      right: 30px;
      top: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
    `;

    const signal = createSignalGlyph();
    const wifi = createWifiGlyph();
    const battery = createBatteryGlyph();

    indicatorCluster.append(signal, wifi, battery);
    this.statusBarEl.append(timeEl, indicatorCluster);

    const island = document.createElement("div");
    island.style.cssText = `
      position: absolute;
      top: 11px;
      left: 50%;
      transform: translateX(-50%);
      width: ${DYNAMIC_ISLAND_WIDTH}px;
      height: ${DYNAMIC_ISLAND_HEIGHT}px;
      background: #000;
      border-radius: 20px;
      z-index: 17;
    `;

    this.contentEl = document.createElement("div");
    this.contentEl.className = "ios-screen";
    this.contentEl.style.cssText = `
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      position: relative;
    `;
    this.contentEl.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      this.onSelect(this);
    });
    this.contentEl.addEventListener("focusin", () => {
      this.onSelect(this);
    });

    this.homeIndicatorEl = document.createElement("div");
    this.homeIndicatorEl.dataset.exportIgnore = "true";
    this.homeIndicatorEl.style.cssText = `
      position: absolute;
      left: 50%;
      bottom: 8px;
      transform: translateX(-50%);
      width: 139px;
      height: 5px;
      border-radius: 999px;
      background: rgba(0,0,0,0.86);
      z-index: 14;
      pointer-events: none;
    `;

    screen.append(this.contentEl, this.statusBarEl, island, this.homeIndicatorEl);
    this.shellEl.appendChild(screen);
    this.shellEl.addEventListener("click", (event) => {
      event.stopPropagation();
      this.onSelect(this);
    });
    this.el.appendChild(this.shellEl);

    this.titleButtonEl = document.createElement("button");
    this.titleButtonEl.type = "button";
    this.titleButtonEl.dataset.exportIgnore = "true";
    this.titleButtonEl.dataset.frameAction = "true";
    this.titleButtonEl.style.cssText = `
      border: none;
      background: rgba(255,255,255,0.9);
      color: #666;
      padding: 8px 12px;
      border-radius: 999px;
      box-shadow: 0 10px 24px rgba(0,0,0,0.08);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font: 600 13px/1 -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
      letter-spacing: -0.02em;
      transition: color 0.15s ease, background 0.15s ease;
    `;
    this.titleButtonEl.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });
    this.titleButtonEl.addEventListener("click", (event) => {
      event.stopPropagation();
      const shouldFocusTitle = this.isSelected;
      this.onSelect(this);
      if (shouldFocusTitle) {
        this.focusTitleInput();
      }
    });
    this.el.appendChild(this.titleButtonEl);

    this.updateTitle(title);
    this.applyTheme(null);
    this.updateOutline();
  }

  private focusTitleInput(): void {
    queueMicrotask(() => {
      this.titleInputEl.focus();
      this.titleInputEl.select();
    });
  }

  private async runMenuAction(
    handler: () => string | void | Promise<string | void> | undefined,
    successMessage: string,
  ): Promise<void> {
    try {
      const message = await handler();
      this.setStatus(message || successMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Action failed";
      this.setStatus(message, true);
    }
  }

  private updateTitle(title: string): void {
    const nextTitle = title.trim() || "Screen";
    this.titleButtonEl.innerHTML = "";
    const label = document.createElement("span");
    label.textContent = nextTitle;
    const chevron = document.createElement("span");
    chevron.textContent = "Edit";
    chevron.style.cssText = `
      color: rgba(0,0,0,0.45);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `;
    this.titleButtonEl.append(label, chevron);
    this.menuHandlers.onTitleChange?.(nextTitle);
  }

  private applyTheme(theme: string | null | undefined): void {
    const resolvedTheme = theme === "dark" ? "dark" : "light";
    this.contentEl.dataset.theme = resolvedTheme;
    const isDark = resolvedTheme === "dark";
    this.statusBarEl.style.color = isDark ? "rgba(255,255,255,0.98)" : "#050505";
    this.homeIndicatorEl.style.background = isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.86)";
  }

  private updateOutline(): void {
    if (this.isSelected) {
      this.shellEl.style.outlineColor = "#0088FF";
      this.shellEl.style.transform = "translateY(-2px)";
      this.titleButtonEl.style.background = "rgba(0,136,255,0.1)";
      this.titleButtonEl.style.color = "#005fcc";
      return;
    }
    const hovered = this.el.matches(":hover");
    this.shellEl.style.outlineColor = hovered || this.isDragging ? "#0088FF" : "transparent";
    this.shellEl.style.transform = "translateY(0)";
    this.titleButtonEl.style.background = "rgba(255,255,255,0.9)";
    this.titleButtonEl.style.color = "#666";
  }

  private updateMenuPlacement(): void {
    if (this.menuPlacement === "below") {
      this.menuEl.style.top = "calc(100% + 6px)";
      this.menuEl.style.transform = "translateX(-50%)";
      return;
    }
    this.menuEl.style.top = "-16px";
    this.menuEl.style.transform = "translate(-50%, -100%)";
  }

  setContent(html: string, options?: { theme?: string | null }): void {
    this.contentEl.innerHTML = html;
    this.applyTheme(options?.theme);
  }

  setPosition(x: number, y: number): void {
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
  }

  setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.menuEl.style.display = selected ? "flex" : "none";
    this.updateOutline();
    this.el.style.zIndex = selected ? "30" : "";
  }

  setMenuPlacement(placement: "above" | "below"): void {
    this.menuPlacement = placement;
    this.updateMenuPlacement();
  }

  setMenuHandlers(handlers: PhoneFrameMenuHandlers): void {
    this.menuHandlers = handlers;
  }

  setStatus(message: string, isError = false): void {
    this.statusTextEl.textContent = message;
    this.statusTextEl.style.color = isError ? "#b42318" : "rgba(32,32,32,0.7)";
    if (this.statusTimer) {
      window.clearTimeout(this.statusTimer);
    }
    this.statusTimer = window.setTimeout(() => {
      this.statusTextEl.textContent = "";
    }, 2400);
  }

  setTitle(title: string): void {
    this.titleInputEl.value = title;
    this.updateTitle(title);
  }

  getElement(): HTMLDivElement {
    return this.el;
  }

  getScreenElement(): HTMLDivElement {
    return this.contentEl;
  }

  getExportElement(): HTMLDivElement {
    return this.shellEl;
  }

  getTitle(): string {
    return this.titleInputEl.value.trim() || "screen";
  }

  getScreenId(): string {
    return this.screenId;
  }

  setCallbacks(
    getZoom: () => number,
    onDragStateChange: (dragging: boolean) => void,
    onSelect: (frame: PhoneFrame) => void,
  ): void {
    this.getZoom = getZoom;
    this.onDragStateChange = onDragStateChange;
    this.onSelect = onSelect;
  }
}
