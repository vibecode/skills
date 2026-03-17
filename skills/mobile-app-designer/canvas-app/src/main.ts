import { readManifest } from "./manifest";
import { Canvas } from "./canvas";
import { PhoneFrame } from "./phone-frame";
import { initGlassAnimations } from "./animations";
import cssText from "./ios-design-system/styles.css?inline";

const FRAME_GAP = 80;
const FRAME_TOTAL_WIDTH = 401; // 393 + 4*2 bezel
const START_X = 80;
const START_Y = 60;

function init(): void {
  // Inject iOS design system CSS
  const style = document.createElement("style");
  style.textContent = cssText;
  document.head.appendChild(style);

  // Find or create canvas root
  const root = document.getElementById("canvas-root");
  if (!root) {
    console.error("No #canvas-root element found");
    return;
  }

  const manifest = readManifest();
  const canvas = new Canvas(root);

  manifest.screens.forEach((screen, i) => {
    const frame = new PhoneFrame(screen.title);
    const x = START_X + i * (FRAME_TOTAL_WIDTH + FRAME_GAP);
    frame.setPosition(x, START_Y);

    // Load content from <template>
    const tmpl = document.getElementById(`screen-${screen.id}`) as HTMLTemplateElement | null;
    if (tmpl) {
      const content = tmpl.innerHTML;
      frame.setContent(content);
      initGlassAnimations(frame.getScreenElement());
    }

    canvas.addFrame(frame);
  });

  // Center view on the middle of all frames
  if (manifest.screens.length > 0) {
    const totalWidth = manifest.screens.length * FRAME_TOTAL_WIDTH + (manifest.screens.length - 1) * FRAME_GAP;
    canvas.centerOn(START_X + totalWidth / 2, START_Y + 460);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
