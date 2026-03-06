const FRAME_WIDTH = 393;
const FRAME_HEIGHT = 852;
const BORDER_RADIUS = 47.33;
const BEZEL_WIDTH = 4;
const DYNAMIC_ISLAND_WIDTH = 126;
const DYNAMIC_ISLAND_HEIGHT = 37;

export class PhoneFrame {
  private el: HTMLDivElement;
  private contentEl: HTMLDivElement;
  private titleEl: HTMLDivElement;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private elStartX = 0;
  private elStartY = 0;
  private getZoom: () => number = () => 1;
  private onDragStateChange: (dragging: boolean) => void = () => {};

  constructor(title: string) {
    this.el = document.createElement("div");
    this.el.style.cssText = `
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      user-select: none;
    `;

    // Phone shell
    const shell = document.createElement("div");
    shell.style.cssText = `
      width: ${FRAME_WIDTH + BEZEL_WIDTH * 2}px;
      height: ${FRAME_HEIGHT + BEZEL_WIDTH * 2}px;
      border-radius: ${BORDER_RADIUS + BEZEL_WIDTH}px;
      background: #1a1a1a;
      padding: ${BEZEL_WIDTH}px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset;
      position: relative;
      outline: 3px solid transparent;
      outline-offset: 4px;
      transition: outline-color 0.15s ease;
    `;

    // Hover highlight
    this.el.addEventListener("mouseenter", () => {
      shell.style.outlineColor = "#0088FF";
    });
    this.el.addEventListener("mouseleave", () => {
      if (!this.isDragging) shell.style.outlineColor = "transparent";
    });

    // Drag-to-move (from anywhere on the frame except screen content)
    this.el.addEventListener("mousedown", (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(".ios-screen")) return;
      if (this.titleEl.contentEditable === "true") return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.elStartX = parseFloat(this.el.style.left) || 0;
      this.elStartY = parseFloat(this.el.style.top) || 0;
      this.onDragStateChange(true);
      e.preventDefault();
      e.stopPropagation();
    });

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return;
      const z = this.getZoom();
      const dx = (e.clientX - this.dragStartX) / z;
      const dy = (e.clientY - this.dragStartY) / z;
      this.setPosition(this.elStartX + dx, this.elStartY + dy);
    };

    const onMouseUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.onDragStateChange(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Screen area
    const screen = document.createElement("div");
    screen.style.cssText = `
      width: ${FRAME_WIDTH}px;
      height: ${FRAME_HEIGHT}px;
      border-radius: ${BORDER_RADIUS}px;
      background: #fff;
      overflow: hidden;
      position: relative;
    `;

    // Dynamic Island
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
      z-index: 10;
    `;

    // Content area (scrollable)
    this.contentEl = document.createElement("div");
    this.contentEl.className = "ios-screen";
    this.contentEl.style.cssText = `
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    `;

    screen.appendChild(island);
    screen.appendChild(this.contentEl);
    shell.appendChild(screen);
    this.el.appendChild(shell);

    // Title label (editable on double-click)
    this.titleEl = document.createElement("div");
    this.titleEl.textContent = title;
    this.titleEl.contentEditable = "false";
    this.titleEl.style.cssText = `
      margin-top: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #666;
      text-align: center;
      padding: 2px 8px;
      border-radius: 4px;
      outline: none;
      cursor: default;
    `;

    this.titleEl.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      this.titleEl.contentEditable = "true";
      this.titleEl.style.cursor = "text";
      this.titleEl.style.background = "rgba(0,0,0,0.05)";
      this.titleEl.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(this.titleEl);
      sel?.removeAllRanges();
      sel?.addRange(range);
    });

    const finishEditing = () => {
      this.titleEl.contentEditable = "false";
      this.titleEl.style.cursor = "default";
      this.titleEl.style.background = "none";
      window.getSelection()?.removeAllRanges();
    };

    this.titleEl.addEventListener("blur", finishEditing);
    this.titleEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.titleEl.blur();
      }
    });

    this.el.appendChild(this.titleEl);
  }

  setContent(html: string): void {
    this.contentEl.innerHTML = html;
  }

  setPosition(x: number, y: number): void {
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
  }

  getElement(): HTMLDivElement {
    return this.el;
  }

  getScreenElement(): HTMLDivElement {
    return this.contentEl;
  }

  setCallbacks(getZoom: () => number, onDragStateChange: (dragging: boolean) => void): void {
    this.getZoom = getZoom;
    this.onDragStateChange = onDragStateChange;
  }
}
