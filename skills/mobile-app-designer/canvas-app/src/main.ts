import { toPng } from "html-to-image";
import { initGlassAnimations } from "./animations";
import { Canvas } from "./canvas";
import cssText from "./ios-design-system/styles.css?inline";
import { readManifest } from "./manifest";
import { initMaps } from "./map";
import { PhoneFrame } from "./phone-frame";

const FRAME_GAP = 80;
const FRAME_TOTAL_WIDTH = 401;
const START_X = 80;
const START_Y = 60;
const LUCIDE_SCRIPT_URL = "https://unpkg.com/lucide@latest";
const ORIGINAL_DOCUMENT_HTML = document.documentElement.outerHTML;

declare global {
  interface Window {
    lucide?: {
      createIcons: (options?: { attrs?: Record<string, string> }) => void;
    };
    mobileAppDesignerHost?: {
      regenerateScreen?: (payload: {
        screenId: string;
        title: string;
        prompt?: string;
        sourceHtml: string;
        screenHtml: string;
      }) => string | void | Promise<string | void>;
    };
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "screen";
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}

async function ensureLucideLoaded(): Promise<void> {
  if (window.lucide?.createIcons) return;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${LUCIDE_SCRIPT_URL}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Lucide script")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = LUCIDE_SCRIPT_URL;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load Lucide script")), { once: true });
    document.head.appendChild(script);
  });
}

function hydrateLucide(): void {
  window.lucide?.createIcons({
    attrs: {
      "stroke-width": "1.9",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
  });
}

function centerCanvas(canvas: Canvas, screenCount: number): void {
  if (screenCount <= 0) return;
  const totalWidth = screenCount * FRAME_TOTAL_WIDTH + (screenCount - 1) * FRAME_GAP;
  canvas.centerOn(START_X + totalWidth / 2, START_Y + 460);
}

function getSerializedHtml(frames: PhoneFrame[]): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(ORIGINAL_DOCUMENT_HTML, "text/html");
  const manifestEl = doc.getElementById("manifest");

  if (manifestEl?.textContent) {
    try {
      const manifest = JSON.parse(manifestEl.textContent) as {
        screens?: Array<{ id: string; title: string }>;
      };
      if (Array.isArray(manifest.screens)) {
        const titleMap = new Map(frames.map((frame) => [frame.getScreenId(), frame.getTitle()]));
        manifest.screens = manifest.screens.map((screen) => ({
          ...screen,
          title: titleMap.get(screen.id) || screen.title,
        }));
        manifestEl.textContent = `${JSON.stringify(manifest, null, 2)}\n  `;
      }
    } catch (error) {
      console.warn("Failed to update manifest titles for export:", error);
    }
  }

  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function exportFramePng(frame: PhoneFrame): Promise<void> {
  const dataUrl = await toPng(frame.getExportElement(), {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "transparent",
  });
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  downloadBlob(blob, `${slugify(frame.getTitle())}.png`);
}

async function triggerScreenRegeneration(frame: PhoneFrame, frames: PhoneFrame[], prompt?: string): Promise<string> {
  const template = document.getElementById(`screen-${frame.getScreenId()}`) as HTMLTemplateElement | null;
  const payload = {
    screenId: frame.getScreenId(),
    title: frame.getTitle(),
    prompt,
    sourceHtml: getSerializedHtml(frames),
    screenHtml: template?.innerHTML || "",
  };

  if (window.mobileAppDesignerHost?.regenerateScreen) {
    const message = await window.mobileAppDesignerHost.regenerateScreen(payload);
    return message || "Queued regeneration";
  }

  window.dispatchEvent(
    new CustomEvent("mobile-app-designer:regenerate-screen", {
      detail: payload,
    }),
  );

  const copied = await copyToClipboard(JSON.stringify(payload, null, 2));
  return copied ? "Copied regeneration payload" : "Fired regeneration event";
}

function init(): void {
  const style = document.createElement("style");
  style.textContent = cssText;
  document.head.appendChild(style);

  const root = document.getElementById("canvas-root");
  if (!root) {
    console.error("No #canvas-root element found");
    return;
  }

  const manifest = readManifest();
  const canvas = new Canvas(root);
  const frames: PhoneFrame[] = [];
  const fileBase = slugify(document.title.replace(/\s+[—-]\s+design$/i, ""));

  manifest.screens.forEach((screen, index) => {
    const frame = new PhoneFrame(screen.id, screen.title);
    const x = START_X + index * (FRAME_TOTAL_WIDTH + FRAME_GAP);
    frame.setPosition(x, START_Y);

    const template = document.getElementById(`screen-${screen.id}`) as HTMLTemplateElement | null;
    if (template) {
      frame.setContent(template.innerHTML, { theme: template.dataset.theme });
      initGlassAnimations(frame.getScreenElement());
      void initMaps(frame.getScreenElement());
    }

    frame.setMenuHandlers({
      onTitleChange: (title) => {
        screen.title = title;
      },
      onExportHtml: () => {
        const blob = new Blob([getSerializedHtml(frames)], { type: "text/html;charset=utf-8" });
        downloadBlob(blob, `${fileBase}.html`);
      },
      onExportPng: async () => {
        await exportFramePng(frame);
      },
      onRegenerate: () => triggerScreenRegeneration(frame, frames),
      onRegenerateWithPrompt: (prompt) => triggerScreenRegeneration(frame, frames, prompt),
    });

    canvas.addFrame(frame);
    frames.push(frame);
  });

  void ensureLucideLoaded().then(() => {
    hydrateLucide();
  });

  centerCanvas(canvas, manifest.screens.length);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
