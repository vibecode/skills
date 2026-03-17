#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const playwright = require(path.resolve(__dirname, "../canvas-app/node_modules/playwright"));

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const value = argv[i + 1];
    args[key.slice(2)] = value;
    i += 1;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const htmlPath = args.html;
  const outputDir = args["output-dir"];
  const waitMs = Number(args["wait-ms"] || "1500");
  if (!htmlPath || !outputDir) {
    console.error("Usage: render_canvas_screenshots.cjs --html <index.html> --output-dir <dir> [--wait-ms 1500]");
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1800, height: 1400 },
    deviceScaleFactor: 1,
  });

  const url = `file://${path.resolve(htmlPath)}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelectorAll(".ios-screen").length > 0, null, {
    timeout: 15000,
  });
  await page.waitForTimeout(waitMs);

  const overviewPath = path.join(outputDir, "overview.png");
  await page.screenshot({ path: overviewPath, fullPage: true });

  const manifest = await page.evaluate(() => {
    const el = document.getElementById("manifest");
    if (!el) return { screens: [] };
    try {
      return JSON.parse(el.textContent || "{}");
    } catch {
      return { screens: [] };
    }
  });

  const screens = [];
  const locators = page.locator(".ios-screen");
  const count = await locators.count();
  for (let i = 0; i < count; i += 1) {
    const title = manifest?.screens?.[i]?.title || `screen-${i + 1}`;
    const fileName = `${String(i + 1).padStart(2, "0")}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `screen-${i + 1}`}.png`;
    const outPath = path.join(outputDir, fileName);
    await locators.nth(i).screenshot({ path: outPath });
    screens.push({
      index: i,
      title,
      path: outPath,
      file_name: fileName,
    });
  }

  const metadata = {
    html_path: path.resolve(htmlPath),
    overview_path: overviewPath,
    screen_count: count,
    screens,
  };
  fs.writeFileSync(path.join(outputDir, "screenshots.json"), JSON.stringify(metadata, null, 2));

  await browser.close();
  process.stdout.write(JSON.stringify(metadata, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
