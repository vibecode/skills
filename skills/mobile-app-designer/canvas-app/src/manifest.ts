export interface ScreenEntry {
  id: string;
  title: string;
}

export interface Manifest {
  screens: ScreenEntry[];
}

export function readManifest(): Manifest {
  const el = document.getElementById("manifest");
  if (!el) {
    console.warn("No manifest found, using empty screen list");
    return { screens: [] };
  }
  try {
    return JSON.parse(el.textContent || "{}") as Manifest;
  } catch (e) {
    console.error("Failed to parse manifest:", e);
    return { screens: [] };
  }
}
