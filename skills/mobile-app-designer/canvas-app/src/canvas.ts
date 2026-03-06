import { PhoneFrame } from "./phone-frame";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3.0;
const DRAG_DEAD_ZONE = 3;
const PINCH_ZOOM_SPEED = 0.01;

export class Canvas {
  private wrapper: HTMLDivElement;
  private inner: HTMLDivElement;
  private panX = 0;
  private panY = 0;
  private zoom = 1;
  private isPanning = false;
  private isFrameDragging = false;
  private startX = 0;
  private startY = 0;
  private hasMoved = false;

  constructor(root: HTMLElement) {
    this.wrapper = document.createElement("div");
    this.wrapper.style.cssText = `
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: fixed;
      top: 0;
      left: 0;
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
    `;

    this.wrapper.appendChild(this.inner);
    root.appendChild(this.wrapper);

    this.bindEvents();
    this.updateTransform();
  }

  private bindEvents(): void {
    // --- Mouse drag to pan ---
    this.wrapper.addEventListener("mousedown", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".ios-screen")) return;
      if (this.isFrameDragging) return;

      this.isPanning = true;
      this.hasMoved = false;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.wrapper.style.cursor = "grabbing";
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e: MouseEvent) => {
      if (!this.isPanning || this.isFrameDragging) return;
      const dx = e.clientX - this.startX - this.panX;
      const dy = e.clientY - this.startY - this.panY;
      if (!this.hasMoved && Math.abs(dx) < DRAG_DEAD_ZONE && Math.abs(dy) < DRAG_DEAD_ZONE) return;
      this.hasMoved = true;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener("mouseup", () => {
      this.isPanning = false;
      this.wrapper.style.cursor = "grab";
    });

    // --- Wheel: pan (two-finger swipe) vs zoom (pinch / ctrl+scroll) ---
    this.wrapper.addEventListener("wheel", (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom on trackpad (browser sends ctrlKey=true)
        // or Ctrl+scroll on a mouse wheel
        const delta = -e.deltaY * PINCH_ZOOM_SPEED;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoom * (1 + delta)));

        // Zoom toward cursor position
        const rect = this.wrapper.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        const scale = newZoom / this.zoom;
        this.panX = cx - (cx - this.panX) * scale;
        this.panY = cy - (cy - this.panY) * scale;
        this.zoom = newZoom;
      } else {
        // Two-finger swipe → pan
        this.panX -= e.deltaX;
        this.panY -= e.deltaY;
      }

      this.updateTransform();
    }, { passive: false });

    // --- Touch: pinch-to-zoom + two-finger pan ---
    let lastTouches: Touch[] | null = null;
    let lastTouchDist = 0;
    let lastTouchMidX = 0;
    let lastTouchMidY = 0;

    this.wrapper.addEventListener("touchstart", (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        lastTouchDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        lastTouchMidX = (a.clientX + b.clientX) / 2;
        lastTouchMidY = (a.clientY + b.clientY) / 2;
        lastTouches = [a, b];
      }
    }, { passive: false });

    this.wrapper.addEventListener("touchmove", (e: TouchEvent) => {
      if (e.touches.length === 2 && lastTouches) {
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const midX = (a.clientX + b.clientX) / 2;
        const midY = (a.clientY + b.clientY) / 2;

        // Pinch zoom
        const scale = dist / lastTouchDist;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoom * scale));
        const actualScale = newZoom / this.zoom;

        const rect = this.wrapper.getBoundingClientRect();
        const cx = midX - rect.left;
        const cy = midY - rect.top;

        this.panX = cx - (cx - this.panX) * actualScale;
        this.panY = cy - (cy - this.panY) * actualScale;
        this.zoom = newZoom;

        // Pan from midpoint movement
        this.panX += midX - lastTouchMidX;
        this.panY += midY - lastTouchMidY;

        lastTouchDist = dist;
        lastTouchMidX = midX;
        lastTouchMidY = midY;
        lastTouches = [a, b];

        this.updateTransform();
      }
    }, { passive: false });

    this.wrapper.addEventListener("touchend", () => {
      lastTouches = null;
    });
  }

  private updateTransform(): void {
    this.inner.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  addFrame(frame: PhoneFrame): void {
    frame.setCallbacks(
      () => this.zoom,
      (dragging) => { this.isFrameDragging = dragging; },
    );
    this.inner.appendChild(frame.getElement());
  }

  centerOn(x: number, y: number): void {
    const rect = this.wrapper.getBoundingClientRect();
    this.panX = rect.width / 2 - x * this.zoom;
    this.panY = rect.height / 2 - y * this.zoom;
    this.updateTransform();
  }
}
