#!/usr/bin/env python3
"""
Extract iOS 26 design tokens from the Apple iOS 26 UI Kit Sketch file.

Parses the Sketch ZIP (which contains JSON files) to extract:
- Shared color swatches (light + dark mode, grouped by category)
- Shared text styles (font size, weight, line height)

Outputs:
- tokens-ios26.json  (structured token data, written to same directory as this script)
- CSS variables block (printed to stdout)

Usage:
    python3 extract-tokens.py [path-to-sketch-file]

If no path is provided, defaults to ~/Downloads/Apple iOS 26 UI Kit.sketch
"""

import json
import os
import sys
import zipfile

DEFAULT_SKETCH_PATH = os.path.expanduser("~/Downloads/Apple iOS 26 UI Kit.sketch")


def color_to_hex(color):
    """Convert Sketch color object (0-1 floats) to #RRGGBB hex string."""
    r = int(color["red"] * 255 + 0.5)
    g = int(color["green"] * 255 + 0.5)
    b = int(color["blue"] * 255 + 0.5)
    return f"#{r:02X}{g:02X}{b:02X}"


def color_to_rgba(color):
    """Convert Sketch color object to rgba() string."""
    r = int(color["red"] * 255 + 0.5)
    g = int(color["green"] * 255 + 0.5)
    b = int(color["blue"] * 255 + 0.5)
    a = color.get("alpha", 1)
    if a >= 1:
        return f"#{r:02X}{g:02X}{b:02X}"
    return f"rgba({r},{g},{b},{a:.2f})"


def parse_swatch_name(name):
    """Parse swatch name like 'Accents/Light/8 Blue' into category, mode, label."""
    parts = name.split("/")
    if len(parts) >= 3:
        category = parts[0]
        mode = parts[1]
        label = "/".join(parts[2:])
        return category, mode, label
    elif len(parts) == 2:
        return parts[0], "Light", parts[1]
    return name, "Light", name


def font_name_to_weight(font_name):
    """Map Sketch font name to CSS font-weight."""
    name = font_name.lower()
    if "bold" in name and "semi" not in name:
        return 700
    if "semibold" in name:
        return 600
    if "medium" in name:
        return 500
    if "light" in name:
        return 300
    return 400


def parse_text_style_name(name):
    """Parse text style name like '06 Body/1 Default' into style name and variant."""
    # Skip "Loose Leading/" prefix
    if name.startswith("Loose Leading/"):
        return None, None  # Skip loose leading variants
    parts = name.split("/")
    if len(parts) >= 2:
        return parts[0].strip(), parts[1].strip()
    return name, "1 Default"


def extract_swatches(doc):
    """Extract all shared color swatches grouped by category."""
    swatches_data = doc.get("sharedSwatches", {}).get("objects", [])
    grouped = {}

    for swatch in swatches_data:
        name = swatch["name"]
        color = swatch["value"]

        # Skip internal kit colors
        if name.startswith("x. Kit/") or name.startswith("Kit/"):
            continue

        category, mode, label = parse_swatch_name(name)
        alpha = color.get("alpha", 1)

        entry = {
            "name": name,
            "hex": color_to_hex(color),
            "rgba": color_to_rgba(color),
            "alpha": alpha,
            "red": round(color["red"], 6),
            "green": round(color["green"], 6),
            "blue": round(color["blue"], 6),
        }

        key = category
        if key not in grouped:
            grouped[key] = {"light": [], "dark": []}

        mode_lower = mode.lower()
        if "dark" in mode_lower:
            grouped[key]["dark"].append({"label": label, **entry})
        else:
            grouped[key]["light"].append({"label": label, **entry})

    return grouped


