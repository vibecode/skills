#!/usr/bin/env python3
"""Run end-to-end mobile-app-designer look-and-feel evals with Gemini on Vertex AI.

This runner:
1. Creates a workspace for each eval case.
2. Optionally writes setup files referenced by the prompt.
3. Uses `claude -p` to generate a local mobile design project.
4. Renders screenshots from the generated canvas HTML with Playwright.
5. Sends the screenshots to Gemini 3.1 Pro on Vertex AI for visual review.

Requirements:
- `claude` installed and authenticated
- `gcloud` installed and authenticated for the target project
- Playwright available in `canvas-app/node_modules`
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import signal
import shutil
import subprocess
import sys
import textwrap
import time
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_EVAL_SET = ROOT / "evals" / "look-and-feel-evals.json"
RENDER_SCRIPT = ROOT / "scripts" / "render_canvas_screenshots.cjs"
DEFAULT_MODEL = "gemini-3.1-pro-preview"
DEFAULT_LOCATION = "global"
CLAUDE_GENERATION_TIMEOUT_SECONDS = 240
CLAUDE_SUCCESS_GRACE_SECONDS = 4
ACCESS_TOKEN_ENV_VARS = ("VERTEX_ACCESS_TOKEN", "GOOGLE_OAUTH_ACCESS_TOKEN")


def slugify(value: str) -> str:
    return "-".join(
        part for part in "".join(ch.lower() if ch.isalnum() else "-" for ch in value).split("-") if part
    )


def run_command(cmd: list[str], *, cwd: Path | None = None, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )


def write_setup_files(eval_dir: Path, setup_files: list[dict]) -> None:
    for item in setup_files:
        path = eval_dir / item["path"]
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(item["content"])


def build_generation_prompt(prompt: str, project_dir: Path) -> str:
    return textwrap.dedent(
        f"""
        {prompt}

        Requirements:
        - Create the design in this exact directory: {project_dir}
        - The deliverable must be a local project folder with `index.html` at the root and `canvas.min.js` beside it
        - Do not ask follow-up questions unless the task is impossible
        - If a referenced brief file is missing or vague, make sensible product assumptions and continue
        - Keep the result polished, cohesive, and native-feeling on iPhone
        - When finished, print a final line exactly like this:
          PROJECT_PATH: {project_dir}
        """
    ).strip()


def run_claude_generation(eval_prompt: str, eval_dir: Path, project_dir: Path) -> dict:
    env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}
    full_prompt = build_generation_prompt(eval_prompt, project_dir)
    index_path = project_dir / "index.html"
    canvas_path = project_dir / "canvas.min.js"
    project_dir.mkdir(parents=True, exist_ok=True)

    process = subprocess.Popen(
        ["claude", "--dangerously-skip-permissions", "-p", full_prompt],
        cwd=str(eval_dir),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    start_time = time.monotonic()
    success_seen_at: float | None = None

    while True:
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            transcript = {
                "stdout": stdout,
                "stderr": stderr,
                "returncode": process.returncode,
                "prompt": full_prompt,
                "terminated_after_success": False,
            }
            (eval_dir / "claude-generation.json").write_text(json.dumps(transcript, indent=2))
            if process.returncode != 0:
                details = stderr.strip() or stdout.strip() or "no output"
                raise RuntimeError(f"claude generation failed with exit code {process.returncode}: {details}")
            if not index_path.exists() or not canvas_path.exists():
                raise RuntimeError(f"Expected generated project at {project_dir} with index.html and canvas.min.js")
            return transcript

        generation_complete = index_path.exists() and canvas_path.exists()
        if generation_complete:
            if success_seen_at is None:
                success_seen_at = time.monotonic()
            elif time.monotonic() - success_seen_at >= CLAUDE_SUCCESS_GRACE_SECONDS:
                process.terminate()
                try:
                    stdout, stderr = process.communicate(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
                    stdout, stderr = process.communicate()

                transcript = {
                    "stdout": stdout,
                    "stderr": stderr,
                    "returncode": process.returncode,
                    "prompt": full_prompt,
                    "terminated_after_success": True,
                }
                (eval_dir / "claude-generation.json").write_text(json.dumps(transcript, indent=2))
                return transcript
        else:
            success_seen_at = None

        if time.monotonic() - start_time > CLAUDE_GENERATION_TIMEOUT_SECONDS:
            process.send_signal(signal.SIGINT)
            try:
                stdout, stderr = process.communicate(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
            transcript = {
                "stdout": stdout,
                "stderr": stderr,
                "returncode": process.returncode,
                "prompt": full_prompt,
                "terminated_after_success": False,
                "timeout_seconds": CLAUDE_GENERATION_TIMEOUT_SECONDS,
                "index_exists": index_path.exists(),
                "canvas_exists": canvas_path.exists(),
            }
            (eval_dir / "claude-generation.json").write_text(json.dumps(transcript, indent=2))
            raise RuntimeError(
                f"claude generation timed out after {CLAUDE_GENERATION_TIMEOUT_SECONDS}s"
                f" (index.html: {index_path.exists()}, canvas.min.js: {canvas_path.exists()})"
            )

        time.sleep(1)


def render_screenshots(project_dir: Path, screenshots_dir: Path) -> dict:
    result = run_command(
        ["node", str(RENDER_SCRIPT), "--html", str(project_dir / "index.html"), "--output-dir", str(screenshots_dir)],
        cwd=ROOT / "canvas-app",
    )
    if result.returncode != 0:
        raise RuntimeError(f"screenshot render failed: {result.stderr or result.stdout}")
    metadata = json.loads(result.stdout)
    return metadata


def get_gcloud_value(args: list[str]) -> str:
    result = run_command(["gcloud", *args])
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip() or f"gcloud {' '.join(args)} failed")
    return result.stdout.strip()


def get_vertex_access_token() -> str:
    for env_var in ACCESS_TOKEN_ENV_VARS:
        value = os.environ.get(env_var, "").strip()
        if value:
            return value

    try:
        return get_gcloud_value(["auth", "print-access-token"])
    except RuntimeError as exc:
        message = str(exc)
        if "Reauthentication failed" in message or "cannot prompt during non-interactive execution" in message:
            env_hint = " or ".join(ACCESS_TOKEN_ENV_VARS)
            raise RuntimeError(
                "Could not get a Vertex access token non-interactively. "
                "Run `gcloud auth login` in a normal terminal, or set "
                f"`{env_hint}` before running this script."
            ) from exc
        raise


def load_image_part(path: Path) -> dict:
    mime_type, _ = mimetypes.guess_type(path.name)
    if not mime_type:
        mime_type = "image/png"
    data = base64.b64encode(path.read_bytes()).decode("utf-8")
    return {
        "inlineData": {
            "mimeType": mime_type,
            "data": data,
        }
    }


def build_gemini_request(eval_case: dict, screenshot_metadata: dict) -> dict:
    overview = Path(screenshot_metadata["overview_path"])
    screen_entries = screenshot_metadata["screens"][:5]
    rubric = textwrap.dedent(
        f"""
        You are evaluating the visual look and feel of a mobile app design skill output.

        Original user request:
        {eval_case['prompt']}

        Focus areas:
        {json.dumps(eval_case.get('focus_areas', []), indent=2)}

        Review the overview screenshot first, then the individual screen crops.
        Be critical and specific. Judge the result as a senior mobile product designer reviewing concept work.
        Score these dimensions from 1 to 10:
        - look_and_feel
        - ios_fidelity
        - visual_hierarchy
        - flow_coherence
        - polish

        Return valid JSON only. A score of 7 means solid but not exceptional. Use 9-10 sparingly.
        """
    ).strip()

    schema = {
        "type": "object",
        "properties": {
            "overall_verdict": {"type": "string"},
            "scores": {
                "type": "object",
                "properties": {
                    "look_and_feel": {"type": "integer", "minimum": 1, "maximum": 10},
                    "ios_fidelity": {"type": "integer", "minimum": 1, "maximum": 10},
                    "visual_hierarchy": {"type": "integer", "minimum": 1, "maximum": 10},
                    "flow_coherence": {"type": "integer", "minimum": 1, "maximum": 10},
                    "polish": {"type": "integer", "minimum": 1, "maximum": 10},
                },
                "required": [
                    "look_and_feel",
                    "ios_fidelity",
                    "visual_hierarchy",
                    "flow_coherence",
                    "polish",
                ],
            },
            "strengths": {"type": "array", "items": {"type": "string"}, "minItems": 2},
            "issues": {"type": "array", "items": {"type": "string"}, "minItems": 2},
            "recommended_improvements": {"type": "array", "items": {"type": "string"}, "minItems": 2},
            "screen_notes": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "screen_title": {"type": "string"},
                        "notes": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["screen_title", "notes"],
                },
            },
        },
        "required": [
            "overall_verdict",
            "scores",
            "strengths",
            "issues",
            "recommended_improvements",
            "screen_notes",
        ],
    }

    parts = [{"text": rubric}, load_image_part(overview)]
    for entry in screen_entries:
        parts.append({"text": f"Screen: {entry['title']}"})
        parts.append(load_image_part(Path(entry["path"])))

    return {
        "contents": [
            {
                "role": "USER",
                "parts": parts,
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseJsonSchema": schema,
        },
    }


def run_gemini_review(
    eval_case: dict,
    screenshot_metadata: dict,
    *,
    project_id: str,
    model: str,
    location: str,
) -> dict:
    request_body = build_gemini_request(eval_case, screenshot_metadata)
    token = get_vertex_access_token()
    url = (
        f"https://aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}"
        f"/publishers/google/models/{model}:generateContent"
    )
    req = urllib.request.Request(
        url,
        data=json.dumps(request_body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Gemini review failed: HTTP {exc.code}: {body}") from exc

    text = payload["candidates"][0]["content"]["parts"][0]["text"]
    parsed = json.loads(text)
    return {
        "request": request_body,
        "response": payload,
        "parsed": parsed,
    }


def run_eval_case(eval_case: dict, workspace: Path, *, model: str, project_id: str, location: str, skip_gemini: bool) -> dict:
    eval_id = slugify(eval_case["id"])
    eval_dir = workspace / eval_id
    project_dir = eval_dir / "project"
    screenshots_dir = eval_dir / "screenshots"
    if eval_dir.exists():
        shutil.rmtree(eval_dir)
    eval_dir.mkdir(parents=True)

    setup_files = eval_case.get("setup_files", [])
    if setup_files:
        write_setup_files(eval_dir, setup_files)

    run_claude_generation(eval_case["prompt"], eval_dir, project_dir)
    screenshot_metadata = render_screenshots(project_dir, screenshots_dir)
    (eval_dir / "render-metadata.json").write_text(json.dumps(screenshot_metadata, indent=2))

    gemini_result = None
    if not skip_gemini:
        gemini_result = run_gemini_review(
            eval_case,
            screenshot_metadata,
            project_id=project_id,
            model=model,
            location=location,
        )
        (eval_dir / "gemini-review.json").write_text(json.dumps(gemini_result, indent=2))

    return {
        "id": eval_case["id"],
        "workspace": str(eval_dir),
        "project_dir": str(project_dir),
        "screenshots_dir": str(screenshots_dir),
        "gemini_review": gemini_result["parsed"] if gemini_result else None,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Run mobile-app-designer look-and-feel evals")
    parser.add_argument("--eval-set", default=str(DEFAULT_EVAL_SET), help="Path to eval set JSON")
    parser.add_argument("--workspace", required=True, help="Workspace directory for eval artifacts")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Gemini model on Vertex AI")
    parser.add_argument("--project-id", default=None, help="Google Cloud project ID")
    parser.add_argument("--location", default=DEFAULT_LOCATION, help="Vertex AI location")
    parser.add_argument("--max-evals", type=int, default=None, help="Run only the first N evals")
    parser.add_argument("--skip-gemini", action="store_true", help="Run generation and screenshots only")
    args = parser.parse_args()

    eval_set = json.loads(Path(args.eval_set).read_text())
    evals = eval_set["evals"]
    if args.max_evals is not None:
        evals = evals[: args.max_evals]

    workspace = Path(args.workspace).resolve()
    workspace.mkdir(parents=True, exist_ok=True)

    project_id = args.project_id or os.environ.get("GOOGLE_CLOUD_PROJECT") or get_gcloud_value(["config", "get-value", "project"])

    summary = {
        "skill_name": eval_set["skill_name"],
        "model": args.model,
        "project_id": project_id,
        "location": args.location,
        "results": [],
    }

    for eval_case in evals:
        result = run_eval_case(
            eval_case,
            workspace,
            model=args.model,
            project_id=project_id,
            location=args.location,
            skip_gemini=args.skip_gemini,
        )
        summary["results"].append(result)
        (workspace / "summary.json").write_text(json.dumps(summary, indent=2))

    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
