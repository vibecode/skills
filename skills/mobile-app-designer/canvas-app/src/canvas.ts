import { PhoneFrame } from "./phone-frame";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3.0;
const DRAG_DEAD_ZONE = 3;
const PINCH_ZOOM_SPEED = 0.01;
const KEYBOARD_ZOOM_FACTOR = 1.1;

function createHudButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.exportIgnore = "true";
  button.style.cssText = `
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 1px solid rgba(0,0,0,0.08);
    background: white;
    color: #1a1a1a;
    font: 700 14px/1 -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  `;
  button.textContent = label;
  return button;
}

export class Canvas {
  private readonly wrapper: HTMLDivElement;
  private readonly inner: HTMLDivElement;
  private readonly zoomHud: HTMLDivElement;
  private readonly zoomInput: HTMLInputElement;
  private readonly frames: PhoneFrame[] = [];
  private panX = 0;
  private panY = 0;
  private zoom = 1;
  private isPanning = false;
  private isFrameDragging = false;
  private startX = 0;
  private startY = 0;
  private hasMoved = false;
  private selectedFrame: PhoneFrame | null = null;
  private nextFrameZIndex = 1;

  constructor(root: HTMLElement) {
    this.wrapper = document.createElement("div");
    this.wrapper.style.cssText = `
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: fixed;
      inset: 0;
      background-color: #f8f8fa;
      background-image: radial-gradient(circle, #d0d0d4 1px, transparent 1px);
      background-size: 24px 24px;
      cursor: grab;
      touch-action: none;
    `;

    this.inner = document.createElement("div");
    this.inner.style.cssText = `
      transform-origin: 0 0;
      position: absolute;
      top: 0;
      left: 0;
      will-change: transform;
      overflow: visible;
    `;

    this.zoomHud = document.createElement("div");
    this.zoomHud.dataset.exportIgnore = "true";
    this.zoomHud.style.cssText = `
      position: fixed;
      top: 18px;
      right: 18px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      border-radius: 18px;
      background: rgba(255, 250, 244, 0.88);
      backdrop-filter: blur(18px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      border: 1px solid rgba(0,0,0,0.08);
    `;

    const fitButton = createHudButton("Fit");
    fitButton.style.width = "48px";
    fitButton.addEventListener("click", () => {
      this.fitToFrames();
    });

    const zoomOutButton = createHudButton("-");
    zoomOutButton.addEventListener("click", () => {
      this.zoomBy(1 / KEYBOARD_ZOOM_FACTOR);
    });

    this.zoomInput = document.createElement("input");
    this.zoomInput.type = "text";
    this.zoomInput.value = "100%";
    this.zoomInput.dataset.exportIgnore = "true";
    this.zoomInput.style.cssText = `
      width: 70px;
      height: 34px;
      border-radius: 999px;
      border: 1px solid rgba(0,0,0,0.08);
      background: white;
      color: #1a1a1a;
      font: 600 13px/1 -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
      text-align: center;
      outline: none;
    `;
    this.zoomInput.addEventListener("focus", () => {
      this.zoomInput.select();
    });
    this.zoomInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.commitZoomInput();
      }
    });
    this.zoomInput.addEventListener("blur", () => {
      this.commitZoomInput();
    });

    const zoomInButton = createHudButton("+");
    zoomInButton.addEventListener("click", () => {
      this.zoomBy(KEYBOARD_ZOOM_FACTOR);
    });

    this.zoomHud.append(fitButton, zoomOutButton, this.zoomInput, zoomInButton);

    this.wrapper.appendChild(this.inner);
    root.appendChild(this.wrapper);
    root.appendChild(this.zoomHud);

    this.bindEvents();
    this.updateTransform();
  }

  private bindEvents(): void {
    this.wrapper.addEventListener("mousedown", (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-frame-root='true']") || this.isFrameDragging) return;

      this.selectFrame(null);
      this.isPanning = true;
      this.hasMoved = false;
      this.startX = event.clientX - this.panX;
      this.startY = event.clientY - this.panY;
      this.wrapper.style.cursor = "grabbing";
      event.preventDefault();
    });

    window.addEventListener("mousemove", (event: MouseEvent) => {
      if (!this.isPanning || this.isFrameDragging) return;
      const dx = event.clientX - this.startX - this.panX;
      const dy = event.clientY - this.startY - this.panY;
      if (!this.hasMoved && Math.abs(dx) < DRAG_DEAD_ZONE && Math.abs(dy) < DRAG_DEAD_ZONE) return;
      this.hasMoved = true;
      this.panX = event.clientX - this.startX;
      this.panY = event.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener("mouseup", () => {
      this.isPanning = false;
      this.wrapper.style.cursor = "grab";
    });

    this.wrapper.addEventListener(
      "wheel",
      (event: WheelEvent) => {
        event.preventDefault();

        if (event.ctrlKey || event.metaKey) {
          const delta = -event.deltaY * PINCH_ZOOM_SPEED;
          this.setZoom(this.zoom * (1 + delta), {
            x: event.clientX,
            y: event.clientY,
          });
          return;
        }

        this.panX -= event.deltaX;
        this.panY -= event.deltaY;
        this.updateTransform();
      },
      { passive: false },
    );

    let lastTouches: Touch[] | null = null;
    let lastTouchDist = 0;
    let lastTouchMidX = 0;
    let lastTouchMidY = 0;

    this.wrapper.addEventListener(
      "touchstart",
      (event: TouchEvent) => {
        if (event.touches.length !== 2) return;
        event.preventDefault();
        const [a, b] = [event.touches[0], event.touches[1]];
        lastTouchDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        lastTouchMidX = (a.clientX + b.clientX) / 2;
        lastTouchMidY = (a.clientY + b.clientY) / 2;
        lastTouches = [a, b];
      },
      { passive: false },
    );

    this.wrapper.addEventListener(
      "touchmove",
      (event: TouchEvent) => {
        if (event.touches.length !== 2 || !lastTouches) return;
        event.preventDefault();

        const [a, b] = [event.touches[0], event.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const midX = (a.clientX + b.clientX) / 2;
        const midY = (a.clientY + b.clientY) / 2;
        const scale = dist / lastTouchDist;
        this.setZoom(this.zoom * scale, { x: midX, y: midY });

        this.panX += midX - lastTouchMidX;
        this.panY += midY - lastTouchMidY;

        lastTouchDist = dist;
        lastTouchMidX = midX;
        lastTouchMidY = midY;
        lastTouches = [a, b];
        this.updateTransform();
      },
      { passive: false },
    );

    this.wrapper.addEventListener("touchend", () => {
      lastTouches = null;
    });

    window.addEventListener("keydown", (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      if ((event.metaKey || event.ctrlKey) && (event.key === "=" || event.key === "+")) {
        event.preventDefault();
        this.zoomBy(KEYBOARD_ZOOM_FACTOR);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "-") {
        event.preventDefault();
        this.zoomBy(1 / KEYBOARD_ZOOM_FACTOR);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "0") {
        event.preventDefault();
        this.resetZoom();
      }
    });
  }

  private commitZoomInput(): void {
    const raw = this.zoomInput.value.replace("%", "").trim();
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      this.updateZoomHud();
      return;
    }
    const rect = this.wrapper.getBoundingClientRect();
    this.setZoom(parsed / 100, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  private updateZoomHud(): void {
    this.zoomInput.value = `${Math.round(this.zoom * 100)}%`;
  }

  private updateTransform(): void {
    this.inner.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    if (this.selectedFrame) {
      this.updateMenuPlacement(this.selectedFrame);
    }
    this.updateZoomHud();
  }

  private setZoom(nextZoom: number, anchor?: { x: number; y: number }): void {
    const boundedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    const rect = this.wrapper.getBoundingClientRect();
    const cx = anchor ? anchor.x - rect.left : rect.width / 2;
    const cy = anchor ? anchor.y - rect.top : rect.height / 2;
    const scale = boundedZoom / this.zoom;

    this.panX = cx - (cx - this.panX) * scale;
    this.panY = cy - (cy - this.panY) * scale;
    this.zoom = boundedZoom;
    this.updateTransform();
  }

  private zoomBy(multiplier: number): void {
    const rect = this.wrapper.getBoundingClientRect();
    this.setZoom(this.zoom * multiplier, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  private resetZoom(): void {
    const rect = this.wrapper.getBoundingClientRect();
    this.setZoom(1, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  private bringFrameToFront(frame: PhoneFrame): void {
    frame.getElement().style.zIndex = String(this.nextFrameZIndex++);
  }

  private updateMenuPlacement(frame: PhoneFrame): void {
    const rect = frame.getElement().getBoundingClientRect();
    const preferredPlacement = rect.top < 210 && window.innerHeight - rect.bottom > rect.top ? "below" : "above";
    frame.setMenuPlacement(preferredPlacement);
  }

  private selectFrame(frame: PhoneFrame | null): void {
    this.selectedFrame = frame;
    this.frames.forEach((candidate) => {
      candidate.setSelected(candidate === frame);
    });
    if (frame) {
      this.updateMenuPlacement(frame);
      this.bringFrameToFront(frame);
    }
  }

  addFrame(frame: PhoneFrame): void {
    frame.setCallbacks(
      () => this.zoom,
      (dragging) => {
        this.isFrameDragging = dragging;
      },
      (selectedFrame) => {
        this.selectFrame(selectedFrame);
      },
    );
    this.frames.push(frame);
    this.inner.appendChild(frame.getElement());
    this.bringFrameToFront(frame);
  }

  getFrames(): PhoneFrame[] {
    return [...this.frames];
  }

  centerOn(x: number, y: number): void {
    const rect = this.wrapper.getBoundingClientRect();
    this.panX = rect.width / 2 - x * this.zoom;
    this.panY = rect.height / 2 - y * this.zoom;
    this.updateTransform();
  }

  fitToFrames(): void {
    if (this.frames.length === 0) return;

    const wrapperRect = this.wrapper.getBoundingClientRect();
    const padding = 64;

    const bounds = this.frames.reduce(
      (acc, frame) => {
        const el = frame.getElement();
        const x = parseFloat(el.style.left) || 0;
        const y = parseFloat(el.style.top) || 0;
        const width = el.offsetWidth || 401;
        const height = el.offsetHeight || 920;
        acc.minX = Math.min(acc.minX, x);
        acc.minY = Math.min(acc.minY, y);
        acc.maxX = Math.max(acc.maxX, x + width);
        acc.maxY = Math.max(acc.maxY, y + height);
        return acc;
      },
      {
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
    );

    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    const availableWidth = Math.max(200, wrapperRect.width - padding * 2);
    const availableHeight = Math.max(200, wrapperRect.height - padding * 2);
    const nextZoom = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, Math.min(availableWidth / contentWidth, availableHeight / contentHeight)),
    );

    this.zoom = nextZoom;
    this.panX = (wrapperRect.width - contentWidth * nextZoom) / 2 - bounds.minX * nextZoom;
    this.panY = (wrapperRect.height - contentHeight * nextZoom) / 2 - bounds.minY * nextZoom;
    this.updateTransform();
  }
}