def extract_text_styles(doc):
    """Extract all shared text styles."""
    styles_data = doc.get("layerTextStyles", {}).get("objects", [])
    styles = []
    seen = set()

    for style_obj in sorted(styles_data, key=lambda x: x["name"]):
        name = style_obj["name"]
        style_name, variant = parse_text_style_name(name)
        if style_name is None:
            continue  # Skip loose leading variants

        encoded = (
            style_obj.get("value", {})
            .get("textStyle", {})
            .get("encodedAttributes", {})
        )
        font_attr = encoded.get("MSAttributedStringFontAttribute", {}).get(
            "attributes", {}
        )
        para = encoded.get("paragraphStyle", {})
        kern = encoded.get("kerning", None)

        font_size = font_attr.get("size")
        font_name = font_attr.get("name", "")
        line_height = para.get("maximumLineHeight")
        weight = font_name_to_weight(font_name)

        # Only include the default variant for deduplication
        dedup_key = f"{style_name}"
        if variant and "Default" in variant and dedup_key not in seen:
            seen.add(dedup_key)
            entry = {
                "name": name,
                "styleName": style_name,
                "fontSize": font_size,
                "fontWeight": weight,
                "lineHeight": line_height,
                "fontName": font_name,
            }
            if kern is not None:
                entry["letterSpacing"] = kern
            styles.append(entry)

    return styles


def generate_css_variables(swatches, text_styles):
    """Generate a CSS custom properties block from extracted tokens."""
    lines = [":root {", "  /* iOS 26 Accent Colors — Light */"]

    # Accent colors (light)
    accent_light = swatches.get("Accents", {}).get("light", [])
    for s in sorted(accent_light, key=lambda x: x["label"]):
        label = s["label"].split(" ", 1)[-1] if " " in s["label"] else s["label"]
        css_name = label.lower().replace(" ", "-")
        lines.append(f"  --ios-{css_name}: {s['hex']};")

    # Labels
    lines.append("")
    lines.append("  /* Labels — Light */")
    label_light = swatches.get("Labels", {}).get("light", [])
    for s in sorted(label_light, key=lambda x: x["label"]):
        label = s["label"].lower().replace(" ", "-")
        lines.append(f"  --ios-label-{label}: {s['rgba']};")

    # Backgrounds
    lines.append("")
    lines.append("  /* Backgrounds — Light */")
    bg_light = swatches.get("Backgrounds", {}).get("light", [])
    for s in sorted(bg_light, key=lambda x: x["label"]):
        label = s["label"].lower().replace(" ", "-")
        lines.append(f"  --ios-bg-{label}: {s['rgba']};")

    # Separators
    lines.append("")
    lines.append("  /* Separators — Light */")
    sep_light = swatches.get("Separators", {}).get("light", [])
    for s in sorted(sep_light, key=lambda x: x["label"]):
        label = s["label"].lower().replace(" ", "-")
        lines.append(f"  --ios-separator-{label}: {s['rgba']};")

    # Fills
    lines.append("")
    lines.append("  /* Fills — Light */")
    fill_light = swatches.get("Fills", {}).get("light", [])
    for s in sorted(fill_light, key=lambda x: x["label"]):
        label = s["label"].lower().replace(" ", "-")
        lines.append(f"  --ios-fill-{label}: {s['rgba']};")

    lines.append("}")
    return "\n".join(lines)


def main():
    sketch_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SKETCH_PATH

    if not os.path.exists(sketch_path):
        print(f"Error: Sketch file not found at {sketch_path}", file=sys.stderr)
        print(
            "Usage: python3 extract-tokens.py [path-to-sketch-file]", file=sys.stderr
        )
        sys.exit(1)

    print(f"Reading: {sketch_path}", file=sys.stderr)

    with zipfile.ZipFile(sketch_path) as z:
        doc = json.loads(z.read("document.json"))

    swatches = extract_swatches(doc)
    text_styles = extract_text_styles(doc)

    # Count totals
    total_swatches = sum(
        len(v["light"]) + len(v["dark"]) for v in swatches.values()
    )
    print(f"Extracted {total_swatches} color swatches", file=sys.stderr)
    print(f"Extracted {len(text_styles)} text styles", file=sys.stderr)

    # Build output
    output = {
        "source": os.path.basename(sketch_path),
        "version": "iOS 26",
        "colors": swatches,
        "textStyles": text_styles,
    }

    # Write JSON
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "tokens-ios26.json")
    with open(json_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Written: {json_path}", file=sys.stderr)

    # Print CSS to stdout
    css = generate_css_variables(swatches, text_styles)
    print(css)


if __name__ == "__main__":
    main()
