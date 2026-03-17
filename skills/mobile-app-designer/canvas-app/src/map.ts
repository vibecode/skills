const MAPLIBRE_SCRIPT_URL = "https://unpkg.com/maplibre-gl@^5.12.0/dist/maplibre-gl.js";
const MAPLIBRE_STYLESHEET_URL = "https://unpkg.com/maplibre-gl@^5.12.0/dist/maplibre-gl.css";
const OPEN_FREE_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const OPEN_FREE_MAP_ATTRIBUTION = "OpenFreeMap © OpenMapTiles Data from OpenStreetMap";
const OSM_TILE_URL = "https://tile.openstreetmap.org";
const OSM_ATTRIBUTION = "© OpenStreetMap contributors";
const TILE_SIZE = 256;

type MapLibreNamespace = {
  Map: new (options: Record<string, unknown>) => {
    once: (event: string, handler: () => void) => void;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    resize: () => void;
    remove: () => void;
  };
};

declare global {
  interface Window {
    maplibregl?: MapLibreNamespace;
  }
}

function parseNumberList(value: string | null | undefined): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => Number.parseFloat(part.trim()))
    .filter((part) => Number.isFinite(part));
}

async function ensureMapLibreLoaded(): Promise<MapLibreNamespace> {
  const existingStylesheet = document.querySelector(`link[href="${MAPLIBRE_STYLESHEET_URL}"]`) as HTMLLinkElement | null;
  if (!existingStylesheet) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = MAPLIBRE_STYLESHEET_URL;
    document.head.appendChild(link);
  }

  if (window.maplibregl?.Map) {
    return window.maplibregl;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${MAPLIBRE_SCRIPT_URL}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load MapLibre script")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = MAPLIBRE_SCRIPT_URL;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load MapLibre script")), { once: true });
    document.head.appendChild(script);
  });

  if (!window.maplibregl?.Map) {
    throw new Error("MapLibre did not initialize");
  }

  return window.maplibregl;
}

function createAttribution(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "ios-map-attribution";
  return el;
}

function setAttribution(el: HTMLDivElement, text: string): void {
  el.textContent = text;
}

function lngLatToPixels(lng: number, lat: number, zoom: number): { x: number; y: number } {
  const scale = 2 ** zoom * TILE_SIZE;
  const x = ((lng + 180) / 360) * scale;
  const sin = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.min(Math.max(sin, -0.9999), 0.9999);
  const y = (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function renderRasterFallback(
  mapRoot: HTMLElement,
  surface: HTMLDivElement,
  attribution: HTMLDivElement,
  center: number[],
  zoomValue: number,
): void {
  const width = Math.max(mapRoot.clientWidth, 1);
  const height = Math.max(mapRoot.clientHeight, 1);
  const zoom = Math.max(0, Math.min(19, Math.round(zoomValue)));
  const worldTiles = 2 ** zoom;
  const centerPx = lngLatToPixels(center[0], center[1], zoom);
  const left = centerPx.x - width / 2;
  const top = centerPx.y - height / 2;
  const firstTileX = Math.floor(left / TILE_SIZE);
  const lastTileX = Math.floor((left + width) / TILE_SIZE);
  const firstTileY = Math.floor(top / TILE_SIZE);
  const lastTileY = Math.floor((top + height) / TILE_SIZE);

  surface.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (let tileY = firstTileY; tileY <= lastTileY; tileY += 1) {
    if (tileY < 0 || tileY >= worldTiles) continue;
    for (let tileX = firstTileX; tileX <= lastTileX; tileX += 1) {
      const wrappedX = ((tileX % worldTiles) + worldTiles) % worldTiles;
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.alt = "";
      img.loading = "eager";
      img.decoding = "async";
      img.src = `${OSM_TILE_URL}/${zoom}/${wrappedX}/${tileY}.png`;
      img.style.cssText = `
        position: absolute;
        left: ${tileX * TILE_SIZE - left}px;
        top: ${tileY * TILE_SIZE - top}px;
        width: ${TILE_SIZE}px;
        height: ${TILE_SIZE}px;
        object-fit: cover;
      `;
      fragment.appendChild(img);
    }
  }

  surface.appendChild(fragment);
  setAttribution(attribution, OSM_ATTRIBUTION);
  mapRoot.dataset.mapReady = "true";
}

function observeRasterFallback(
  mapRoot: HTMLElement,
  surface: HTMLDivElement,
  attribution: HTMLDivElement,
  center: number[],
  zoom: number,
): void {
  renderRasterFallback(mapRoot, surface, attribution, center, zoom);
  const observer = new ResizeObserver(() => {
    renderRasterFallback(mapRoot, surface, attribution, center, zoom);
  });
  observer.observe(mapRoot);
}

export async function initMaps(root: ParentNode): Promise<void> {
  const mapRoots = Array.from(root.querySelectorAll<HTMLElement>(".ios-map[data-map-center]"));
  if (mapRoots.length === 0) return;

  let maplibregl: MapLibreNamespace | null = null;
  try {
    maplibregl = await ensureMapLibreLoaded();
  } catch {
    maplibregl = null;
  }

  mapRoots.forEach((mapRoot) => {
    if (mapRoot.dataset.mapReady === "true") return;

    const center = parseNumberList(mapRoot.dataset.mapCenter);
    const zoom = Number.parseFloat(mapRoot.dataset.mapZoom || "13");
    const bearing = Number.parseFloat(mapRoot.dataset.mapBearing || "0");
    const pitch = Number.parseFloat(mapRoot.dataset.mapPitch || "0");
    const style = mapRoot.dataset.mapStyle || OPEN_FREE_MAP_STYLE_URL;

    if (center.length !== 2) {
      console.warn("Skipping map with invalid data-map-center:", mapRoot);
      return;
    }

    const surface = document.createElement("div");
    surface.className = "ios-map-surface";
    mapRoot.prepend(surface);
    const attribution = createAttribution();
    mapRoot.appendChild(attribution);

    let settled = false;
    const finishWithRasterFallback = (): void => {
      if (settled) return;
      settled = true;
      observeRasterFallback(mapRoot, surface, attribution, center, zoom);
    };

    if (!maplibregl) {
      finishWithRasterFallback();
      return;
    }

    try {
      const map = new maplibregl.Map({
        container: surface,
        style,
        center,
        zoom: Number.isFinite(zoom) ? zoom : 13,
        bearing: Number.isFinite(bearing) ? bearing : 0,
        pitch: Number.isFinite(pitch) ? pitch : 0,
        interactive: false,
        attributionControl: false,
        fadeDuration: 0,
        renderWorldCopies: false,
        canvasContextAttributes: {
          preserveDrawingBuffer: true,
        },
      });

      const fallbackTimer = window.setTimeout(() => {
        map.remove();
        finishWithRasterFallback();
      }, 2200);

      map.on("error", () => {
        window.clearTimeout(fallbackTimer);
        map.remove();
        finishWithRasterFallback();
      });

      map.once("load", () => {
        if (settled) return;
        window.clearTimeout(fallbackTimer);
        settled = true;
        setAttribution(attribution, OPEN_FREE_MAP_ATTRIBUTION);
        mapRoot.dataset.mapReady = "true";
        map.resize();
        const observer = new ResizeObserver(() => {
          map.resize();
        });
        observer.observe(mapRoot);
      });
    } catch {
      finishWithRasterFallback();
    }
  });
}
